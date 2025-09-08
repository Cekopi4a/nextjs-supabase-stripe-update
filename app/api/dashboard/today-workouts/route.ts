import { createSupabaseClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Get today's workouts for the current user
    const { data: todayWorkouts, error } = await supabase
      .from("workout_sessions")
      .select(`
        *,
        workout_programs(name, description, trainer_id, profiles!workout_programs_trainer_id_fkey(full_name))
      `)
      .eq("client_id", user.id)
      .eq("scheduled_date", today)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching today's workouts:", error);
      return Response.json({ error: "Failed to fetch workouts" }, { status: 500 });
    }

    return Response.json({ 
      workouts: todayWorkouts || [],
      user_id: user.id,
      today: today 
    });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}