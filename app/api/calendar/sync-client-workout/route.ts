import { createServerSupabaseClient } from "@/utils/supabase/server";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

/**
 * Automatically sync a workout to client's calendar when assigned by trainer
 * This endpoint is called internally when a trainer assigns a workout to a client
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { client_id, workout_session_id } = body;

    if (!client_id || !workout_session_id) {
      return NextResponse.json(
        { error: "client_id and workout_session_id are required" },
        { status: 400 }
      );
    }

    // Get client's calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from("calendar_integrations")
      .select("*")
      .eq("user_id", client_id)
      .eq("provider", "google")
      .single();

    // If client doesn't have calendar integration or auto_sync is disabled, skip
    if (integrationError || !integration || !integration.sync_enabled || !integration.auto_sync) {
      return NextResponse.json({
        success: false,
        message: "Client calendar not connected or auto-sync disabled",
      });
    }

    // Get workout session details
    const { data: session, error: sessionError } = await supabase
      .from("workout_sessions")
      .select(`
        *,
        workout_programs(name, description),
        workouts(
          name,
          description,
          workout_exercises(
            order_index,
            sets,
            reps,
            exercises(name)
          )
        )
      `)
      .eq("id", workout_session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Workout session not found" },
        { status: 404 }
      );
    }

    // Check if token is expired and refresh if needed
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
        .eq("user_id", client_id)
        .eq("provider", "google");
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Build event description
    let description = session.workouts?.description || "";
    if (session.workouts?.workout_exercises && session.workouts.workout_exercises.length > 0) {
      description += "\n\n✨ Упражнения:\n";
      session.workouts.workout_exercises
        .sort((a, b) => a.order_index - b.order_index)
        .forEach((ex) => {
          description += `• ${ex.exercises.name} - ${ex.sets} x ${ex.reps}\n`;
        });
    }

    if (session.workout_programs) {
      description += `\n📋 Програма: ${session.workout_programs.name}`;
    }

    // Create calendar event
    const startDate = new Date(session.scheduled_date);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1); // Default 1 hour duration

    const event = {
      summary: `🏋️ ${session.name || session.workouts?.name || "Тренировка"}`,
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
      .eq("user_id", client_id)
      .eq("provider", "google");

    // Optionally store the event ID in workout_sessions for future reference
    await supabase
      .from("workout_sessions")
      .update({
        google_calendar_event_id: response.data.id
      })
      .eq("id", workout_session_id);

    return NextResponse.json({
      success: true,
      event_id: response.data.id,
      event_link: response.data.htmlLink,
    });
  } catch (error) {
    console.error("Auto-sync calendar error:", error);
    return NextResponse.json(
      { error: "Failed to auto-sync to calendar" },
      { status: 500 }
    );
  }
}
