import { createSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const client = await createSupabaseClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      date,
      weight_kg,
      neck_cm,
      chest_cm,
      waist_cm,
      hips_cm,
      shoulders_cm,
      glutes_cm,
      bicep_left_cm,
      bicep_right_cm,
      forearm_left_cm,
      forearm_right_cm,
      thigh_left_cm,
      thigh_right_cm,
      calf_left_cm,
      calf_right_cm,
      body_fat_percentage,
      muscle_mass_kg,
      notes
    } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // Check if measurement for this date already exists
    const { data: existing } = await client
      .from("body_measurements")
      .select("id")
      .eq("client_id", user.id)
      .eq("date", date)
      .single();

    let result;
    if (existing) {
      // Update existing measurement
      const { data, error } = await client
        .from("body_measurements")
        .update({
          weight_kg: weight_kg || null,
          neck_cm: neck_cm || null,
          chest_cm: chest_cm || null,
          waist_cm: waist_cm || null,
          hips_cm: hips_cm || null,
          shoulders_cm: shoulders_cm || null,
          glutes_cm: glutes_cm || null,
          bicep_left_cm: bicep_left_cm || null,
          bicep_right_cm: bicep_right_cm || null,
          forearm_left_cm: forearm_left_cm || null,
          forearm_right_cm: forearm_right_cm || null,
          thigh_left_cm: thigh_left_cm || null,
          thigh_right_cm: thigh_right_cm || null,
          calf_left_cm: calf_left_cm || null,
          calf_right_cm: calf_right_cm || null,
          body_fat_percentage: body_fat_percentage || null,
          muscle_mass_kg: muscle_mass_kg || null,
          notes: notes || null
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Failed to update measurement" }, { status: 500 });
      }
      result = data;
    } else {
      // Create new measurement
      const { data, error } = await client
        .from("body_measurements")
        .insert({
          client_id: user.id,
          date,
          weight_kg: weight_kg || null,
          neck_cm: neck_cm || null,
          chest_cm: chest_cm || null,
          waist_cm: waist_cm || null,
          hips_cm: hips_cm || null,
          shoulders_cm: shoulders_cm || null,
          glutes_cm: glutes_cm || null,
          bicep_left_cm: bicep_left_cm || null,
          bicep_right_cm: bicep_right_cm || null,
          forearm_left_cm: forearm_left_cm || null,
          forearm_right_cm: forearm_right_cm || null,
          thigh_left_cm: thigh_left_cm || null,
          thigh_right_cm: thigh_right_cm || null,
          calf_left_cm: calf_left_cm || null,
          calf_right_cm: calf_right_cm || null,
          body_fat_percentage: body_fat_percentage || null,
          muscle_mass_kg: muscle_mass_kg || null,
          notes: notes || null
        })
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        return NextResponse.json({ error: "Failed to create measurement" }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      measurement: result
    });

  } catch (error) {
    console.error("Error in body measurement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await createSupabaseClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const limit = searchParams.get("limit");

    let query = client
      .from("body_measurements")
      .select("*")
      .eq("client_id", user.id)
      .order("date", { ascending: false });

    if (date) {
      query = query.eq("date", date);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch measurements" }, { status: 500 });
    }

    return NextResponse.json({ measurements: data || [] });

  } catch (error) {
    console.error("Error fetching body measurements:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await createSupabaseClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const measurementId = searchParams.get("id");

    if (!measurementId) {
      return NextResponse.json({ error: "Measurement ID is required" }, { status: 400 });
    }

    // Verify ownership
    const { data: measurement, error: fetchError } = await client
      .from("body_measurements")
      .select("client_id")
      .eq("id", measurementId)
      .single();

    if (fetchError || !measurement) {
      return NextResponse.json({ error: "Measurement not found" }, { status: 404 });
    }

    if (measurement.client_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete measurement
    const { error: deleteError } = await client
      .from("body_measurements")
      .delete()
      .eq("id", measurementId);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return NextResponse.json({ error: "Failed to delete measurement" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting body measurement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
