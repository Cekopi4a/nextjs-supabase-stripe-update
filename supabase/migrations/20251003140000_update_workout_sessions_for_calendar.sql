-- Update workout_sessions table to support calendar functionality
-- This migration adds fields needed for scheduling workouts for clients

-- Add client_id column (nullable at first, then we'll make it required after migration)
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Add scheduled_date column for calendar scheduling
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS scheduled_date DATE;

-- Add status column for tracking workout completion
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'planned'
CHECK (status IN ('planned', 'completed', 'skipped'));

-- Add workout_type column
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS workout_type VARCHAR(50);

-- Add exercises JSONB column for storing workout exercises
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS exercises JSONB DEFAULT '[]'::jsonb;

-- Make program_id nullable (workouts can exist without a program)
ALTER TABLE workout_sessions
ALTER COLUMN program_id DROP NOT NULL;

-- Make day_of_week nullable (since we use scheduled_date now)
ALTER TABLE workout_sessions
ALTER COLUMN day_of_week DROP NOT NULL;

-- Add index for client_id for faster queries
CREATE INDEX IF NOT EXISTS idx_workout_sessions_client_id ON workout_sessions(client_id);

-- Add index for scheduled_date for calendar queries
CREATE INDEX IF NOT EXISTS idx_workout_sessions_scheduled_date ON workout_sessions(scheduled_date);

-- Add index for status
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status ON workout_sessions(status);

-- Update RLS policies to support client access
DROP POLICY IF EXISTS "Достъп до тренировки в програмите" ON workout_sessions;

-- Trainers can see all workout sessions for their programs and clients
CREATE POLICY "Треньори виждат тренировките на своите клиенти" ON workout_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
      AND tc.client_id = workout_sessions.client_id
    )
    OR
    EXISTS (
      SELECT 1 FROM workout_programs wp
      WHERE wp.id = workout_sessions.program_id
      AND wp.trainer_id = auth.uid()
    )
  );

-- Trainers can create workout sessions
CREATE POLICY "Треньори създават тренировки" ON workout_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
      AND tc.client_id = workout_sessions.client_id
    )
    OR
    EXISTS (
      SELECT 1 FROM workout_programs wp
      WHERE wp.id = workout_sessions.program_id
      AND wp.trainer_id = auth.uid()
    )
  );

-- Trainers can update workout sessions
CREATE POLICY "Треньори редактират тренировки" ON workout_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
      AND tc.client_id = workout_sessions.client_id
    )
    OR
    EXISTS (
      SELECT 1 FROM workout_programs wp
      WHERE wp.id = workout_sessions.program_id
      AND wp.trainer_id = auth.uid()
    )
  );

-- Trainers can delete workout sessions
CREATE POLICY "Треньори изтриват тренировки" ON workout_sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
      AND tc.client_id = workout_sessions.client_id
    )
    OR
    EXISTS (
      SELECT 1 FROM workout_programs wp
      WHERE wp.id = workout_sessions.program_id
      AND wp.trainer_id = auth.uid()
    )
  );

-- Clients can view their own workout sessions
CREATE POLICY "Клиенти виждат своите тренировки" ON workout_sessions
  FOR SELECT USING (client_id = auth.uid());

-- Clients can update status of their workout sessions
CREATE POLICY "Клиенти обновяват статус на тренировки" ON workout_sessions
  FOR UPDATE USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Add comments
COMMENT ON COLUMN workout_sessions.client_id IS 'Client who will perform this workout';
COMMENT ON COLUMN workout_sessions.scheduled_date IS 'Date when workout is scheduled';
COMMENT ON COLUMN workout_sessions.status IS 'Status of workout: planned, completed, or skipped';
COMMENT ON COLUMN workout_sessions.workout_type IS 'Type of workout: strength, cardio, flexibility, etc.';
COMMENT ON COLUMN workout_sessions.exercises IS 'JSON array of exercises in this workout';
