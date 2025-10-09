"use client";

import { Avatar } from "@/components/ui/avatar";

interface TypingIndicatorProps {
  senderName: string;
  senderAvatar?: string;
}

export function TypingIndicator({ senderName, senderAvatar }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar */}
      <Avatar
        src={senderAvatar}
        alt={senderName}
        size="sm"
        className="flex-shrink-0 mt-1"
      />

      {/* Typing bubble */}
      <div className="flex flex-col max-w-[70%] sm:max-w-[60%]">
        {/* Sender name */}
        <span className="text-xs text-muted-foreground mb-1 px-1">
          {senderName}
        </span>

        {/* Typing animation */}
        <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-muted shadow-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
