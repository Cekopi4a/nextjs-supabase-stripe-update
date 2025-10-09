import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/utils/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const { exerciseIds } = await req.json();
    
    if (!exerciseIds || !Array.isArray(exerciseIds) || exerciseIds.length === 0) {
      return Response.json({ error: "Invalid exercise IDs" }, { status: 400 });
    }

    // Use service role client to bypass RLS
    const supabase = createSupabaseServiceClient();
    
    const { data: exercises, error } = await supabase
      .from("exercises")
      .select("id, name, primary_muscles, secondary_muscles, equipment, level, images, custom_images, video_urls")
      .in("id", exerciseIds);

    if (error) {
      console.error("Error fetching exercises:", error);
      return Response.json({ error: "Failed to fetch exercises" }, { status: 500 });
    }

    return Response.json(exercises || []);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}