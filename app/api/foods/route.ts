import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const client = await createSupabaseClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let foodsQuery = client.from("foods").select("*");

    if (profile?.role === "trainer") {
      // Trainers see all foods (global foods where created_by is null and their own foods)
      foodsQuery = foodsQuery.or(`created_by.is.null,created_by.eq.${user.id}`);
    } else {
      // Clients see global foods and foods from their trainer
      const { data: trainerClient } = await client
        .from("trainer_clients")
        .select("trainer_id")
        .eq("client_id", user.id)
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
      return NextResponse.json({ error: "Failed to fetch foods" }, { status: 500 });
    }

    return NextResponse.json(foods || []);
  } catch (error) {
    console.error("Error in GET /api/foods:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await createSupabaseClient();
    const { data: { user } } = await client.auth.getUser();

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
      return NextResponse.json({ error: "Only trainers can create foods" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      brand,
      barcode,
      calories_per_100g,
      protein_per_100g,
      carbs_per_100g,
      fat_per_100g,
      fiber_per_100g,
      sugar_per_100g,
      sodium_per_100g,
      category,
      allergens,
    } = body;

    // Validate required fields
    if (!name || calories_per_100g === undefined || calories_per_100g === null || !category) {
      return NextResponse.json(
        { error: "Name, calories per 100g, and category are required" },
        { status: 400 }
      );
    }

    // Create food
    const { data: food, error } = await client
      .from("foods")
      .insert({
        name,
        brand: brand || null,
        barcode: barcode || null,
        calories_per_100g,
        protein_per_100g: protein_per_100g || 0,
        carbs_per_100g: carbs_per_100g || 0,
        fat_per_100g: fat_per_100g || 0,
        fiber_per_100g: fiber_per_100g || 0,
        sugar_per_100g: sugar_per_100g || 0,
        sodium_per_100g: sodium_per_100g || 0,
        category,
        allergens: allergens || [],
        is_verified: false,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating food:", error);
      return NextResponse.json({
        error: "Failed to create food",
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json(food, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/foods:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}