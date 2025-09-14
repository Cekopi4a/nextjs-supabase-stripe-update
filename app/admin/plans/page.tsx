import { createSupabaseClient } from "@/utils/supabase/server";
import PlansManagement from "@/components/admin/plans-management";

export default async function PlansPage() {
  const client = await createSupabaseClient();

  // Get subscription statistics
  const { data: subscriptionStats } = await client
    .from("trainer_subscriptions")
    .select("plan_type")
    .eq("status", "active");

  const planCounts = subscriptionStats?.reduce((acc, sub) => {
    acc[sub.plan_type] = (acc[sub.plan_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Get current plan settings
  const { data: planSettings } = await client
    .from("admin_settings")
    .select("setting_value")
    .eq("setting_key", "subscription_prices")
    .single();

  const { data: maxClientsSettings } = await client
    .from("admin_settings")
    .select("setting_value")
    .eq("setting_key", "max_clients_per_plan")
    .single();

  return (
    <PlansManagement
      planCounts={planCounts}
      currentPrices={planSettings?.setting_value || { free: 0, pro: 29.99, beast: 59.99 }}
      maxClientsPerPlan={maxClientsSettings?.setting_value || { free: 3, pro: 15, beast: 100 }}
    />
  );
}