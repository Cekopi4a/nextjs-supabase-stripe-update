import { createSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") || user.id;
    const days = parseInt(searchParams.get("days") || "30");

    // Check if user has access to this client's data
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // If user is a trainer, verify they have access to this client
    if (profile?.role === "trainer" && clientId !== user.id) {
      const { data: relationship } = await supabase
        .from("trainer_clients")
        .select("id")
        .eq("trainer_id", user.id)
        .eq("client_id", clientId)
        .eq("status", "active")
        .single();

      if (!relationship) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (profile?.role === "client" && clientId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all progress data in parallel
    const [
      workoutStatsResult,
      weightProgressResult,
      habitStatsResult,
      measurementTrendsResult,
      workoutSessionsResult,
      habitLogsResult,
      goalsResult
    ] = await Promise.all([
      // Workout stats using our database function
      supabase.rpc("get_client_workout_stats", {
        p_client_id: clientId,
        p_days: days
      }),

      // Weight progress using our database function
      supabase.rpc("get_weight_progress", {
        p_client_id: clientId
      }),

      // Habit completion stats using our database function
      supabase.rpc("get_habit_completion_stats", {
        p_client_id: clientId,
        p_days: days
      }),

      // Measurement trends for charts
      supabase.rpc("get_measurement_trends", {
        p_client_id: clientId,
        p_days: days
      }),

      // Workout sessions for detailed timeline
      supabase
        .from("workout_sessions")
        .select("id, name, scheduled_date, status, completed_date, planned_duration_minutes")
        .eq("client_id", clientId)
        .gte("scheduled_date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
        .lte("scheduled_date", new Date().toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true }),

      // Habit logs for detailed tracking
      supabase
        .from("habit_logs")
        .select(`
          id,
          log_date,
          completed,
          actual_value,
          client_habits!inner(id, title, icon, color, target_value, unit)
        `)
        .eq("client_id", clientId)
        .gte("log_date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
        .order("log_date", { ascending: true }),

      // Active goals
      supabase
        .from("client_goals")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_achieved", false)
        .order("priority", { ascending: false })
    ]);

    // Check for errors
    if (workoutStatsResult.error) {
      console.error("Error fetching workout stats:", workoutStatsResult.error);
    }
    if (weightProgressResult.error) {
      console.error("Error fetching weight progress:", weightProgressResult.error);
    }
    if (habitStatsResult.error) {
      console.error("Error fetching habit stats:", habitStatsResult.error);
    }
    if (measurementTrendsResult.error) {
      console.error("Error fetching measurement trends:", measurementTrendsResult.error);
    }

    // Process workout sessions for daily chart data
    const workoutsByDate: Record<string, { scheduled: number; completed: number }> = {};
    workoutSessionsResult.data?.forEach((session) => {
      const date = session.scheduled_date;
      if (!workoutsByDate[date]) {
        workoutsByDate[date] = { scheduled: 0, completed: 0 };
      }
      workoutsByDate[date].scheduled += 1;
      if (session.status === "completed") {
        workoutsByDate[date].completed += 1;
      }
    });

    const workoutChartData = Object.entries(workoutsByDate).map(([date, stats]) => ({
      date,
      scheduled: stats.scheduled,
      completed: stats.completed,
    }));

    // Process habit logs for daily completion
    const habitsByDate: Record<string, { total: number; completed: number }> = {};
    habitLogsResult.data?.forEach((log: any) => {
      const date = log.log_date;
      if (!habitsByDate[date]) {
        habitsByDate[date] = { total: 0, completed: 0 };
      }
      habitsByDate[date].total += 1;
      if (log.completed) {
        habitsByDate[date].completed += 1;
      }
    });

    const habitChartData = Object.entries(habitsByDate).map(([date, stats]) => ({
      date,
      total: stats.total,
      completed: stats.completed,
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
    }));

    // Return comprehensive progress data
    return NextResponse.json({
      success: true,
      data: {
        // Summary statistics
        workoutStats: workoutStatsResult.data?.[0] || {
          total_scheduled: 0,
          total_completed: 0,
          completion_rate: 0,
          current_streak: 0,
          best_streak: 0,
        },
        weightProgress: weightProgressResult.data?.[0] || {
          current_weight: null,
          target_weight: null,
          start_weight: null,
          weight_change: null,
          progress_percentage: 0,
          is_on_track: false,
          goal_type: null,
        },
        habitStats: habitStatsResult.data?.[0] || {
          total_habits: 0,
          total_logs: 0,
          completed_logs: 0,
          completion_rate: 0,
          today_completion_rate: 0,
        },

        // Chart data
        workoutChartData,
        habitChartData,
        measurementTrends: measurementTrendsResult.data || [],

        // Raw data
        workoutSessions: workoutSessionsResult.data || [],
        habitLogs: habitLogsResult.data || [],
        activeGoals: goalsResult.data || [],
      },
    });
  } catch (error) {
    console.error("Error fetching progress stats:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
