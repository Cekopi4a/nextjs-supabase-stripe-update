import { createServerSupabaseClient } from "@/utils/supabase/server";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL + "/api/calendar/google/callback";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // user_id
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/protected/account?calendar_error=${error}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/protected/account?calendar_error=missing_params", request.url)
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== state) {
      return NextResponse.redirect(
        new URL("/protected/account?calendar_error=unauthorized", request.url)
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user's primary calendar ID
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarList = await calendar.calendarList.list();
    const primaryCalendar = calendarList.data.items?.find(
      (cal) => cal.primary
    );

    if (!primaryCalendar) {
      return NextResponse.redirect(
        new URL("/protected/account?calendar_error=no_calendar", request.url)
      );
    }

    // Store tokens in database
    const { error: dbError } = await supabase
      .from("calendar_integrations")
      .upsert({
        user_id: user.id,
        provider: "google",
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_calendar_id: primaryCalendar.id,
        google_token_expiry: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
        sync_enabled: true,
        auto_sync: true,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.redirect(
        new URL("/protected/account?calendar_error=db_error", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/protected/account?calendar_success=google", request.url)
    );
  } catch (error) {
    console.error("Google Calendar callback error:", error);
    return NextResponse.redirect(
      new URL("/protected/account?calendar_error=callback_failed", request.url)
    );
  }
}
