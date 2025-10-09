import { createSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// POST - Mark messages as read
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message_ids } = body;

    if (!message_ids || !Array.isArray(message_ids) || message_ids.length === 0) {
      return NextResponse.json(
        { error: "message_ids array is required" },
        { status: 400 }
      );
    }

    // Update messages
    const { data: messages, error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", message_ids)
      .neq("sender_id", user.id) // Only mark messages from others as read
      .is("read_at", null) // Only update if not already read
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updated_count: messages?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
