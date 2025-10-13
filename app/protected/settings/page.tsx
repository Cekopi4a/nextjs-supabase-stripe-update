"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Calendar, User as UserIcon, Bell } from "lucide-react";
import { CalendarIntegration } from "@/components/account/CalendarIntegration";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const supabase = createSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Не сте влезли в системата.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-6">
        <Settings className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full p-2 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
        <p className="text-gray-600">Управлявайте вашите настройки и предпочитания</p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Календар
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Известия
          </TabsTrigger>
          <TabsTrigger value="profile">
            <UserIcon className="h-4 w-4 mr-2" />
            Профил
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <CalendarIntegration />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Настройки за известия</h2>
            <p className="text-muted-foreground">
              Скоро ще добавим настройки за известия тук.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Профилни настройки</h2>
            <p className="text-muted-foreground mb-4">
              За пълни профилни настройки, посетете страницата Акаунт.
            </p>
            <a
              href="/protected/account"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Към страница Акаунт →
            </a>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
    </div>
  );
}
