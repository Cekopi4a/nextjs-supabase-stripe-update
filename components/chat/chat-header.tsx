"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OnlineStatus } from "./online-status";
import { ChevronLeft, MoreVertical } from "lucide-react";
import { cn } from "@/utils/styles";

interface ChatHeaderProps {
  userName: string;
  userAvatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  onBack?: () => void;
  onMore?: () => void;
}

export function ChatHeader({
  userName,
  userAvatar,
  isOnline = false,
  lastSeen,
  onBack,
  onMore,
}: ChatHeaderProps) {
  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Сега";
    if (minutes < 60) return `Преди ${minutes} мин`;
    if (hours < 24) return `Преди ${hours} ч`;
    if (days < 7) return `Преди ${days} дни`;
    return date.toLocaleDateString('bg-BG');
  };

  return (
    <div className="border-b border-border bg-gradient-to-r from-background via-muted/5 to-background shadow-sm">
      <div className="flex items-center gap-3 p-4">
        {/* Back button (mobile) */}
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="lg:hidden flex-shrink-0 hover:bg-muted rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* User info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <Avatar
              src={userAvatar}
              alt={userName}
              size="md"
              className="flex-shrink-0"
            />
            <div className="absolute -bottom-0.5 -right-0.5">
              <OnlineStatus isOnline={isOnline} size="sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">
              {userName}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {isOnline ? (
                <span className="text-green-600 font-medium">Онлайн</span>
              ) : lastSeen ? (
                formatLastSeen(lastSeen)
              ) : (
                "Офлайн"
              )}
            </p>
          </div>
        </div>

        {/* More options */}
        {onMore && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMore}
            className="flex-shrink-0 hover:bg-muted rounded-full"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
