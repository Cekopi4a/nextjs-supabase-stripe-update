import { createSupabaseClient } from "@/utils/supabase/server";
import FoodsPageClient from "./foods-client";

export default async function FoodsPage() {
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

  // Fetch foods based on user role
  let foodsQuery = client.from("foods").select("*");

  if (profile?.role === "trainer") {
    // Trainers see global foods (created_by is null) and their own foods
    foodsQuery = foodsQuery.or(`created_by.is.null,created_by.eq.${user?.id}`);
  } else {
    // Clients see global foods and foods from their trainer
    const { data: trainerClient } = await client
      .from("trainer_clients")
      .select("trainer_id")
      .eq("client_id", user?.id || "")
      .eq("status", "active")
      .single();

    if (trainerClient?.trainer_id) {
      foodsQuery = foodsQuery.or(`created_by.is.null,created_by.eq.${trainerClient.trainer_id}`);
    } else {
      foodsQuery = foodsQuery.is("created_by", null);
    }
  }

  const { data: foods, error } = await foodsQuery.order("name", { ascending: true });

  if (error) {
    console.error("Error fetching foods:", error);
  }

  return (
    <FoodsPageClient
      initialFoods={foods || []}
      userRole={profile?.role as "trainer" | "client" || "client"}
      userId={user?.id || ""}
    />
  );
}