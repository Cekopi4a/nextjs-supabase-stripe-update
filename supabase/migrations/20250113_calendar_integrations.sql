-- Create calendar_integrations table
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'apple')),

  -- Google Calendar specific
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_calendar_id TEXT,
  google_token_expiry TIMESTAMP WITH TIME ZONE,

  -- Apple Calendar specific (CalDAV)
  caldav_url TEXT,
  caldav_username TEXT,
  caldav_password TEXT,

  -- General settings
  sync_enabled BOOLEAN DEFAULT true,
  auto_sync BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- One integration per provider per user
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own calendar integrations"
  ON public.calendar_integrations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar integrations"
  ON public.calendar_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar integrations"
  ON public.calendar_integrations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar integrations"
  ON public.calendar_integrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_calendar_integrations_user_id ON public.calendar_integrations(user_id);
CREATE INDEX idx_calendar_integrations_provider ON public.calendar_integrations(provider);

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION update_calendar_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calendar_integrations_updated_at
  BEFORE UPDATE ON public.calendar_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_integrations_updated_at();
