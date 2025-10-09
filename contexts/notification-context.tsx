"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { useUnreadMessages } from "@/hooks/use-unread-messages";

interface NotificationContextType {
  unreadMessagesCount: number;
  isLoading: boolean;
  refreshUnreadCount: () => Promise<void>;
  decreaseUnreadCount: (amount?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createSupabaseClient();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };

    getCurrentUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Use the unread messages hook
  const {
    unreadCount,
    isLoading,
    refreshUnreadCount,
    decreaseUnreadCount,
  } = useUnreadMessages(userId);

  return (
    <NotificationContext.Provider
      value={{
        unreadMessagesCount: unreadCount,
        isLoading,
        refreshUnreadCount,
        decreaseUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
