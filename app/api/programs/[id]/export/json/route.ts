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

    // Fetch program with all related data directly
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
      console.error("Program fetch error:", programError);
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    // Check authorization
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
      console.error("Sessions fetch error:", sessionsError);
      console.error("Sessions error details:", JSON.stringify(sessionsError, null, 2));
      console.error("Program ID:", id);
      console.error("User ID:", user.id);
      return NextResponse.json(
        { error: "Failed to fetch sessions", details: sessionsError.message },
        { status: 500 }
      );
    }

    // Fetch exercises for each session
    const sessionsWithExercises = await Promise.all(
      (sessions || []).map(async (session) => {
        const { data: exercises } = await supabase
          .from("workout_exercises")
          .select(`
            *,
            exercise:exercises(*)
          `)
          .eq("session_id", session.id)
          .order("exercise_order", { ascending: true });

        return { ...session, exercises: exercises || [] };
      })
    );

    const programData = {
      ...program,
      sessions: sessionsWithExercises,
    };

    // Add metadata
    const exportData = {
      export_metadata: {
        exported_at: new Date().toISOString(),
        exported_by: user.id,
        app_version: "1.0.0",
        format_version: "1.0.0",
      },
      program: programData,
    };

    // Convert to formatted JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Return JSON file
    return new NextResponse(jsonString, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${programData.name
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}_program.json"`,
      },
    });
  } catch (error) {
    console.error("Error generating JSON:", error);
    return NextResponse.json(
      { error: "Failed to generate JSON file" },
      { status: 500 }
    );
  }
}
