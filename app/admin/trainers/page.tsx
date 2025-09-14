import { createSupabaseClient } from "@/utils/supabase/server";
import TrainersManagement from "@/components/admin/trainers-management";

export default async function TrainersPage() {
  const client = await createSupabaseClient();

  // Get top trainers by clients function results
  const { data: topTrainers } = await client.rpc('get_top_trainers_by_clients', {
    limit_count: 50
  });

  // Get all trainers with their client counts and subscription info
  const { data: allTrainers } = await client
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      created_at,
      trainer_subscriptions (
        plan_type,
        status,
        created_at
      ),
      trainer_clients!trainer_clients_trainer_id_fkey (
        client_id,
        status
      )
    `)
    .eq("role", "trainer")
    .order("created_at", { ascending: false });

  // Process data to include client counts
  const trainersWithCounts = allTrainers?.map(trainer => ({
    ...trainer,
    active_clients_count: trainer.trainer_clients?.filter(tc => tc.status === 'active').length || 0,
    current_subscription: trainer.trainer_subscriptions?.find(sub => sub.status === 'active') || null
  })) || [];

  return (
    <TrainersManagement
      trainers={trainersWithCounts}
      topTrainers={topTrainers || []}
    />
  );
}