import { createSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET - Get total unread message count for current user
export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all conversations for user
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .or(`trainer_id.eq.${user.id},client_id.eq.${user.id}`);

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ unread_count: 0 });
    }

    const conversationIds = conversations.map((c) => c.id);

    // Count unread messages
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ unread_count: count || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
