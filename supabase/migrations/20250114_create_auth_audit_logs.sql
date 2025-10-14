-- Create auth_audit_logs table for security auditing
CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_created_at ON auth_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event ON auth_audit_logs(event);

-- Enable Row Level Security
ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own logs
CREATE POLICY "Users can view their own auth logs"
  ON auth_audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert logs (for server-side logging)
CREATE POLICY "Service role can insert auth logs"
  ON auth_audit_logs FOR INSERT
  WITH CHECK (true);

-- Policy: Service role can view all logs (for admin purposes)
CREATE POLICY "Service role can view all auth logs"
  ON auth_audit_logs FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE auth_audit_logs IS 'Logs all authentication events for security auditing and monitoring';
COMMENT ON COLUMN auth_audit_logs.event IS 'Type of auth event: sign_in_success, sign_in_failed, sign_up_success, etc.';
COMMENT ON COLUMN auth_audit_logs.metadata IS 'Additional event metadata stored as JSON';
