"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  CreditCard,
  Activity,
  TrendingUp,
  Calendar
} from "lucide-react";

interface AdminDashboardProps {
  stats: Array<{
    stat_type: string;
    value: number;
    label: string;
  }>;
  recentTrainers: Array<{
    full_name: string | null;
    email: string;
    created_at: string;
  }>;
  recentClients: Array<{
    full_name: string | null;
    email: string;
    created_at: string;
  }>;
}

export default function AdminDashboard({
  stats,
  recentTrainers,
  recentClients,
}: AdminDashboardProps) {
  const getStatIcon = (statType: string) => {
    switch (statType) {
      case "trainers":
        return UserCheck;
      case "clients":
        return Users;
      case "active_subscriptions":
        return CreditCard;
      case "total_programs":
        return Activity;
      case "total_nutrition_plans":
        return TrendingUp;
      default:
        return Activity;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Общ преглед на системата и статистики
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = getStatIcon(stat.stat_type);
          return (
            <Card key={stat.stat_type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Trainers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Нови треньори
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTrainers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Няма нови треньори
              </p>
            ) : (
              recentTrainers.map((trainer) => (
                <div
                  key={trainer.email}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {trainer.full_name || "Без име"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trainer.email}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {formatDate(trainer.created_at)}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Нови клиенти
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Няма нови клиенти
              </p>
            ) : (
              recentClients.map((client) => (
                <div
                  key={client.email}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {client.full_name || "Без име"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatDate(client.created_at)}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Бързи действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border border-border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium">Управление на потребители</h3>
              <p className="text-sm text-muted-foreground">
                Преглед и редактиране на всички потребители
              </p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium">Финансови отчети</h3>
              <p className="text-sm text-muted-foreground">
                Преглед на приходи и абонаменти
              </p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium">Системни настройки</h3>
              <p className="text-sm text-muted-foreground">
                Конфигуриране на системата
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}