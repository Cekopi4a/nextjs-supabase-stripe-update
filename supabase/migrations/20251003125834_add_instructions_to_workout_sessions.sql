-- Add instructions column to workout_sessions table
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Add comment to column
COMMENT ON COLUMN workout_sessions.instructions IS 'Optional instructions or notes for the workout session';
