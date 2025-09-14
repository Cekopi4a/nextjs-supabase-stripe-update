"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Save,
  AlertTriangle,
  DollarSign,
  Users,
  Shield
} from "lucide-react";

interface AdminSettingsPageProps {
  settings: Array<{
    id: string;
    setting_key: string;
    setting_value: any;
    description: string | null;
    created_at: string;
    updated_at: string;
  }>;
}

export default function AdminSettingsPage({ settings }: AdminSettingsPageProps) {
  const [localSettings, setLocalSettings] = useState(() => {
    const settingsMap: Record<string, any> = {};
    settings.forEach(setting => {
      settingsMap[setting.setting_key] = setting.setting_value;
    });
    return settingsMap;
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to update settings
      console.log("Saving settings:", localSettings);
      // Add success notification here
    } catch (error) {
      console.error("Error saving settings:", error);
      // Add error notification here
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const subscriptionPrices = localSettings.subscription_prices || { free: 0, pro: 29.99, beast: 59.99 };
  const maxClientsPerPlan = localSettings.max_clients_per_plan || { free: 3, pro: 15, beast: 100 };
  const systemMaintenance = localSettings.system_maintenance || { enabled: false, message: "" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Системни настройки</h1>
        <p className="text-muted-foreground">
          Конфигуриране на основните параметри на системата
        </p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Статус на системата
          </CardTitle>
          <CardDescription>
            Управление на системна поддръжка и съобщения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Режим на поддръжка</Label>
              <div className="text-sm text-muted-foreground">
                Временно спиране на достъпа до системата
              </div>
            </div>
            <Switch
              checked={systemMaintenance.enabled}
              onCheckedChange={(checked) =>
                updateSetting("system_maintenance", {
                  ...systemMaintenance,
                  enabled: checked
                })
              }
            />
          </div>

          {systemMaintenance.enabled && (
            <div className="space-y-2">
              <Label htmlFor="maintenance-message">Съобщение за поддръжка</Label>
              <Textarea
                id="maintenance-message"
                value={systemMaintenance.message}
                onChange={(e) =>
                  updateSetting("system_maintenance", {
                    ...systemMaintenance,
                    message: e.target.value
                  })
                }
                placeholder="Съобщение което ще видят потребителите..."
                className="min-h-[80px]"
              />
            </div>
          )}

          {systemMaintenance.enabled && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-700">
                Режим на поддръжка е включен - потребителите няма да могат да достъпят системата
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Ценообразуване
          </CardTitle>
          <CardDescription>
            Настройка на цените за различните планове
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price-free">Free Plan</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="price-free"
                  type="number"
                  step="0.01"
                  value={subscriptionPrices.free}
                  onChange={(e) =>
                    updateSetting("subscription_prices", {
                      ...subscriptionPrices,
                      free: parseFloat(e.target.value)
                    })
                  }
                  className="pl-7"
                  disabled
                />
              </div>
              <Badge variant="outline" className="text-xs">
                Винаги безплатен
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-pro">Pro Plan</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="price-pro"
                  type="number"
                  step="0.01"
                  value={subscriptionPrices.pro}
                  onChange={(e) =>
                    updateSetting("subscription_prices", {
                      ...subscriptionPrices,
                      pro: parseFloat(e.target.value)
                    })
                  }
                  className="pl-7"
                />
              </div>
              <Badge variant="secondary" className="text-xs">
                Месечно
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-beast">Beast Plan</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="price-beast"
                  type="number"
                  step="0.01"
                  value={subscriptionPrices.beast}
                  onChange={(e) =>
                    updateSetting("subscription_prices", {
                      ...subscriptionPrices,
                      beast: parseFloat(e.target.value)
                    })
                  }
                  className="pl-7"
                />
              </div>
              <Badge variant="default" className="text-xs">
                Месечно
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Ограничения за потребители
          </CardTitle>
          <CardDescription>
            Максимален брой клиенти по план
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clients-free">Free Plan</Label>
              <Input
                id="clients-free"
                type="number"
                min="1"
                value={maxClientsPerPlan.free}
                onChange={(e) =>
                  updateSetting("max_clients_per_plan", {
                    ...maxClientsPerPlan,
                    free: parseInt(e.target.value)
                  })
                }
              />
              <div className="text-xs text-muted-foreground">
                клиенти максимум
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clients-pro">Pro Plan</Label>
              <Input
                id="clients-pro"
                type="number"
                min="1"
                value={maxClientsPerPlan.pro}
                onChange={(e) =>
                  updateSetting("max_clients_per_plan", {
                    ...maxClientsPerPlan,
                    pro: parseInt(e.target.value)
                  })
                }
              />
              <div className="text-xs text-muted-foreground">
                клиенти максимум
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clients-beast">Beast Plan</Label>
              <Input
                id="clients-beast"
                type="number"
                min="1"
                value={maxClientsPerPlan.beast}
                onChange={(e) =>
                  updateSetting("max_clients_per_plan", {
                    ...maxClientsPerPlan,
                    beast: parseInt(e.target.value)
                  })
                }
              />
              <div className="text-xs text-muted-foreground">
                клиенти максимум
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Системна информация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Версия</div>
              <div>v1.0.0</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">База данни</div>
              <div>PostgreSQL (Supabase)</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Последна актуализация</div>
              <div>
                {settings.length > 0
                  ? new Date(Math.max(...settings.map(s => new Date(s.updated_at).getTime())))
                      .toLocaleDateString("bg-BG")
                  : "Няма данни"
                }
              </div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Environment</div>
              <div>Production</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Запазване..." : "Запази всички настройки"}
        </Button>
      </div>
    </div>
  );
}