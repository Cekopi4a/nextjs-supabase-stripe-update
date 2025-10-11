"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { ChatList, Conversation } from "@/components/chat/chat-list";
import { ChatWindow, Message, ChatUser } from "@/components/chat/chat-window";
import { createSupabaseClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/utils/styles";
import { useNotifications } from "@/contexts/notification-context";
import { getOfflineQueue, OfflineMessageQueue, QueuedMessage } from "@/utils/chat/offline-queue";

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
  const [offlineQueue, setOfflineQueue] = useState<OfflineMessageQueue | null>(null);
  const [offlineQueueLength, setOfflineQueueLength] = useState(0);

  // Get current user и setup offline queue
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }
      setCurrentUserId(user.id);

      // Setup offline queue
      const queue = getOfflineQueue();
      setOfflineQueue(queue);
      setOfflineQueueLength(queue.getQueueLength());

      // Update queue length periodically
      const interval = setInterval(() => {
        setOfflineQueueLength(queue.getQueueLength());
      }, 5000);

      return () => clearInterval(interval);
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

  // Load conversations - оптимизирано с новата database функция
  const loadConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setIsLoadingConversations(true);

      // Използваме новата оптимизирана функция
      const { data: conversationsData, error } = await supabase
        .rpc('get_user_conversations', { user_id: currentUserId });

      if (error) {
        console.error("Database function error:", error);
        // Fallback към стария метод ако функцията не работи
        await loadConversationsFallback();
        return;
      }

      // Transform данните към очаквания формат
      const conversationsWithDetails = (conversationsData || []).map((conv) => ({
        id: conv.id,
        otherUser: {
          id: conv.other_user_id,
          full_name: conv.other_user_name || "Unknown",
          avatar_url: conv.other_user_avatar,
          isOnline: onlineUsers.has(conv.other_user_id),
        },
        lastMessage: conv.last_message_content ? {
          content: conv.last_message_content,
          created_at: conv.last_message_created,
          sender_id: conv.last_message_sender,
        } : undefined,
        unreadCount: conv.unread_count || 0,
        last_message_at: conv.last_message_at,
      }));

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Error loading conversations:", error);
      // Fallback към стария метод
      await loadConversationsFallback();
    } finally {
      setIsLoadingConversations(false);
    }
  }, [currentUserId, onlineUsers]);

  // Fallback метод (старата логика) - само ако новата функция не работи
  const loadConversationsFallback = async () => {
    try {
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
      console.error("Error in fallback conversation loading:", error);
    }
  };

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

      if (!conversation) {
        console.error("Conversation not found:", conversationId);
        return;
      }

      const otherUserId = conversation.trainer_id === currentUserId
        ? conversation.client_id
        : conversation.trainer_id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherUserId)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        // Set fallback user data if profile loading fails
        setOtherUser({
          id: otherUserId,
          full_name: "Unknown User",
          avatar_url: undefined,
          isOnline: onlineUsers.has(otherUserId),
        });
        return;
      }

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
      // Set fallback user data on error
      setOtherUser({
        id: "unknown",
        full_name: "Unknown User",
        avatar_url: undefined,
        isOnline: false,
      });
    }
  }, [currentUserId, supabase, onlineUsers]);

  // Handle conversation selection
  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Reset otherUser to null to show loading state
    setOtherUser(null);
    // Load messages and other user data
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
        // Reset otherUser to null to show loading state
        setOtherUser(null);
        loadMessages(conversationParam);
        loadOtherUser(conversationParam);
        refreshUnreadCount();
      }
    }
  }, [searchParams, conversations, selectedConversationId, loadMessages, loadOtherUser, refreshUnreadCount]);

  // Setup Realtime subscription with Broadcast for instant messaging
  useEffect(() => {
    if (!selectedConversationId || !currentUserId) return;

    // Cleanup previous channel if exists
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      setRealtimeChannel(null);
    }

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
      setRealtimeChannel(null);
    };
  }, [selectedConversationId, currentUserId]); // Премахнах supabase от dependencies

  // Send message with offline queue support
  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId || !currentUserId || !offlineQueue) return;

    // OPTIMISTIC UPDATE: Add temporary message immediately
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversationId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Ако сме online, опитай да изпратиш директно
      if (navigator.onLine) {
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

          // Remove temp message and add real message
          setMessages((prev) => {
            const withoutTemp = prev.filter(msg => msg.id !== tempMessage.id);
            const exists = withoutTemp.some(msg => msg.id === newMessage.id);
            if (exists) return withoutTemp;
            return [...withoutTemp, newMessage];
          });

          // Broadcast message to other users
          if (newMessage && realtimeChannel) {
            try {
              await realtimeChannel.send({
                type: "broadcast",
                event: "new_message",
                payload: newMessage,
              });
            } catch (broadcastError) {
              console.warn("Broadcast failed, but message saved:", broadcastError);
            }
          }

          // Reload conversations to update last message
          loadConversations();
          return;

        } catch (error) {
          console.error("Direct send failed, adding to offline queue:", error);
          // Fall through to offline queue
        }
      }

      // Ако директното изпращане не успее или сме offline, добави в queue
      const queuedMessageId = await offlineQueue.queueMessage(
        selectedConversationId,
        currentUserId,
        content
      );

      // Remove temp message and add queued message indicator
      setMessages((prev) => {
        const withoutTemp = prev.filter(msg => msg.id !== tempMessage.id);
        const queuedMessage: Message = {
          id: queuedMessageId,
          conversation_id: selectedConversationId,
          sender_id: currentUserId,
          content,
          created_at: new Date().toISOString(),
          read_at: null,
        };
        return [...withoutTemp, queuedMessage];
      });

      setOfflineQueueLength(offlineQueue.getQueueLength());

      // Ако сме offline, покажи съобщение
      if (!navigator.onLine) {
        console.log("📴 Message queued for offline delivery");
      }

    } catch (error) {
      // Remove temp message on error
      setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
      console.error("Error sending message:", error);
      throw new Error("Неуспешно изпращане на съобщението. Моля опитайте отново.");
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
    <div className="-m-3 sm:-m-4 lg:-m-6 h-[calc(100vh-0px)] flex flex-col bg-background">
      {/* Offline Queue Indicator */}
      {offlineQueueLength > 0 && (
        <div className="bg-amber-500 text-amber-900 px-4 py-2 text-sm text-center border-b border-amber-600 flex-shrink-0">
          📴 {offlineQueueLength} съобщения чакат за изпращане
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Chat list (left sidebar) */}
        <div className={cn(
          "w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-border overflow-hidden flex flex-col",
          selectedConversationId && "hidden lg:flex"
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
          "flex-1 min-w-0 overflow-hidden",
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
