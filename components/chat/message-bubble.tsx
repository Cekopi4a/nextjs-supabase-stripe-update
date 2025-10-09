"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/utils/styles";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isRead?: boolean;
}

export function MessageBubble({
  content,
  isOwn,
  senderName,
  senderAvatar,
  timestamp,
  isRead = false,
}: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('bg-BG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isOwn && (
        <Avatar
          src={senderAvatar}
          alt={senderName}
          size="sm"
          className="flex-shrink-0 mt-1"
        />
      )}

      {/* Message content */}
      <div
        className={cn(
          "flex flex-col max-w-[70%] sm:max-w-[60%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {/* Sender name (only for other users) */}
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {senderName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md",
            isOwn
              ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>

        {/* Timestamp and read status */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 px-1",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-xs text-muted-foreground">
            {formatTime(timestamp)}
          </span>
          {isOwn && (
            <div className="text-muted-foreground">
              {isRead ? (
                <CheckCheck className="h-3 w-3 text-cyan-500" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
