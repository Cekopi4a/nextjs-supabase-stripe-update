"use client";

import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UnreadBadge } from "./unread-badge";
import { OnlineStatus } from "./online-status";
import { Search, MessageSquare } from "lucide-react";
import { cn } from "@/utils/styles";
import { useState } from "react";

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    full_name: string;
    avatar_url?: string;
    isOnline?: boolean;
  };
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount: number;
  last_message_at?: string;
}

interface ChatListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  isLoading?: boolean;
}

export function ChatList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading = false,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Сега";
    if (minutes < 60) return `${minutes}м`;
    if (hours < 24) return `${hours}ч`;
    if (days < 7) return `${days}д`;
    return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' });
  };

  const truncateMessage = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-background via-primary/5 to-background">
        <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Съобщения
        </h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Търсене..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-border focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? "Няма резултати" : "Няма разговори"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Опитайте с друга търсене"
                : "Започнете разговор с клиент от неговия профил"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.id === selectedConversationId;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <Card
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    "p-3 cursor-pointer transition-all duration-200",
                    "hover:bg-muted/50 hover:shadow-md hover:scale-[1.01]",
                    "active:scale-[0.99]",
                    isSelected && "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 shadow-sm",
                    !isSelected && "border-transparent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar with online status */}
                    <div className="relative flex-shrink-0">
                      <Avatar
                        src={conversation.otherUser.avatar_url}
                        alt={conversation.otherUser.full_name}
                        size="md"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <OnlineStatus
                          isOnline={conversation.otherUser.isOnline || false}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name and time */}
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3
                          className={cn(
                            "text-sm truncate",
                            hasUnread ? "font-bold text-foreground" : "font-medium text-foreground"
                          )}
                        >
                          {conversation.otherUser.full_name}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(conversation.last_message_at)}
                        </span>
                      </div>

                      {/* Last message */}
                      {conversation.lastMessage && (
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              "text-xs truncate",
                              hasUnread
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                            )}
                          >
                            {truncateMessage(conversation.lastMessage.content)}
                          </p>
                          {hasUnread && (
                            <UnreadBadge
                              count={conversation.unreadCount}
                              className="flex-shrink-0"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
