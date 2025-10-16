// API Route for Habits
// Handles CRUD operations for client habits

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get all active habits for the user
    const { data: habits, error } = await supabase
      .from("client_habits")
      .select("*")
      .eq("client_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching habits:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get today's logs for all habits
    const today = new Date().toISOString().split("T")[0];
    const { data: todayLogs } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("client_id", user.id)
      .eq("log_date", today);

    // Attach today's log to each habit
    const habitsWithLogs = (habits || []).map((habit) => ({
      ...habit,
      todayLog: todayLogs?.find((log) => log.habit_id === habit.id),
    }));

    return NextResponse.json({ success: true, habits: habitsWithLogs });
  } catch (error) {
    console.error("Error in GET /api/habits:", error);
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
    const { habit_type, title, description, target_value, unit, frequency, icon, color } = body;

    // Validate required fields
    if (!habit_type || !title) {
      return NextResponse.json(
        { error: "habit_type and title are required" },
        { status: 400 }
      );
    }

    // Create new habit
    const { data: habit, error } = await supabase
      .from("client_habits")
      .insert({
        client_id: user.id,
        habit_type,
        title,
        description: description || null,
        target_value: target_value ? Number(target_value) : null,
        unit: unit || null,
        frequency: frequency || "daily",
        icon: icon || null,
        color: color || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating habit:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, habit });
  } catch (error) {
    console.error("Error in POST /api/habits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Update habit
    const { data: habit, error } = await supabase
      .from("client_habits")
      .update(updates)
      .eq("id", id)
      .eq("client_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating habit:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, habit });
  } catch (error) {
    console.error("Error in PATCH /api/habits:", error);
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

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from("client_habits")
      .update({ is_active: false })
      .eq("id", id)
      .eq("client_id", user.id);

    if (error) {
      console.error("Error deleting habit:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/habits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
