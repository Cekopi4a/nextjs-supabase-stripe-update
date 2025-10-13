-- Add google_calendar_event_id column to workout_sessions
ALTER TABLE public.workout_sessions
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workout_sessions_calendar_event_id
ON public.workout_sessions(google_calendar_event_id);

-- Add comment
COMMENT ON COLUMN public.workout_sessions.google_calendar_event_id IS 'Google Calendar event ID for synced workouts';
