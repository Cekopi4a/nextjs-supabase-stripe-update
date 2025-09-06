import { createSupabaseClient } from "@/utils/supabase/server";
import ExercisesPageClient from "./exercises-client";

export default async function ExercisesPage() {
  const client = await createSupabaseClient();
  
  const {
    data: { user },
  } = await client.auth.getUser();

  // Get user profile to check role
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user?.id || "")
    .single();

  // Fetch existing exercises for this trainer
  const { data: exercises, error } = await client
    .from("exercises")
    .select("*")
    .eq("trainer_id", user?.id || "")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching exercises:", error);
  }

  return (
    <ExercisesPageClient 
      initialExercises={exercises || []} 
      userRole={profile?.role as "trainer" | "client" || "client"}
      userId={user?.id || ""}
    />
  );
}