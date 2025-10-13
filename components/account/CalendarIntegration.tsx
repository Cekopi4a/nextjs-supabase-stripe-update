"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Check, Download, Link as LinkIcon, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface CalendarIntegration {
  id: string;
  provider: string;
  sync_enabled: boolean;
  auto_sync: boolean;
  last_synced_at: string | null;
}

export function CalendarIntegration() {
  const [googleIntegration, setGoogleIntegration] = useState<CalendarIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchIntegrations();

    // Check for callback params
    const params = new URLSearchParams(window.location.search);
    const success = params.get("calendar_success");
    const error = params.get("calendar_error");

    if (success === "google") {
      toast.success("Google Calendar е свързан успешно!");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
      fetchIntegrations();
    } else if (error) {
      toast.error(`Грешка при свързване: ${error}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchIntegrations = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("calendar_integrations")
        .select("*")
        .eq("provider", "google")
        .single();

      if (!error && data) {
        setGoogleIntegration(data);
      }
    } catch (err) {
      console.error("Error fetching integrations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    setConnecting(true);
    try {
      const response = await fetch("/api/calendar/google/auth");
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Грешка при генериране на линк за свързване");
      }
    } catch (error) {
      console.error("Error connecting Google Calendar:", error);
      toast.error("Грешка при свързване с Google Calendar");
    } finally {
      setConnecting(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!confirm("Сигурни ли сте, че искате да прекъснете връзката с Google Calendar?")) {
      return;
    }

    setDisconnecting(true);
    try {
      const response = await fetch("/api/calendar/google/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        setGoogleIntegration(null);
        toast.success("Google Calendar е изключен успешно");
      } else {
        toast.error("Грешка при изключване");
      }
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error);
      toast.error("Грешка при изключване на Google Calendar");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleToggleSync = async (enabled: boolean) => {
    if (!googleIntegration) return;

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from("calendar_integrations")
        .update({ sync_enabled: enabled })
        .eq("id", googleIntegration.id);

      if (error) {
        toast.error("Грешка при обновяване на настройките");
      } else {
        setGoogleIntegration({ ...googleIntegration, sync_enabled: enabled });
        toast.success(enabled ? "Синхронизацията е включена" : "Синхронизацията е изключена");
      }
    } catch (error) {
      console.error("Error toggling sync:", error);
      toast.error("Грешка при обновяване на настройките");
    }
  };

  const handleToggleAutoSync = async (enabled: boolean) => {
    if (!googleIntegration) return;

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from("calendar_integrations")
        .update({ auto_sync: enabled })
        .eq("id", googleIntegration.id);

      if (error) {
        toast.error("Грешка при обновяване на настройките");
      } else {
        setGoogleIntegration({ ...googleIntegration, auto_sync: enabled });
        toast.success(enabled ? "Автоматичната синхронизация е включена" : "Автоматичната синхронизация е изключена");
      }
    } catch (error) {
      console.error("Error toggling auto sync:", error);
      toast.error("Грешка при обновяване на настройките");
    }
  };

  const handleExportToApple = async () => {
    try {
      const response = await fetch("/api/calendar/apple/export");

      if (!response.ok) {
        throw new Error("Failed to export calendar");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workouts-${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Календарът е експортиран успешно!");
    } catch (error) {
      console.error("Error exporting to Apple Calendar:", error);
      toast.error("Грешка при експортиране на календара");
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <Calendar className="h-5 w-5 text-gray-500 mr-2" />
        <h2 className="text-xl font-semibold">Интеграция с календар</h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Синхронизирайте вашите тренировки с Google Calendar или експортирайте за Apple Calendar
      </p>

      <div className="space-y-6">
        {/* Google Calendar */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Google Calendar</h3>
                <p className="text-sm text-gray-600">
                  {googleIntegration ? "Свързан" : "Не е свързан"}
                </p>
              </div>
            </div>
            {googleIntegration ? (
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoogleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Изключи
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleGoogleConnect}
                disabled={connecting}
                size="sm"
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Свържи
                  </>
                )}
              </Button>
            )}
          </div>

          {googleIntegration && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-enabled" className="text-sm font-medium">
                  Активна синхронизация
                </Label>
                <Switch
                  id="sync-enabled"
                  checked={googleIntegration.sync_enabled}
                  onCheckedChange={handleToggleSync}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-sync" className="text-sm font-medium">
                  Автоматична синхронизация
                </Label>
                <Switch
                  id="auto-sync"
                  checked={googleIntegration.auto_sync}
                  onCheckedChange={handleToggleAutoSync}
                  disabled={!googleIntegration.sync_enabled}
                />
              </div>

              {googleIntegration.last_synced_at && (
                <p className="text-xs text-gray-500">
                  Последна синхронизация:{" "}
                  {new Date(googleIntegration.last_synced_at).toLocaleString("bg-BG")}
                </p>
              )}
            </div>
          )}

          <Alert className="mt-4">
            <AlertDescription className="text-xs">
              При включена автоматична синхронизация, всяка нова тренировка ще се добавя автоматично към вашия Google Calendar.
            </AlertDescription>
          </Alert>
        </div>

        {/* Apple Calendar */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold">Apple Calendar</h3>
                <p className="text-sm text-gray-600">Експорт в .ics формат</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToApple}
            >
              <Download className="h-4 w-4 mr-1" />
              Експорт
            </Button>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              Изтеглете .ics файл и го импортирайте в Apple Calendar или друго calendar приложение.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </Card>
  );
}
