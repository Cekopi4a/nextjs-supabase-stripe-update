import { createSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TrainerAnalyticsPage from "@/components/fitness/trainer-analytics-page";

export default async function AnalyticsPage() {
  const client = await createSupabaseClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user profile to ensure they're a trainer
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "trainer") {
    redirect("/protected");
  }

  // Get trainer's clients through trainer_clients relationship
  const { data: trainerClients } = await client
    .from("trainer_clients")
    .select(`
      id,
      created_at,
      status,
      profiles!trainer_clients_client_id_fkey(id, full_name, created_at)
    `)
    .eq("trainer_id", user.id)
    .eq("status", "active");

  // Extract client data and count
  const clients = trainerClients?.map(tc => tc.profiles).filter(Boolean) || [];
  const clientsCount = clients.length;

  // Get trainer's workout programs
  const { data: workoutPrograms } = await client
    .from("workout_programs")
    .select(`
      id,
      name,
      created_at,
      is_active,
      client_id,
      profiles!workout_programs_client_id_fkey(full_name)
    `)
    .eq("trainer_id", user.id);

  // Get nutrition plans
  const { data: nutritionPlans } = await client
    .from("nutrition_plans")
    .select(`
      id,
      name,
      created_at,
      is_active,
      client_id,
      profiles!nutrition_plans_client_id_fkey(full_name)
    `)
    .eq("trainer_id", user.id);

  // Get workout sessions (completed workouts)
  const { data: workoutSessions } = await client
    .from("workout_sessions")
    .select(`
      id,
      completed_date,
      status,
      client_id,
      profiles!workout_sessions_client_id_fkey(full_name)
    `)
    .eq("status", "completed")
    .in("client_id", clients.map(c => c.id))
    .order("completed_date", { ascending: false });

  return (
    <TrainerAnalyticsPage
      trainer={profile}
      clients={clients || []}
      clientsCount={clientsCount || 0}
      workoutPrograms={workoutPrograms || []}
      nutritionPlans={nutritionPlans || []}
      workoutCompletions={workoutSessions || []}
    />
  );
}