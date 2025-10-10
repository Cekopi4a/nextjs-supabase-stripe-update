"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { useSystemNotifications, Notification } from "@/hooks/use-system-notifications";
import { formatDistanceToNow } from "date-fns";
import { bg } from "date-fns/locale";

interface NotificationsDropdownProps {
  userId: string | null;
}

export function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useSystemNotifications(userId);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate to action_url if exists
    if (notification.action_url) {
      router.push(notification.action_url);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = () => {
    // Return appropriate icon based on notification type
    return "📋"; // Default icon
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "program_created":
        return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
      case "program_updated":
        return "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
      case "workout_created":
      case "workout_updated":
        return "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800";
      case "nutrition_plan_created":
      case "nutrition_plan_updated":
        return "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative h-10 w-10 p-0 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 rounded-xl transition-all duration-200 hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4.5 w-4.5 text-foreground/70" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-lg ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-96 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Известия</h3>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} непрочетен${unreadCount === 1 ? "о" : "и"}`
                  : "Няма нови известия"}
              </p>
            </div>

            {/* Mark all as read button */}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 text-xs hover:bg-blue-50 dark:hover:bg-blue-950/30"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Маркирай всички
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600/30 border-t-blue-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Зареждане...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Няма известия</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-l-4 hover:bg-muted/50 transition-colors cursor-pointer group relative ${
                      notification.is_read
                        ? "border-l-transparent"
                        : "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm text-foreground line-clamp-1">
                            {notification.title}
                          </h4>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3 text-blue-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>

                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: bg,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-border/50">
              <Button
                variant="ghost"
                className="w-full text-sm hover:bg-blue-50 dark:hover:bg-blue-950/30"
                onClick={() => {
                  router.push("/protected/notifications");
                  setIsOpen(false);
                }}
              >
                Виж всички известия
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
