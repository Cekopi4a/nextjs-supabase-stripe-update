import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const client = await createSupabaseClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get exercises for this trainer
    const { data: exercises, error } = await client
      .from("exercises")
      .select("*")
      .eq("trainer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching exercises:", error);
      return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
    }

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error in GET /api/exercises:", error);
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
      return NextResponse.json({ error: "Only trainers can create exercises" }, { status: 403 });
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

    // Create exercise
    const { data: exercise, error } = await client
      .from("exercises")
      .insert({
        trainer_id: user.id,
        name,
        description,
        muscle_groups,
        difficulty: difficulty || "beginner",
        exercise_type: exercise_type || "strength",
        equipment,
        video_url,
        image_url,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating exercise:", error);
      return NextResponse.json({ error: "Failed to create exercise" }, { status: 500 });
    }

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/exercises:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}