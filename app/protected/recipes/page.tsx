import { createSupabaseClient } from "@/utils/supabase/server";
import RecipesPageClient from "./recipes-client";

export default async function RecipesPage() {
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

  // Fetch recipes based on user role
  let recipesQuery = client.from("recipes").select("*");

  if (profile?.role === "trainer") {
    // Trainers see public recipes and their own recipes
    recipesQuery = recipesQuery.or(`is_public.eq.true,created_by.eq.${user?.id}`);
  } else {
    // Clients see public recipes and recipes from their trainer
    const { data: trainerClient } = await client
      .from("trainer_clients")
      .select("trainer_id")
      .eq("client_id", user?.id || "")
      .eq("status", "active")
      .single();

    if (trainerClient?.trainer_id) {
      recipesQuery = recipesQuery.or(`is_public.eq.true,created_by.eq.${trainerClient.trainer_id}`);
    } else {
      recipesQuery = recipesQuery.eq("is_public", true);
    }
  }

  const { data: recipes, error } = await recipesQuery.order("name", { ascending: true });

  if (error) {
    console.error("Error fetching recipes:", error);
  }

  return (
    <RecipesPageClient
      initialRecipes={recipes || []}
      userRole={profile?.role as "trainer" | "client" || "client"}
      userId={user?.id || ""}
    />
  );
}