"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck, Trash2, ArrowLeft, Filter } from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { useSystemNotifications } from "@/hooks/use-system-notifications";
import { formatDistanceToNow } from "date-fns";
import { bg } from "date-fns/locale";

export default function NotificationsPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };

    getCurrentUser();
  }, [supabase]);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useSystemNotifications(userId);

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate to action_url if exists
    if (notification.action_url) {
      router.push(notification.action_url);
    }
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">Известия</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} непрочетен${unreadCount === 1 ? "о" : "и"} известие`
              : "Няма нови известия"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Filter */}
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Всички
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Непрочетени ({unreadCount})
          </Button>

          {/* Mark all as read */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Маркирай всички
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600/30 border-t-blue-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-4">Зареждане...</p>
          </div>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === "unread" ? "Няма непрочетени известия" : "Няма известия"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === "unread"
                ? "Всички известия са прочетени"
                : "Известията ще се показват тук"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-6 border-l-4 hover:shadow-md transition-all cursor-pointer group ${
                notification.is_read
                  ? "border-l-transparent opacity-70"
                  : "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${getNotificationColor(
                    notification.type
                  )}`}
                >
                  📋
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: bg,
                      })}
                    </p>

                    {notification.action_url && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Цъкнете за преглед →
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
