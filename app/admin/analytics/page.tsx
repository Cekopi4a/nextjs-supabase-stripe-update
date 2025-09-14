import { createSupabaseClient } from "@/utils/supabase/server";
import AnalyticsPage from "@/components/admin/analytics-page";

export default async function AdminAnalyticsPage() {
  const client = await createSupabaseClient();

  // Get user growth over time
  const { data: userGrowth } = await client
    .from("profiles")
    .select("role, created_at")
    .order("created_at", { ascending: false });

  // Get workout programs statistics
  const { data: programsStats } = await client
    .from("workout_programs")
    .select("created_at, trainer_id, client_id, is_active");

  // Get nutrition plans statistics
  const { data: nutritionStats } = await client
    .from("nutrition_plans")
    .select("created_at, trainer_id, client_id, is_active");

  // Get subscription trends
  const { data: subscriptionTrends } = await client
    .from("trainer_subscriptions")
    .select("plan_type, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <AnalyticsPage
      userGrowth={userGrowth || []}
      programsStats={programsStats || []}
      nutritionStats={nutritionStats || []}
      subscriptionTrends={subscriptionTrends || []}
    />
  );
}