import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import ICAL from "ical.js";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("client_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Get workouts for the specified period
    let query = supabase
      .from("program_days")
      .select(`
        id,
        day_of_week,
        scheduled_date,
        workouts (
          id,
          name,
          description,
          workout_exercises (
            order_index,
            sets,
            reps,
            rest_seconds,
            notes,
            exercises (
              name,
              description,
              muscle_group,
              equipment
            )
          )
        ),
        programs (
          id,
          name,
          client_id
        )
      `)
      .not("workouts", "is", null);

    if (clientId) {
      query = query.eq("programs.client_id", clientId);
    }

    if (startDate) {
      query = query.gte("scheduled_date", startDate);
    }

    if (endDate) {
      query = query.lte("scheduled_date", endDate);
    }

    const { data: programDays, error: queryError } = await query;

    if (queryError) {
      return NextResponse.json(
        { error: "Failed to fetch workouts" },
        { status: 500 }
      );
    }

    // Create iCalendar
    const cal = new ICAL.Component(["vcalendar", [], []]);
    cal.updatePropertyWithValue("prodid", "-//Fitness Training App//EN");
    cal.updatePropertyWithValue("version", "2.0");
    cal.updatePropertyWithValue("calscale", "GREGORIAN");
    cal.updatePropertyWithValue("method", "PUBLISH");
    cal.updatePropertyWithValue("x-wr-calname", "Fitness Training Workouts");
    cal.updatePropertyWithValue("x-wr-timezone", "Europe/Sofia");
    cal.updatePropertyWithValue("x-wr-caldesc", "Your scheduled workouts from Fitness Training App");

    interface ProgramDay {
      id: string;
      scheduled_date: string | null;
      workouts: {
        id: string;
        name: string;
        description?: string;
        workout_exercises?: Array<{
          order_index: number;
          sets: number;
          reps: string;
          rest_seconds?: number;
          notes?: string;
          exercises: {
            name: string;
          };
        }>;
      } | null;
    }

    // Add events for each workout
    programDays?.forEach((day: ProgramDay) => {
      if (!day.workouts || !day.scheduled_date) return;

      const workout = day.workouts;
      const vevent = new ICAL.Component("vevent");

      // Generate unique UID
      const uid = `workout-${day.id}-${workout.id}@fitness-training-app.com`;
      vevent.updatePropertyWithValue("uid", uid);

      // Set summary (title)
      vevent.updatePropertyWithValue("summary", `🏋️ ${workout.name}`);

      // Build description
      let description = workout.description || "";
      if (workout.workout_exercises && workout.workout_exercises.length > 0) {
        description += "\n\nУпражнения:\n";
        workout.workout_exercises
          .sort((a, b) => a.order_index - b.order_index)
          .forEach((we) => {
            description += `• ${we.exercises.name} - ${we.sets} x ${we.reps}`;
            if (we.rest_seconds) {
              description += ` (Почивка: ${we.rest_seconds}s)`;
            }
            if (we.notes) {
              description += ` - ${we.notes}`;
            }
            description += "\n";
          });
      }
      vevent.updatePropertyWithValue("description", description);

      // Set start and end times
      const startDate = new Date(day.scheduled_date);
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1); // Default 1 hour duration

      const dtstart = ICAL.Time.fromJSDate(startDate, false);
      vevent.updatePropertyWithValue("dtstart", dtstart);

      const dtend = ICAL.Time.fromJSDate(endDate, false);
      vevent.updatePropertyWithValue("dtend", dtend);

      // Set created and modified timestamps
      const now = ICAL.Time.now();
      vevent.updatePropertyWithValue("dtstamp", now);
      vevent.updatePropertyWithValue("created", now);
      vevent.updatePropertyWithValue("last-modified", now);

      // Add alarm (reminder 30 minutes before)
      const valarm = new ICAL.Component("valarm");
      valarm.updatePropertyWithValue("action", "DISPLAY");
      valarm.updatePropertyWithValue("description", `Тренировка: ${workout.name}`);
      valarm.updatePropertyWithValue("trigger", ICAL.Duration.fromString("-PT30M"));
      vevent.addSubcomponent(valarm);

      // Add category
      vevent.updatePropertyWithValue("categories", "WORKOUT");

      // Add color (blue)
      vevent.updatePropertyWithValue("color", "blue");

      cal.addSubcomponent(vevent);
    });

    // Generate ICS file content
    const icsContent = cal.toString();

    // Return as downloadable file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="workouts-${new Date().toISOString().split('T')[0]}.ics"`,
      },
    });
  } catch (error) {
    console.error("Apple Calendar export error:", error);
    return NextResponse.json(
      { error: "Failed to export calendar" },
      { status: 500 }
    );
  }
}
