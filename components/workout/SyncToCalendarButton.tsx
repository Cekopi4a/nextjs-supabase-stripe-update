"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface SyncToCalendarButtonProps {
  workoutSessionId: string;
  workoutName: string;
  scheduledDate: string;
  isSynced?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export function SyncToCalendarButton({
  workoutSessionId,
  workoutName,
  scheduledDate,
  isSynced = false,
  size = "default",
  variant = "outline",
}: SyncToCalendarButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(isSynced);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/calendar/google/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workout_id: workoutSessionId,
          scheduled_date: scheduledDate,
          workout_name: workoutName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Моля, първо свържете вашия Google Calendar в Настройки");
          return;
        }
        throw new Error(data.error || "Failed to sync");
      }

      setSynced(true);
      toast.success("Тренировката е добавена към календара!", {
        description: data.event_link ? (
          <a
            href={data.event_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Виж в Google Calendar
          </a>
        ) : undefined,
      });
    } catch (error) {
      console.error("Error syncing to calendar:", error);
      toast.error("Грешка при синхронизация с календара");
    } finally {
      setSyncing(false);
    }
  };

  if (synced) {
    return (
      <Button size={size} variant="ghost" disabled>
        <Check className="h-4 w-4 mr-2 text-green-600" />
        Синхронизирано
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleSync}
      disabled={syncing}
    >
      {syncing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Синхронизира...
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4 mr-2" />
          Добави в календар
        </>
      )}
    </Button>
  );
}
