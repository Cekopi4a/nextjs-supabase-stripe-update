"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { ChatList, Conversation } from "@/components/chat/chat-list";
import { ChatWindow, Message, ChatUser } from "@/components/chat/chat-window";
import { createSupabaseClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/utils/styles";
import { useNotifications } from "@/contexts/notification-context";

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseClient();
  const { refreshUnreadCount } = useNotifications();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }
      setCurrentUserId(user.id);
    };

    getCurrentUser();
  }, [supabase, router]);

  // Setup presence tracking and heartbeat
  useEffect(() => {
    if (!currentUserId) return;

    let heartbeatInterval: NodeJS.Timeout;
    let presenceChannel: RealtimeChannel;

    const setupPresence = async () => {
      // Initial presence update
      await fetch("/api/presence/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_online: true }),
      });

      // Setup heartbeat - update presence every 30 seconds
      heartbeatInterval = setInterval(async () => {
        await fetch("/api/presence/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_online: true }),
        });
      }, 30000);

      // Subscribe to presence changes from database
      presenceChannel = supabase
        .channel("user_presence_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_presence",
          },
          (payload) => {
            const presence = payload.new as { user_id: string; is_online: boolean };
            setOnlineUsers((prev) => {
              const newSet = new Set(prev);
              if (presence.is_online) {
                newSet.add(presence.user_id);
              } else {
                newSet.delete(presence.user_id);
              }
              return newSet;
            });
          }
        )
        .subscribe();

      // Load initial presence status
      const { data: presenceData } = await supabase
        .from("user_presence")
        .select("user_id, is_online")
        .eq("is_online", true);

      if (presenceData) {
        setOnlineUsers(new Set(presenceData.map((p) => p.user_id)));
      }
    };

    setupPresence();

    // Handle visibility change (tab switching, browser closing)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        fetch("/api/presence/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_online: false }),
        });
      } else {
        fetch("/api/presence/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_online: true }),
        });
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        "/api/presence/update",
        JSON.stringify({ is_online: false })
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
      if (presenceChannel) {
        presenceChannel.unsubscribe();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Mark as offline when leaving
      fetch("/api/presence/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_online: false }),
      });
    };
  }, [currentUserId, supabase]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setIsLoadingConversations(true);

      const { data: conversationsData, error } = await supabase
        .from("conversations")
        .select(`
          id,
          trainer_id,
          client_id,
          last_message_at,
          created_at
        `)
        .or(`trainer_id.eq.${currentUserId},client_id.eq.${currentUserId}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Get other user info and last message for each conversation
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherUserId = conv.trainer_id === currentUserId ? conv.client_id : conv.trainer_id;

          // Get other user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", otherUserId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("content, created_at, sender_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_id", currentUserId)
            .is("read_at", null);

          return {
            id: conv.id,
            otherUser: {
              id: profile?.id || otherUserId,
              full_name: profile?.full_name || "Unknown",
              avatar_url: profile?.avatar_url,
              isOnline: onlineUsers.has(otherUserId),
            },
            lastMessage: lastMessage || undefined,
            unreadCount: unreadCount || 0,
            last_message_at: conv.last_message_at,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [currentUserId, supabase, onlineUsers]);

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
  }, [currentUserId, loadConversations]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;

    try {
      setIsLoadingMessages(true);

      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(messagesData || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [supabase]);

  // Load other user info
  const loadOtherUser = useCallback(async (conversationId: string) => {
    if (!conversationId || !currentUserId) return;

    try {
      const { data: conversation } = await supabase
        .from("conversations")
        .select("trainer_id, client_id")
        .eq("id", conversationId)
        .single();

      if (!conversation) return;

      const otherUserId = conversation.trainer_id === currentUserId
        ? conversation.client_id
        : conversation.trainer_id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherUserId)
        .single();

      if (profile) {
        setOtherUser({
          id: profile.id,
          full_name: profile.full_name || "Unknown",
          avatar_url: profile.avatar_url,
          isOnline: onlineUsers.has(profile.id),
        });
      }
    } catch (error) {
      console.error("Error loading other user:", error);
    }
  }, [currentUserId, supabase, onlineUsers]);

  // Handle conversation selection
  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    loadMessages(conversationId);
    loadOtherUser(conversationId);
    // Refresh unread count when opening a conversation
    refreshUnreadCount();
  }, [loadMessages, loadOtherUser, refreshUnreadCount]);

  // Check URL parameter for conversation ID
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam && conversations.length > 0 && !selectedConversationId) {
      const conversation = conversations.find(c => c.id === conversationParam);
      if (conversation) {
        setSelectedConversationId(conversationParam);
        loadMessages(conversationParam);
        loadOtherUser(conversationParam);
        refreshUnreadCount();
      }
    }
  }, [searchParams, conversations, selectedConversationId, loadMessages, loadOtherUser, refreshUnreadCount]);

  // Setup Realtime subscription with Broadcast for instant messaging
  useEffect(() => {
    if (!selectedConversationId || !currentUserId) return;

    // Subscribe to broadcast messages for instant delivery
    const channel = supabase
      .channel(`conversation:${selectedConversationId}`)
      .on(
        "broadcast",
        { event: "new_message" },
        (payload) => {
          const newMessage = payload.payload as Message;
          // Only add if not already in messages (avoid duplicates)
          setMessages((prev) => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on(
        "broadcast",
        { event: "message_read" },
        (payload) => {
          const { message_ids } = payload.payload as { message_ids: string[] };
          setMessages((prev) =>
            prev.map((msg) =>
              message_ids.includes(msg.id)
                ? { ...msg, read_at: new Date().toISOString() }
                : msg
            )
          );
        }
      )
      // Also subscribe to postgres changes as backup
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [selectedConversationId, currentUserId, supabase]);

  // Send message with instant broadcast
  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId || !currentUserId) return;

    try {
      // Insert message to database
      const { data: newMessage, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedConversationId,
          sender_id: currentUserId,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // OPTIMISTIC UPDATE: Add to your own messages IMMEDIATELY
      if (newMessage) {
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }

      // Broadcast message to other users
      if (newMessage && realtimeChannel) {
        await realtimeChannel.send({
          type: "broadcast",
          event: "new_message",
          payload: newMessage,
        });
      }

      // Reload conversations to update last message
      loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  // Mark messages as read with broadcast
  const handleMarkAsRead = async (messageIds: string[]) => {
    if (messageIds.length === 0 || !selectedConversationId) return;

    try {
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", messageIds);

      if (error) throw error;

      // Broadcast read status for instant update
      if (realtimeChannel) {
        await realtimeChannel.send({
          type: "broadcast",
          event: "message_read",
          payload: { message_ids: messageIds },
        });
      }

      // Reload conversations to update unread count
      loadConversations();

      // Refresh global unread count
      refreshUnreadCount();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] max-h-[900px] flex rounded-lg overflow-hidden border border-border shadow-lg bg-background">
      {/* Chat list (left sidebar) */}
      <div className={cn(
        "w-full lg:w-80 xl:w-96 flex-shrink-0",
        selectedConversationId && "hidden lg:block"
      )}>
        <ChatList
          conversations={conversations}
          selectedConversationId={selectedConversationId || undefined}
          onSelectConversation={handleSelectConversation}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Chat window */}
      <div className={cn(
        "flex-1 min-w-0",
        !selectedConversationId && "hidden lg:block"
      )}>
        <ChatWindow
          conversationId={selectedConversationId || undefined}
          messages={messages}
          currentUserId={currentUserId || ""}
          otherUser={otherUser || undefined}
          onSendMessage={handleSendMessage}
          onMarkAsRead={handleMarkAsRead}
          onBack={() => setSelectedConversationId(null)}
          isLoading={isLoadingMessages}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
