import { createSupabaseClient } from "@/utils/supabase/server";

export type AuthEvent =
  | "sign_in_success"
  | "sign_in_failed"
  | "sign_up_success"
  | "sign_up_failed"
  | "sign_out"
  | "password_reset_request"
  | "password_reset_success"
  | "session_refresh"
  | "oauth_sign_in";

interface AuditLogMetadata {
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
  provider?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Log authentication events for security auditing
 * @param userId - User ID (can be null for failed attempts)
 * @param event - Type of authentication event
 * @param metadata - Additional event metadata
 */
export async function logAuthEvent(
  userId: string | null,
  event: AuthEvent,
  metadata?: AuditLogMetadata
): Promise<void> {
  try {
    const supabase = await createSupabaseClient();

    // Note: You'll need to create this table in your Supabase database
    // See migration SQL in the comment below
    await supabase.from("auth_audit_logs").insert({
      user_id: userId,
      event,
      metadata,
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Don't throw - logging failures shouldn't break auth flow
    console.error("Failed to log auth event:", error);
  }
}

interface AuthLogEntry {
  id: string;
  user_id: string | null;
  event: AuthEvent;
  metadata: AuditLogMetadata | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Get recent auth events for a user
 */
export async function getUserAuthHistory(
  userId: string,
  limit: number = 50
): Promise<AuthLogEntry[]> {
  try {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
      .from("auth_audit_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as AuthLogEntry[];
  } catch (error) {
    console.error("Failed to fetch auth history:", error);
    return [];
  }
}

/**
 * Check for suspicious activity
 * @param userId - User ID to check
 * @param timeWindowMinutes - Time window to check (default: 10 minutes)
 * @returns true if suspicious activity detected
 */
export async function detectSuspiciousActivity(
  userId: string,
  timeWindowMinutes: number = 10
): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();
    const timeAgo = new Date(Date.now() - timeWindowMinutes * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("auth_audit_logs")
      .select("event")
      .eq("user_id", userId)
      .gte("created_at", timeAgo);

    if (error) throw error;

    const failedAttempts = data?.filter((log) =>
      log.event.includes("failed")
    ).length || 0;

    // Consider suspicious if more than 5 failed attempts in time window
    return failedAttempts > 5;
  } catch (error) {
    console.error("Failed to detect suspicious activity:", error);
    return false;
  }
}

/*
 * Database Migration SQL:
 *
 * Run this in your Supabase SQL Editor to create the audit log table:
 *
 * CREATE TABLE IF NOT EXISTS auth_audit_logs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   event TEXT NOT NULL,
 *   metadata JSONB,
 *   ip_address TEXT,
 *   user_agent TEXT,
 *   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
 * CREATE INDEX idx_auth_audit_logs_created_at ON auth_audit_logs(created_at);
 * CREATE INDEX idx_auth_audit_logs_event ON auth_audit_logs(event);
 *
 * -- Enable RLS
 * ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;
 *
 * -- Policy: Users can only view their own logs
 * CREATE POLICY "Users can view their own auth logs"
 *   ON auth_audit_logs FOR SELECT
 *   USING (auth.uid() = user_id);
 *
 * -- Policy: Service role can insert logs
 * CREATE POLICY "Service role can insert auth logs"
 *   ON auth_audit_logs FOR INSERT
 *   WITH CHECK (true);
 */
