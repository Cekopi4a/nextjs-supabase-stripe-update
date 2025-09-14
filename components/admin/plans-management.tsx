"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Crown,
  Star,
  Zap,
  Settings,
  Save,
  Users
} from "lucide-react";

interface PlansManagementProps {
  planCounts: Record<string, number>;
  currentPrices: Record<string, number>;
  maxClientsPerPlan: Record<string, number>;
}

export default function PlansManagement({
  planCounts,
  currentPrices,
  maxClientsPerPlan,
}: PlansManagementProps) {
  const [prices, setPrices] = useState(currentPrices);
  const [maxClients, setMaxClients] = useState(maxClientsPerPlan);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to update settings
      console.log("Saving settings:", { prices, maxClients });
      // Add success notification here
    } catch (error) {
      console.error("Error saving settings:", error);
      // Add error notification here
    } finally {
      setIsLoading(false);
    }
  };

  const planData = [
    {
      key: "free",
      name: "Free",
      icon: Settings,
      description: "Базов план за начинаещи треньори",
      color: "bg-gray-100 text-gray-700",
    },
    {
      key: "pro",
      name: "Pro",
      icon: Star,
      description: "Професионален план за опитни треньори",
      color: "bg-blue-100 text-blue-700",
    },
    {
      key: "beast",
      name: "Beast",
      icon: Crown,
      description: "Премиум план за експерти",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Управление на планове</h1>
        <p className="text-muted-foreground">
          Конфигуриране на абонаментни планове и ограничения
        </p>
      </div>

      {/* Current Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        {planData.map((plan) => {
          const Icon = plan.icon;
          const activeCount = planCounts[plan.key] || 0;

          return (
            <Card key={plan.key}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-md ${plan.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {activeCount} активни
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Цена:</span>
                    <span className="font-medium">
                      {prices[plan.key] === 0 ? "Безплатен" : `$${prices[plan.key]}/месец`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Макс. клиенти:</span>
                    <span className="font-medium">{maxClients[plan.key]}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Price Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Ценообразуване
            </CardTitle>
            <CardDescription>
              Задаване на цени за различните планове
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {planData.map((plan) => (
              <div key={plan.key} className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor={`price-${plan.key}`}>{plan.name}</Label>
                <div className="col-span-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id={`price-${plan.key}`}
                      type="number"
                      step="0.01"
                      value={prices[plan.key]}
                      onChange={(e) =>
                        setPrices(prev => ({ ...prev, [plan.key]: parseFloat(e.target.value) }))
                      }
                      className="pl-7"
                      disabled={plan.key === "free"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Client Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ограничения за клиенти
            </CardTitle>
            <CardDescription>
              Максимален брой клиенти за всеки план
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {planData.map((plan) => (
              <div key={plan.key} className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor={`clients-${plan.key}`}>{plan.name}</Label>
                <div className="col-span-2">
                  <Input
                    id={`clients-${plan.key}`}
                    type="number"
                    min="1"
                    value={maxClients[plan.key]}
                    onChange={(e) =>
                      setMaxClients(prev => ({ ...prev, [plan.key]: parseInt(e.target.value) }))
                    }
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Запазване..." : "Запази настройки"}
        </Button>
      </div>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Сравнение на плановете</CardTitle>
          <CardDescription>
            Преглед на функционалностите по планове
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Функционалност</th>
                  <th className="text-center py-2">Free</th>
                  <th className="text-center py-2">Pro</th>
                  <th className="text-center py-2">Beast</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-2">Максимални клиенти</td>
                  <td className="text-center py-2">{maxClients.free}</td>
                  <td className="text-center py-2">{maxClients.pro}</td>
                  <td className="text-center py-2">{maxClients.beast}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Тренировъчни програми</td>
                  <td className="text-center py-2">✓</td>
                  <td className="text-center py-2">✓</td>
                  <td className="text-center py-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Хранителни планове</td>
                  <td className="text-center py-2">✓</td>
                  <td className="text-center py-2">✓</td>
                  <td className="text-center py-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Анализи и статистики</td>
                  <td className="text-center py-2">—</td>
                  <td className="text-center py-2">✓</td>
                  <td className="text-center py-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Приоритетна поддръжка</td>
                  <td className="text-center py-2">—</td>
                  <td className="text-center py-2">—</td>
                  <td className="text-center py-2">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}