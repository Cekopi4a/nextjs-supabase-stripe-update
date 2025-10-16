// API Route for Habit Logs
// Handles logging and retrieving habit completion data

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get("habitId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const date = searchParams.get("date"); // Get logs for a specific date

    let query = supabase
      .from("habit_logs")
      .select("*")
      .eq("client_id", user.id)
      .order("log_date", { ascending: false });

    // Filter by habit if habitId is provided
    if (habitId) {
      query = query.eq("habit_id", habitId);
    }

    // Filter by date range
    if (startDate) {
      query = query.gte("log_date", startDate);
    }
    if (endDate) {
      query = query.lte("log_date", endDate);
    }

    // Filter by specific date
    if (date) {
      query = query.eq("log_date", date);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error("Error fetching habit logs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, logs: logs || [] });
  } catch (error) {
    console.error("Error in GET /api/habit-logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { habit_id, log_date, completed, actual_value, notes } = body;

    // Validate required fields
    if (!habit_id || !log_date) {
      return NextResponse.json(
        { error: "habit_id and log_date are required" },
        { status: 400 }
      );
    }

    // Upsert the log (insert or update if exists for this habit + date)
    const { data: log, error } = await supabase
      .from("habit_logs")
      .upsert(
        {
          habit_id,
          client_id: user.id,
          log_date,
          completed: completed ?? false,
          actual_value: actual_value ? Number(actual_value) : null,
          notes: notes || null,
        },
        { onConflict: "habit_id,log_date" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error creating/updating habit log:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Error in POST /api/habit-logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Delete the log
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("id", id)
      .eq("client_id", user.id);

    if (error) {
      console.error("Error deleting habit log:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/habit-logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
