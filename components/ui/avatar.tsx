"use client";

import { User } from "lucide-react";
import { cn } from "@/utils/styles";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  fallback?: React.ReactNode;
}

export function Avatar({
  src,
  alt = "Профилна снимка",
  size = "md",
  className,
  fallback,
}: AvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const iconSizes = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : fallback ? (
        fallback
      ) : (
        <User size={iconSizes[size]} className="text-gray-400" />
      )}
    </div>
  );
}