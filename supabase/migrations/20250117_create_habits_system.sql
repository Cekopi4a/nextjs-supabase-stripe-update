-- Habits Tracking System Migration
-- Creates tables for client habit tracking

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Client Habits table (habit templates/definitions)
-- Stores habit definitions that clients create
CREATE TABLE IF NOT EXISTS client_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_type VARCHAR(50) NOT NULL, -- water, sleep, steps, protein, meditation, custom
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_value NUMERIC(10, 2), -- e.g., 8 for water, 10000 for steps
  unit VARCHAR(50), -- e.g., glasses, hours, steps, grams, minutes
  frequency VARCHAR(20) DEFAULT 'daily', -- daily, weekly
  icon VARCHAR(50), -- emoji or icon name
  color VARCHAR(50), -- for UI theming
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

  -- Ensure title is not empty
  CHECK (length(trim(title)) > 0)
);

-- 2. Habit Logs table (daily tracking)
-- Stores daily logs of habit completion
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES client_habits(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL, -- Date of the log (YYYY-MM-DD)
  completed BOOLEAN DEFAULT false,
  actual_value NUMERIC(10, 2), -- Actual value achieved (e.g., 6 glasses instead of 8)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

  -- Unique constraint: one log per habit per day
  UNIQUE(habit_id, log_date)
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_habits_client_id ON client_habits(client_id);
CREATE INDEX IF NOT EXISTS idx_client_habits_is_active ON client_habits(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_client_habits_habit_type ON client_habits(habit_type);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_client_id ON habit_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_log_date ON habit_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed ON habit_logs(completed);

-- 4. Enable Row Level Security
ALTER TABLE client_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for client_habits table

-- Clients can view their own habits
CREATE POLICY "Клиенти виждат собствените си навици"
  ON client_habits
  FOR SELECT
  USING (client_id = auth.uid());

-- Trainers can view habits of their clients
CREATE POLICY "Треньори виждат навиците на техни клиенти"
  ON client_habits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainer_clients tc
      WHERE tc.client_id = client_habits.client_id
      AND tc.trainer_id = auth.uid()
      AND tc.status = 'active'
    )
  );

-- Clients can create their own habits
CREATE POLICY "Клиенти създават собствени навици"
  ON client_habits
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Clients can update their own habits
CREATE POLICY "Клиенти обновяват собствени навици"
  ON client_habits
  FOR UPDATE
  USING (client_id = auth.uid());

-- Clients can delete their own habits
CREATE POLICY "Клиенти изтриват собствени навици"
  ON client_habits
  FOR DELETE
  USING (client_id = auth.uid());

-- 6. RLS Policies for habit_logs table

-- Clients can view their own habit logs
CREATE POLICY "Клиенти виждат собствените си логове"
  ON habit_logs
  FOR SELECT
  USING (client_id = auth.uid());

-- Trainers can view habit logs of their clients
CREATE POLICY "Треньори виждат логовете на техни клиенти"
  ON habit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainer_clients tc
      WHERE tc.client_id = habit_logs.client_id
      AND tc.trainer_id = auth.uid()
      AND tc.status = 'active'
    )
  );

-- Clients can create their own habit logs
CREATE POLICY "Клиенти създават собствени логове"
  ON habit_logs
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Clients can update their own habit logs
CREATE POLICY "Клиенти обновяват собствени логове"
  ON habit_logs
  FOR UPDATE
  USING (client_id = auth.uid());

-- Clients can delete their own habit logs
CREATE POLICY "Клиенти изтриват собствени логове"
  ON habit_logs
  FOR DELETE
  USING (client_id = auth.uid());

-- 7. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_habits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Triggers to automatically update updated_at
CREATE TRIGGER trigger_update_client_habits_updated_at
  BEFORE UPDATE ON client_habits
  FOR EACH ROW
  EXECUTE FUNCTION update_habits_updated_at();

CREATE TRIGGER trigger_update_habit_logs_updated_at
  BEFORE UPDATE ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_habits_updated_at();

-- 9. Function to calculate habit streak
CREATE OR REPLACE FUNCTION calculate_habit_streak(p_habit_id UUID, p_client_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_log BOOLEAN;
BEGIN
  LOOP
    -- Check if there's a completed log for this date
    SELECT EXISTS(
      SELECT 1 FROM habit_logs
      WHERE habit_id = p_habit_id
      AND client_id = p_client_id
      AND log_date = check_date
      AND completed = true
    ) INTO has_log;

    -- If no log found for this date, break the streak
    IF NOT has_log THEN
      EXIT;
    END IF;

    -- Increment streak and move to previous day
    streak := streak + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function to get habit completion rate for a period
CREATE OR REPLACE FUNCTION get_habit_completion_rate(
  p_habit_id UUID,
  p_client_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS NUMERIC AS $$
DECLARE
  total_days INTEGER;
  completed_days INTEGER;
BEGIN
  -- Count total possible days
  total_days := p_days;

  -- Count completed days
  SELECT COUNT(*) INTO completed_days
  FROM habit_logs
  WHERE habit_id = p_habit_id
  AND client_id = p_client_id
  AND log_date >= CURRENT_DATE - p_days
  AND log_date <= CURRENT_DATE
  AND completed = true;

  -- Return completion rate as percentage
  IF total_days = 0 THEN
    RETURN 0;
  END IF;

  RETURN (completed_days::NUMERIC / total_days::NUMERIC) * 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Enable Realtime for tables (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE client_habits;
ALTER PUBLICATION supabase_realtime ADD TABLE habit_logs;

-- 12. Comments for documentation
COMMENT ON TABLE client_habits IS 'Stores client habit definitions and templates';
COMMENT ON TABLE habit_logs IS 'Stores daily habit tracking logs';
COMMENT ON COLUMN client_habits.habit_type IS 'Type of habit: water, sleep, steps, protein, meditation, custom';
COMMENT ON COLUMN client_habits.target_value IS 'Target value to achieve (e.g., 8 glasses, 10000 steps)';
COMMENT ON COLUMN client_habits.frequency IS 'How often to track: daily, weekly';
COMMENT ON COLUMN habit_logs.completed IS 'Whether the habit was completed for the day';
COMMENT ON COLUMN habit_logs.actual_value IS 'Actual value achieved (may be less than target)';
COMMENT ON COLUMN habit_logs.log_date IS 'Date of the habit log (YYYY-MM-DD format)';
