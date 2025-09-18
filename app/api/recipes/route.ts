import { createSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/recipes - Get all recipes
export async function GET() {
  try {
    const client = await createSupabaseClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Build query based on user role
    let recipesQuery = client.from("recipes").select("*");

    if (profile?.role === "trainer") {
      // Trainers see public recipes and their own recipes
      recipesQuery = recipesQuery.or(`is_public.eq.true,created_by.eq.${user.id}`);
    } else {
      // Clients see public recipes and recipes from their trainer
      const { data: trainerClient } = await client
        .from("trainer_clients")
        .select("trainer_id")
        .eq("client_id", user.id)
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
      return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
    }

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error in recipes GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/recipes - Create a new recipe
export async function POST(request: NextRequest) {
  try {
    const client = await createSupabaseClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a trainer
    const { data: profile } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "trainer") {
      return NextResponse.json({ error: "Only trainers can create recipes" }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.ingredients) {
      return NextResponse.json({ error: "Name and ingredients are required" }, { status: 400 });
    }

    const { data: recipe, error } = await client
      .from("recipes")
      .insert([{
        ...body,
        created_by: user.id,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating recipe:", error);
      return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
    }

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error in recipes POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}