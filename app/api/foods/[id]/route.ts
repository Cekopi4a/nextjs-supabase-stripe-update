import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await createSupabaseClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: food, error } = await client
      .from("foods")
      .select("*")
      .eq("id", params.id)
      .eq("created_by", user.id)
      .single();

    if (error) {
      console.error("Error fetching food:", error);
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    return NextResponse.json(food);
  } catch (error) {
    console.error("Error in GET /api/foods/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json({ error: "Only trainers can update foods" }, { status: 403 });
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
    if (!name || !calories_per_100g || !category) {
      return NextResponse.json(
        { error: "Name, calories per 100g, and category are required" },
        { status: 400 }
      );
    }

    // Update food
    const { data: food, error } = await client
      .from("foods")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("created_by", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating food:", error);
      return NextResponse.json({ error: "Failed to update food" }, { status: 500 });
    }

    return NextResponse.json(food);
  } catch (error) {
    console.error("Error in PUT /api/foods/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json({ error: "Only trainers can delete foods" }, { status: 403 });
    }

    // Delete food
    const { error } = await client
      .from("foods")
      .delete()
      .eq("id", params.id)
      .eq("created_by", user.id);

    if (error) {
      console.error("Error deleting food:", error);
      return NextResponse.json({ error: "Failed to delete food" }, { status: 500 });
    }

    return NextResponse.json({ message: "Food deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/foods/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}