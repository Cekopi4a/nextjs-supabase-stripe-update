import { createServerSupabaseClient } from "@/utils/supabase/server";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

interface WorkoutEvent {
  workout_id: string;
  program_id: string;
  scheduled_date: string;
  workout_name: string;
  workout_description?: string;
  exercises?: Array<{
    name: string;
    sets: number;
    reps: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { scheduled_date, workout_name, workout_description, exercises } = body as WorkoutEvent;

    // Get calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from("calendar_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 404 }
      );
    }

    if (!integration.sync_enabled) {
      return NextResponse.json(
        { error: "Calendar sync is disabled" },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiry = integration.google_token_expiry
      ? new Date(integration.google_token_expiry)
      : null;

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: integration.google_access_token,
      refresh_token: integration.google_refresh_token,
    });

    // Refresh token if expired
    if (expiry && now >= expiry) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

      // Update tokens in database
      await supabase
        .from("calendar_integrations")
        .update({
          google_access_token: credentials.access_token,
          google_token_expiry: credentials.expiry_date
            ? new Date(credentials.expiry_date).toISOString()
            : null,
        })
        .eq("user_id", user.id)
        .eq("provider", "google");
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Build event description
    let description = workout_description || "";
    if (exercises && exercises.length > 0) {
      description += "\n\nУпражнения:\n";
      exercises.forEach((ex) => {
        description += `• ${ex.name} - ${ex.sets} x ${ex.reps}\n`;
      });
    }

    // Create calendar event
    const startDate = new Date(scheduled_date);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1); // Default 1 hour duration

    const event = {
      summary: `🏋️ ${workout_name}`,
      description: description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "Europe/Sofia",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "Europe/Sofia",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 30 },
          { method: "popup", minutes: 10 },
        ],
      },
      colorId: "9", // Blue color for workouts
    };

    const response = await calendar.events.insert({
      calendarId: integration.google_calendar_id!,
      requestBody: event,
    });

    // Update last synced timestamp
    await supabase
      .from("calendar_integrations")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("provider", "google");

    return NextResponse.json({
      success: true,
      event_id: response.data.id,
      event_link: response.data.htmlLink,
    });
  } catch (error) {
    console.error("Google Calendar sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync to calendar" },
      { status: 500 }
    );
  }
}
