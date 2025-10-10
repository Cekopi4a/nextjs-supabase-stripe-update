-- User Presence Migration
-- Tracks online/offline status of users for real-time chat

-- 1. User Presence table
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_presence_is_online ON user_presence(is_online);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen_at ON user_presence(last_seen_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- All authenticated users can view presence status
CREATE POLICY "Потребители виждат онлайн статус"
  ON user_presence
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own presence
CREATE POLICY "Потребители създават собствен статус"
  ON user_presence
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own presence
CREATE POLICY "Потребители обновяват собствен статус"
  ON user_presence
  FOR UPDATE
  USING (user_id = auth.uid());

-- 5. Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_user_presence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger for updated_at
CREATE TRIGGER trigger_update_user_presence_updated_at
  BEFORE UPDATE ON user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_user_presence_updated_at();

-- 7. Function to mark users as offline if no heartbeat for 2 minutes
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void AS $$
BEGIN
  UPDATE user_presence
  SET is_online = false
  WHERE is_online = true
  AND updated_at < (timezone('utc'::text, now()) - INTERVAL '2 minutes');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enable Realtime for table
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- 9. Comments
COMMENT ON TABLE user_presence IS 'Tracks real-time online/offline status of users';
COMMENT ON COLUMN user_presence.user_id IS 'ID of the user';
COMMENT ON COLUMN user_presence.is_online IS 'Whether the user is currently online';
COMMENT ON COLUMN user_presence.last_seen_at IS 'Timestamp when the user was last seen online';
COMMENT ON COLUMN user_presence.updated_at IS 'Timestamp when the presence was last updated';
