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

  // Fetch exercises based on user role
  let exercisesQuery = client.from("exercises").select("*");

  if (profile?.role === "trainer") {
    // Trainers see global exercises (trainer_id is null) and their own exercises
    exercisesQuery = exercisesQuery.or(`trainer_id.is.null,trainer_id.eq.${user?.id}`);
  } else {
    // Clients see global exercises and exercises from their trainer
    const { data: trainerClient } = await client
      .from("trainer_clients")
      .select("trainer_id")
      .eq("client_id", user?.id || "")
      .eq("status", "active")
      .single();

    if (trainerClient?.trainer_id) {
      exercisesQuery = exercisesQuery.or(`trainer_id.is.null,trainer_id.eq.${trainerClient.trainer_id}`);
    } else {
      exercisesQuery = exercisesQuery.is("trainer_id", null);
    }
  }

  const { data: exercises, error } = await exercisesQuery.order("name", { ascending: true });

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