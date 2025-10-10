-- Notifications System Migration
-- Creates table for system notifications (program updates, workout changes, etc.)

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Notifications table
-- Stores system notifications for users about program/workout/nutrition changes
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'program_created',
    'program_updated',
    'program_deleted',
    'workout_created',
    'workout_updated',
    'workout_deleted',
    'nutrition_plan_created',
    'nutrition_plan_updated',
    'nutrition_plan_deleted',
    'general'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

  -- Ensure title and message are not empty
  CHECK (length(trim(title)) > 0),
  CHECK (length(trim(message)) > 0)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- 3. Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for notifications table

-- Users can view their own notifications
CREATE POLICY "Потребители виждат собствени известия"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Only backend/service role can create notifications
CREATE POLICY "Само система създава известия"
  ON notifications
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role' OR user_id = auth.uid());

-- Users can update (mark as read) their own notifications
CREATE POLICY "Потребители обновяват собствени известия"
  ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Потребители изтриват собствени известия"
  ON notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- 5. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- 7. Function to get unread notifications count for a user
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE notifications.user_id = $1
    AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, updated_at = timezone('utc'::text, now())
  WHERE notifications.user_id = $1
  AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 10. Comments for documentation
COMMENT ON TABLE notifications IS 'System notifications for users about program, workout, and nutrition changes';
COMMENT ON COLUMN notifications.user_id IS 'User who receives this notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification: program_created, program_updated, workout_created, etc.';
COMMENT ON COLUMN notifications.title IS 'Short notification title';
COMMENT ON COLUMN notifications.message IS 'Notification message body';
COMMENT ON COLUMN notifications.link IS 'Optional link to related resource (e.g., /protected/programs/123)';
COMMENT ON COLUMN notifications.is_read IS 'Whether notification has been read';
COMMENT ON COLUMN notifications.metadata IS 'Additional JSON data (program_id, trainer_name, etc.)';
