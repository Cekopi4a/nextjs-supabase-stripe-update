import { createSupabaseClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized", userError }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Get today's workouts for the current user
    const { data: todayWorkouts, error } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("client_id", user.id)
      .eq("scheduled_date", today);

    return Response.json({ 
      user_id: user.id,
      today: today,
      workouts: todayWorkouts || [],
      error: error,
      workout_count: todayWorkouts?.length || 0
    });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}