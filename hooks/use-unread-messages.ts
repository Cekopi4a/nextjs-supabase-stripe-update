"use client";

import { useState, useEffect, useRef } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export function useUnreadMessages(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseClient();
  const conversationIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    const loadUnreadCount = async () => {
      try {
        setIsLoading(true);

        // Get all conversations for this user
        const { data: conversations, error: convError } = await supabase
          .from("conversations")
          .select("id")
          .or(`trainer_id.eq.${userId},client_id.eq.${userId}`);

        if (convError) throw convError;

        if (!conversations || conversations.length === 0) {
          setUnreadCount(0);
          setIsLoading(false);
          return;
        }

        const conversationIds = conversations.map((c) => c.id);
        conversationIdsRef.current = conversationIds;

        // Count unread messages across all conversations
        const { count, error: countError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .in("conversation_id", conversationIds)
          .neq("sender_id", userId)
          .is("read_at", null);

        if (countError) throw countError;

        console.log(`📊 Initial unread count for user ${userId}:`, count || 0);
        setUnreadCount(count || 0);
      } catch (error) {
        console.error("Error loading unread count:", error);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadUnreadCount();

    // Setup real-time listener for ALL user's conversations
    // Subscribe to all new messages for this user
    channel = supabase
      .channel(`user:${userId}:messages`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMessage = payload.new as any;
          console.log("🔔 New message detected:", newMessage);

          // Check if this message is for one of this user's conversations
          // and not sent by this user
          if (newMessage.sender_id !== userId) {
            console.log("✓ Message not sent by current user");

            // Check if conversation belongs to user
            const isUserConversation = conversationIdsRef.current.includes(newMessage.conversation_id);

            if (isUserConversation) {
              // Increment unread count
              console.log("📬 New unread message received! Incrementing count...");
              setUnreadCount((prev) => {
                const newCount = prev + 1;
                console.log(`Unread count: ${prev} → ${newCount}`);
                return newCount;
              });
            } else {
              console.log("✗ Message not in user's conversations");
            }
          } else {
            console.log("✗ Message sent by current user, ignoring");
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const updatedMessage = payload.new as any;
          const oldMessage = payload.old as any;

          console.log("📝 Message updated:", { old: oldMessage, new: updatedMessage });

          // If a message was marked as read
          if (
            !oldMessage.read_at &&
            updatedMessage.read_at &&
            updatedMessage.sender_id !== userId
          ) {
            console.log("✓ Message marked as read");

            // Check if this message belongs to user's conversation
            const isUserConversation = conversationIdsRef.current.includes(updatedMessage.conversation_id);

            if (isUserConversation) {
              // Decrement unread count
              console.log("✅ Message marked as read! Decrementing count...");
              setUnreadCount((prev) => {
                const newCount = Math.max(0, prev - 1);
                console.log(`Unread count: ${prev} → ${newCount}`);
                return newCount;
              });
            } else {
              console.log("✗ Message not in user's conversations");
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Notification channel status for user ${userId}:`, status);
      });

    // Cleanup
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [userId, supabase]);

  // Function to manually refresh unread count
  const refreshUnreadCount = async () => {
    if (!userId) return;

    try {
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .or(`trainer_id.eq.${userId},client_id.eq.${userId}`);

      if (!conversations || conversations.length === 0) {
        setUnreadCount(0);
        return;
      }

      const conversationIds = conversations.map((c) => c.id);

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .neq("sender_id", userId)
        .is("read_at", null);

      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error refreshing unread count:", error);
    }
  };

  // Function to decrease unread count manually (when marking messages as read)
  const decreaseUnreadCount = (amount: number = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - amount));
  };

  return {
    unreadCount,
    isLoading,
    refreshUnreadCount,
    decreaseUnreadCount,
  };
}
