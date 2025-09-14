import { createSupabaseClient } from "@/utils/supabase/server";
import FinancesManagement from "@/components/admin/finances-management";

export default async function FinancesPage() {
  const client = await createSupabaseClient();

  // Get monthly revenue data
  const { data: monthlyRevenue } = await client.rpc('get_monthly_revenue_by_plan', {
    months_back: 12
  });

  // Get current active subscriptions by plan
  const { data: activeSubscriptions } = await client
    .from("trainer_subscriptions")
    .select("plan_type, created_at")
    .eq("status", "active");

  // Get subscription statistics
  const subscriptionStats = activeSubscriptions?.reduce((acc, sub) => {
    acc[sub.plan_type] = (acc[sub.plan_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate current monthly recurring revenue (MRR)
  const prices = { pro: 29.99, beast: 59.99 };
  const currentMRR = (subscriptionStats.pro || 0) * prices.pro +
                     (subscriptionStats.beast || 0) * prices.beast;

  // Get recent subscription activities
  const { data: recentSubscriptions } = await client
    .from("trainer_subscriptions")
    .select(`
      id,
      plan_type,
      status,
      created_at,
      profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <FinancesManagement
      monthlyRevenue={monthlyRevenue || []}
      subscriptionStats={subscriptionStats}
      currentMRR={currentMRR}
      recentSubscriptions={recentSubscriptions || []}
    />
  );
}