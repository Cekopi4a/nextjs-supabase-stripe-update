import { createSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await createSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a trainer and owns this program
    const { data: program, error: programError } = await client
      .from("workout_programs")
      .select("trainer_id")
      .eq("id", id)
      .single();

    if (programError || !program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (program.trainer_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create service role client for deletion
    const { createClient } = await import("@supabase/supabase-js");
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Delete workout sessions first
    const { error: sessionsError } = await serviceClient
      .from("workout_sessions")
      .delete()
      .eq("program_id", id);

    if (sessionsError) {
      console.error("Error deleting workout sessions:", sessionsError);
      return NextResponse.json(
        { error: "Failed to delete workout sessions" },
        { status: 500 }
      );
    }

    // Then delete the program
    const { error: deleteError } = await serviceClient
      .from("workout_programs")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting program:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete program" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete program API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}