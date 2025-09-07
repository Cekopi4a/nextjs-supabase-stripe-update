import { createSupabaseClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId");
    const date = url.searchParams.get("date");

    if (!clientId || !date) {
      return NextResponse.json({ error: "clientId and date are required" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify trainer has access to this client
    const { data: relationship } = await supabase
      .from("trainer_clients")
      .select("*")
      .eq("trainer_id", user.id)
      .eq("client_id", clientId)
      .single();

    if (!relationship) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get meals for specific date
    const { data: meals, error } = await supabase
      .from("daily_meals")
      .select("*")
      .eq("client_id", clientId)
      .eq("scheduled_date", date)
      .order("meal_type");

    if (error) throw error;

    return NextResponse.json({ meals: meals || [] });
  } catch (error) {
    console.error("Error fetching daily meals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const body = await req.json();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify trainer has access to this client
    const { data: relationship } = await supabase
      .from("trainer_clients")
      .select("*")
      .eq("trainer_id", user.id)
      .eq("client_id", body.client_id)
      .single();

    if (!relationship) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Insert new meal
    const { data: meal, error } = await supabase
      .from("daily_meals")
      .insert({
        ...body,
        trainer_id: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ meal });
  } catch (error) {
    console.error("Error creating daily meal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const body = await req.json();
    const { id, ...updateData } = body;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify trainer owns this meal
    const { data: existingMeal } = await supabase
      .from("daily_meals")
      .select("trainer_id")
      .eq("id", id)
      .single();

    if (!existingMeal || existingMeal.trainer_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update meal
    const { data: meal, error } = await supabase
      .from("daily_meals")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ meal });
  } catch (error) {
    console.error("Error updating daily meal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify trainer owns this meal
    const { data: existingMeal } = await supabase
      .from("daily_meals")
      .select("trainer_id")
      .eq("id", id)
      .single();

    if (!existingMeal || existingMeal.trainer_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete meal
    const { error } = await supabase
      .from("daily_meals")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting daily meal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}