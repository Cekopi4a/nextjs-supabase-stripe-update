"use client";

import { cn } from "@/utils/styles";

interface UnreadBadgeProps {
  count: number;
  className?: string;
  max?: number;
}

export function UnreadBadge({ count, className, max = 99 }: UnreadBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <div
      className={cn(
        "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full",
        "bg-gradient-to-br from-red-500 to-red-600 text-white",
        "text-xs font-semibold shadow-md",
        "animate-in zoom-in duration-200",
        className
      )}
    >
      {displayCount}
    </div>
  );
}
