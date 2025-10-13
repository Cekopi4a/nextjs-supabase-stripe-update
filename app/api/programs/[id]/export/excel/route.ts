import { createSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

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

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Program Overview
    const overviewData = [
      ["ТРЕНИРОВЪЧНА ПРОГРАМА"],
      [],
      ["Име на програма:", programData.name],
      ["Описание:", programData.description || "N/A"],
      [],
      ["ИНФОРМАЦИЯ ЗА ПРОГРАМАТА"],
      ["Клиент:", programData.client?.full_name || "N/A"],
      ["Email на клиент:", programData.client?.email || "N/A"],
      ["Треньор:", programData.trainer?.full_name || "N/A"],
      ["Email на треньор:", programData.trainer?.email || "N/A"],
      [],
      ["ДЕТАЙЛИ"],
      ["Продължителност:", `${programData.duration_weeks} седмици`],
      ["Ниво на трудност:", programData.difficulty_level],
      ["Тип програма:", programData.program_type],
      ["Начална дата:", new Date(programData.start_date).toLocaleDateString("bg-BG")],
      [
        "Крайна дата:",
        programData.end_date
          ? new Date(programData.end_date).toLocaleDateString("bg-BG")
          : "N/A",
      ],
      ["Статус:", programData.is_active ? "Активна" : "Неактивна"],
      [],
      ["СТАТИСТИКА"],
      ["Брой тренировки:", programData.sessions?.length || 0],
      [
        "Общо упражнения:",
        programData.sessions?.reduce(
          (sum: number, s: { exercises?: unknown[] }) => sum + (s.exercises?.length || 0),
          0
        ) || 0,
      ],
      [],
      ["Експортирано на:", new Date().toLocaleString("bg-BG")],
    ];

    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);

    // Set column widths
    overviewSheet["!cols"] = [{ wch: 25 }, { wch: 50 }];

    XLSX.utils.book_append_sheet(workbook, overviewSheet, "Обща информация");

    // Helper function for day name
    const getDayName = (dayNumber: number) => {
      const days = [
        "Неделя",
        "Понеделник",
        "Вторник",
        "Сряда",
        "Четвъртък",
        "Петък",
        "Събота",
      ];
      return days[dayNumber] || "";
    };

    // Helper function for reps formatting
    const formatReps = (exercise: {
      reps_min?: number;
      reps_max?: number;
      reps?: number;
    }) => {
      if (exercise.reps_min && exercise.reps_max) {
        return `${exercise.reps_min}-${exercise.reps_max}`;
      }
      if (exercise.reps) {
        return exercise.reps.toString();
      }
      return "-";
    };

    // Sheet for each workout session
    programData.sessions?.forEach((session: {
      session_name: string;
      day_of_week: number;
      estimated_duration: number;
      rest_between_sets: number;
      notes?: string;
      exercises?: Array<{
        exercise?: {
          name?: string;
          primary_muscles?: string[];
          equipment?: string;
        };
        sets: number;
        reps_min?: number;
        reps_max?: number;
        reps?: number;
        weight_kg?: number;
        rest_seconds: number;
        rpe?: number;
        notes?: string;
      }>;
    }, index: number) => {
      const sessionData = [
        [`ТРЕНИРОВКА: ${session.session_name}`],
        [],
        ["Ден:", getDayName(session.day_of_week)],
        ["Продължителност:", `~${session.estimated_duration} минути`],
        ["Почивка между сетове:", `${session.rest_between_sets} секунди`],
        ["Бележки:", session.notes || "N/A"],
        [],
        [
          "Упражнение",
          "Мускулни групи",
          "Екипировка",
          "Сетове",
          "Повторения",
          "Тегло (kg)",
          "Почивка (s)",
          "RPE",
          "Бележки",
        ],
      ];

      // Add exercises
      session.exercises?.forEach((ex) => {
        sessionData.push([
          ex.exercise?.name || "Неизвестно",
          ex.exercise?.primary_muscles?.join(", ") || "-",
          ex.exercise?.equipment || "-",
          ex.sets,
          formatReps(ex),
          ex.weight_kg || "-",
          ex.rest_seconds,
          ex.rpe || "-",
          ex.notes || "-",
        ]);
      });

      const sessionSheet = XLSX.utils.aoa_to_sheet(sessionData);

      // Set column widths
      sessionSheet["!cols"] = [
        { wch: 30 }, // Exercise name
        { wch: 20 }, // Muscles
        { wch: 15 }, // Equipment
        { wch: 8 },  // Sets
        { wch: 12 }, // Reps
        { wch: 10 }, // Weight
        { wch: 10 }, // Rest
        { wch: 6 },  // RPE
        { wch: 25 }, // Notes
      ];

      const sheetName = `${index + 1}. ${session.session_name.substring(0, 20)}`;
      XLSX.utils.book_append_sheet(workbook, sessionSheet, sheetName);
    });

    // Generate buffer
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Return Excel file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${programData.name
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}_program.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel file" },
      { status: 500 }
    );
  }
}
