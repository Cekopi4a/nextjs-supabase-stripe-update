import { createSupabaseClient } from "@/utils/supabase/server";
import ClientsManagement from "@/components/admin/clients-management";

export default async function ClientsPage() {
  const client = await createSupabaseClient();

  // Get all clients with their trainer info
  const { data: allClients } = await client
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      created_at,
      trainer_clients!trainer_clients_client_id_fkey (
        trainer_id,
        status,
        created_at,
        profiles!trainer_clients_trainer_id_fkey (
          full_name,
          email
        )
      )
    `)
    .eq("role", "client")
    .order("created_at", { ascending: false });

  // Process clients data
  const clientsWithTrainers = allClients?.map(clientProfile => {
    const activeTrainerRelation = clientProfile.trainer_clients?.find(tc => tc.status === 'active');
    return {
      ...clientProfile,
      trainer_info: activeTrainerRelation ? {
        trainer_id: activeTrainerRelation.trainer_id,
        trainer_name: activeTrainerRelation.profiles?.full_name,
        trainer_email: activeTrainerRelation.profiles?.email,
        relationship_created: activeTrainerRelation.created_at
      } : null
    };
  }) || [];

  // Get statistics
  const totalClients = clientsWithTrainers.length;
  const clientsWithTrainers_count = clientsWithTrainers.filter(c => c.trainer_info).length;
  const clientsWithoutTrainers = totalClients - clientsWithTrainers_count;

  return (
    <ClientsManagement
      clients={clientsWithTrainers}
      stats={{
        total: totalClients,
        withTrainers: clientsWithTrainers_count,
        withoutTrainers: clientsWithoutTrainers
      }}
    />
  );
}