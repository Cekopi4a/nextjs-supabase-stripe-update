import { createSupabaseClient } from "@/utils/supabase/server";
import AdminDashboard from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const client = await createSupabaseClient();

  // Get dashboard statistics
  const { data: stats } = await client
    .from("admin_dashboard_stats")
    .select("*");

  // Get recent activity (last 10 new registrations)
  const { data: recentTrainers } = await client
    .from("profiles")
    .select("full_name, email, created_at")
    .eq("role", "trainer")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentClients } = await client
    .from("profiles")
    .select("full_name, email, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <AdminDashboard
      stats={stats || []}
      recentTrainers={recentTrainers || []}
      recentClients={recentClients || []}
    />
  );
}