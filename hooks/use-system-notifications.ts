"use client";

import { useState, useEffect, useRef } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string; // Changed from link to match DB schema
  is_read: boolean;
  data: Record<string, any>; // Changed from metadata to match DB schema
  created_at: string;
}

export function useSystemNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Load notifications
  const loadNotifications = async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/notifications?limit=10");
      const result = await response.json();

      if (result.success) {
        setNotifications(result.notifications || []);
        setUnreadCount(result.unreadCount || 0);
      } else {
        console.error("Failed to load notifications:", result.error);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        console.error("Failed to mark notification as read:", result.error);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      } else {
        console.error("Failed to mark all as read:", result.error);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications?id=${notificationId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
        // Decrement unread count if notification was unread
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        console.error("Failed to delete notification:", result.error);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Setup real-time subscription
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    // Initial load
    loadNotifications();

    // Setup real-time listener for new notifications
    channelRef.current = supabase
      .channel(`user:${userId}:notifications`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          console.log("🔔 New notification received:", newNotification);

          // Add to notifications list (at the beginning)
          setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);

          // Increment unread count if not read
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          const oldNotification = payload.old as Notification;

          console.log("📝 Notification updated:", {
            old: oldNotification,
            new: updatedNotification,
          });

          // Update notification in list
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );

          // Update unread count if read status changed
          if (!oldNotification.is_read && updatedNotification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedNotification = payload.old as Notification;
          console.log("🗑️ Notification deleted:", deletedNotification);

          // Remove from list
          setNotifications((prev) =>
            prev.filter((n) => n.id !== deletedNotification.id)
          );

          // Update unread count if notification was unread
          if (!deletedNotification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        console.log(
          `📡 Notifications channel status for user ${userId}:`,
          status
        );
      });

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [userId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: loadNotifications,
  };
}
