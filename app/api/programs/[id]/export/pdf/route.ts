import { createSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ProgramPDFDocument } from "@/components/export/program-pdf-document";
import React from "react";

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
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
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

    // Generate PDF using renderToBuffer (works better in Next.js API routes)
    const pdfBuffer = await renderToBuffer(
      React.createElement(ProgramPDFDocument, { program: programData })
    );

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${programData.name
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}_program.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
