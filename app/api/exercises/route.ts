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

    let exercisesQuery = client.from("exercises").select("*");

    if (profile?.role === "trainer") {
      // Trainers see global exercises (trainer_id is null) and their own exercises
      exercisesQuery = exercisesQuery.or(`trainer_id.is.null,trainer_id.eq.${user.id}`);
    } else {
      // Clients see global exercises and exercises from their trainer
      const { data: trainerClient } = await client
        .from("trainer_clients")
        .select("trainer_id")
        .eq("client_id", user.id)
        .eq("status", "active")
        .single();

      if (trainerClient?.trainer_id) {
        exercisesQuery = exercisesQuery.or(`trainer_id.is.null,trainer_id.eq.${trainerClient.trainer_id}`);
      } else {
        exercisesQuery = exercisesQuery.is("trainer_id", null);
      }
    }

    const { data: exercises, error } = await exercisesQuery.order("name", { ascending: true });

    if (error) {
      console.error("Error fetching exercises:", error);
      return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
    }

    return NextResponse.json(exercises || []);
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
      instructions,
      primary_muscles,
      secondary_muscles,
      level,
      category,
      equipment,
      video_urls,
      custom_images,
    } = body;

    // Validate required fields
    if (!name || !primary_muscles || primary_muscles.length === 0) {
      return NextResponse.json(
        { error: "Name and primary muscles are required" },
        { status: 400 }
      );
    }

    // Generate a unique ID for the exercise
    const exerciseId = `${user.id}_${Date.now()}`;

    // Create exercise
    const { data: exercise, error } = await client
      .from("exercises")
      .insert({
        id: exerciseId,
        name,
        instructions: instructions || [],
        primary_muscles: primary_muscles || [],
        secondary_muscles: secondary_muscles || [],
        level: level || "beginner",
        category: category || "strength",
        equipment: equipment || "body only",
        video_urls: video_urls || [],
        custom_images: custom_images || [],
        images: [], // Keep empty for custom exercises
        trainer_id: user.id,
        force: null,
        mechanic: null,
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