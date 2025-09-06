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

    const { data: exercise, error } = await client
      .from("exercises")
      .select("*")
      .eq("id", params.id)
      .eq("trainer_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching exercise:", error);
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error in GET /api/exercises/[id]:", error);
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
      return NextResponse.json({ error: "Only trainers can update exercises" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      muscle_groups,
      difficulty,
      exercise_type,
      equipment,
      video_url,
      image_url,
    } = body;

    // Validate required fields
    if (!name || !muscle_groups || muscle_groups.length === 0) {
      return NextResponse.json(
        { error: "Name and muscle groups are required" },
        { status: 400 }
      );
    }

    // Update exercise
    const { data: exercise, error } = await client
      .from("exercises")
      .update({
        name,
        description,
        muscle_groups,
        difficulty,
        exercise_type,
        equipment,
        video_url,
        image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("trainer_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating exercise:", error);
      return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error in PUT /api/exercises/[id]:", error);
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
      return NextResponse.json({ error: "Only trainers can delete exercises" }, { status: 403 });
    }

    // Delete exercise
    const { error } = await client
      .from("exercises")
      .delete()
      .eq("id", params.id)
      .eq("trainer_id", user.id);

    if (error) {
      console.error("Error deleting exercise:", error);
      return NextResponse.json({ error: "Failed to delete exercise" }, { status: 500 });
    }

    return NextResponse.json({ message: "Exercise deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/exercises/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}