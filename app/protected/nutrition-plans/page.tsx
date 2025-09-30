// app/protected/nutrition-plans/page.tsx
import { createSupabaseClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar, Target, Apple } from "lucide-react";
import Link from "next/link";
import { NutritionPlansClient } from "./nutrition-plans-client";

export default async function NutritionPlansPage() {
  const client = await createSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  // Get user profile to determine role
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div>Profile not found</div>;
  }

  // Get nutrition plans based on user role
  let activePlans = [];
  let inactivePlans = [];

  if (profile.role === "trainer") {
    // Trainers see plans they created - fetch both active and inactive
    const { data: active } = await client
      .from("nutrition_plans")
      .select(`
        *,
        profiles!nutrition_plans_client_id_fkey(full_name, email)
      `)
      .eq("trainer_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const { data: inactive } = await client
      .from("nutrition_plans")
      .select(`
        *,
        profiles!nutrition_plans_client_id_fkey(full_name, email)
      `)
      .eq("trainer_id", user.id)
      .eq("is_active", false)
      .order("created_at", { ascending: false });

    activePlans = active || [];
    inactivePlans = inactive || [];
  } else {
    // Clients see only ACTIVE plans assigned to them
    const { data: active } = await client
      .from("nutrition_plans")
      .select(`
        *,
        profiles!nutrition_plans_trainer_id_fkey(full_name, email)
      `)
      .eq("client_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    activePlans = active || [];
  }

  return (
    <NutritionPlansClient
      activePlans={activePlans}
      inactivePlans={inactivePlans}
      userRole={profile.role}
    />
  );
}

