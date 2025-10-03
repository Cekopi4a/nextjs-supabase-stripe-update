import { createSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/recipes/[id] - Get a specific recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await createSupabaseClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: recipe, error } = await client
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching recipe:", error);
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error in recipe GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/recipes/[id] - Update a recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await createSupabaseClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if recipe exists and user owns it
    const { data: existingRecipe, error: fetchError } = await client
      .from("recipes")
      .select("created_by")
      .eq("id", id)
      .single();

    if (fetchError || !existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (existingRecipe.created_by !== user.id) {
      return NextResponse.json({ error: "You can only edit your own recipes" }, { status: 403 });
    }

    const body = await request.json();

    const { data: recipe, error } = await client
      .from("recipes")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating recipe:", error);
      return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error in recipe PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/recipes/[id] - Delete a recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await createSupabaseClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if recipe exists and user owns it
    const { data: existingRecipe, error: fetchError } = await client
      .from("recipes")
      .select("created_by")
      .eq("id", id)
      .single();

    if (fetchError || !existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (existingRecipe.created_by !== user.id) {
      return NextResponse.json({ error: "You can only delete your own recipes" }, { status: 403 });
    }

    const { error } = await client
      .from("recipes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting recipe:", error);
      return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
    }

    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error in recipe DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}