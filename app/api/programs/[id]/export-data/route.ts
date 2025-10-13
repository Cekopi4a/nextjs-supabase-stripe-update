import { createSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch program with all related data
    const { data: program, error: programError } = await supabase
      .from("workout_programs")
      .select(`
        *,
        client:profiles!workout_programs_client_id_fkey(id, full_name, email),
        trainer:profiles!workout_programs_trainer_id_fkey(id, full_name, email)
      `)
      .eq("id", id)
      .single();

    if (programError || !program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    // Check authorization - user must be trainer or client of this program
    if (program.trainer_id !== user.id && program.client_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch workout sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("program_id", id)
      .order("created_at", { ascending: true });

    if (sessionsError) {
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    // Fetch exercises for each session
    const sessionsWithExercises = await Promise.all(
      (sessions || []).map(async (session) => {
        const { data: exercises, error: exercisesError } = await supabase
          .from("workout_exercises")
          .select(`
            *,
            exercise:exercises(*)
          `)
          .eq("session_id", session.id)
          .order("exercise_order", { ascending: true });

        if (exercisesError) {
          console.error("Error fetching exercises:", exercisesError);
          return { ...session, exercises: [] };
        }

        return { ...session, exercises: exercises || [] };
      })
    );

    // Construct full program data
    const fullProgramData = {
      ...program,
      sessions: sessionsWithExercises,
    };

    return NextResponse.json(fullProgramData);
  } catch (error) {
    console.error("Error fetching program data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
