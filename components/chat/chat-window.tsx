"use client";

import { useState, useEffect, useRef } from "react";
import { ChatHeader } from "./chat-header";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { TypingIndicator } from "./typing-indicator";
import { MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/utils/styles";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at?: string | null;
  created_at: string;
}

export interface ChatUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface ChatWindowProps {
  conversationId?: string;
  messages: Message[];
  currentUserId: string;
  otherUser?: ChatUser;
  onSendMessage: (content: string) => Promise<void>;
  onMarkAsRead?: (messageIds: string[]) => Promise<void>;
  onBack?: () => void;
  isLoading?: boolean;
  isTyping?: boolean;
}

export function ChatWindow({
  conversationId,
  messages,
  currentUserId,
  otherUser,
  onSendMessage,
  onMarkAsRead,
  onBack,
  isLoading = false,
  isTyping = false,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Scroll to bottom when messages load or conversation changes
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      // Use setTimeout to ensure DOM is rendered
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
        }
      }, 100);
    }
  }, [conversationId, messages.length]);

  // Auto-scroll to bottom on new messages (smooth scroll)
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 50);
    }
  }, [messages, autoScroll]);

  // Mark messages as read when they appear
  useEffect(() => {
    if (!conversationId || !onMarkAsRead) return;

    const unreadMessages = messages.filter(
      (msg) => msg.sender_id !== currentUserId && !msg.read_at
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map((msg) => msg.id);
      onMarkAsRead(messageIds);
    }
  }, [messages, conversationId, currentUserId, onMarkAsRead]);

  // Detect if user is scrolling up (disable auto-scroll)
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    setAutoScroll(isNearBottom);
  };

  // Empty state (no conversation selected)
  if (!conversationId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/20 to-background p-8 text-center">
        <div className="max-w-md">
          <MessageSquare className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Изберете разговор
          </h2>
          <p className="text-muted-foreground">
            Изберете разговор от лявата страна или започнете нов разговор с клиент
          </p>
        </div>
      </div>
    );
  }

  // Loading state for other user (conversation selected but user data not loaded yet)
  if (!otherUser) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="border-b border-border bg-gradient-to-r from-background via-muted/5 to-background shadow-sm">
          <div className="flex items-center gap-3 p-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Зареждане на данните...</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <ChatHeader
          userName={otherUser.full_name}
          userAvatar={otherUser.avatar_url}
          isOnline={otherUser.isOnline}
          lastSeen={otherUser.lastSeen}
          onBack={onBack}
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <ChatHeader
          userName={otherUser.full_name}
          userAvatar={otherUser.avatar_url}
          isOnline={otherUser.isOnline}
          lastSeen={otherUser.lastSeen}
          onBack={onBack}
        />
      </div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 bg-gradient-to-b from-background via-muted/5 to-background"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Няма съобщения
            </h3>
            <p className="text-sm text-muted-foreground">
              Започнете разговора с първо съобщение
            </p>
          </div>
        ) : (
          <>
            {/* Messages */}
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId;
              const isRead = !!message.read_at;

              return (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  isOwn={isOwn}
                  senderName={isOwn ? "Вие" : otherUser.full_name}
                  senderAvatar={isOwn ? undefined : otherUser.avatar_url}
                  timestamp={message.created_at}
                  isRead={isRead}
                />
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <TypingIndicator
                senderName={otherUser.full_name}
                senderAvatar={otherUser.avatar_url}
              />
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <MessageInput
        onSendMessage={onSendMessage}
        placeholder={`Съобщение до ${otherUser.full_name}...`}
      />
    </div>
  );
}
