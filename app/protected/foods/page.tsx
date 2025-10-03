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

  // Fetch foods
  const { data: rawFoods, error } = await foodsQuery;

  if (error) {
    console.error("Error fetching foods:", error);
  }

  // Sort foods on server the same way as client for hydration consistency
  let foods = rawFoods || [];
  // Същият Collator като в клиента
  const collator = new Intl.Collator("bg", {
    sensitivity: "base",
    usage: "sort",
    numeric: true,
    ignorePunctuation: true,
  });
  if (profile?.role === "trainer" && user?.id) {
    foods = [...foods].sort((a, b) => {
      // First, sort by ownership (own foods first)
      if (a.created_by === user.id && b.created_by !== user.id) return -1;
      if (a.created_by !== user.id && b.created_by === user.id) return 1;
      // Then sort alphabetically
      return collator.compare(a.name, b.name);
    });
  } else {
    // For clients, just sort alphabetically
    foods = [...foods].sort((a, b) => collator.compare(a.name, b.name));
  }

  return (
    <FoodsPageClient
      initialFoods={foods}
      userRole={profile?.role as "trainer" | "client" || "client"}
      userId={user?.id || ""}
    />
  );
}