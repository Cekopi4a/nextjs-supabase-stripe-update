"use client";

import { cn } from "@/utils/styles";

interface OnlineStatusProps {
  isOnline: boolean;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function OnlineStatus({
  isOnline,
  showText = false,
  size = "md",
  className,
}: OnlineStatusProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative">
        <div
          className={cn(
            "rounded-full",
            sizeClasses[size],
            isOnline ? "bg-green-500" : "bg-gray-400"
          )}
        />
        {isOnline && (
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75",
              sizeClasses[size]
            )}
          />
        )}
      </div>
      {showText && (
        <span className="text-xs text-muted-foreground">
          {isOnline ? "Онлайн" : "Офлайн"}
        </span>
      )}
    </div>
  );
}
