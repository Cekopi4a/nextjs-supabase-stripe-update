"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  PieChart
} from "lucide-react";

interface AnalyticsPageProps {
  userGrowth: Array<{
    role: string;
    created_at: string;
  }>;
  programsStats: Array<{
    created_at: string;
    trainer_id: string;
    client_id: string;
    is_active: boolean;
  }>;
  nutritionStats: Array<{
    created_at: string;
    trainer_id: string;
    client_id: string;
    is_active: boolean;
  }>;
  subscriptionTrends: Array<{
    plan_type: string;
    status: string;
    created_at: string;
  }>;
}

export default function AnalyticsPage({
  userGrowth,
  programsStats,
  nutritionStats,
  subscriptionTrends,
}: AnalyticsPageProps) {
  // Process data for charts
  const processMonthlyGrowth = (data: Array<{ created_at: string; role: string }>) => {
    const monthlyData: Record<string, { trainers: number; clients: number }> = {};

    data.forEach((item) => {
      const month = new Date(item.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { trainers: 0, clients: 0 };
      }
      if (item.role === 'trainer') {
        monthlyData[month].trainers++;
      } else if (item.role === 'client') {
        monthlyData[month].clients++;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  };

  const processSubscriptionDistribution = (subscriptions: Array<{ plan_type: string; status: string }>) => {
    const distribution = { free: 0, pro: 0, beast: 0 };
    subscriptions
      .filter(sub => sub.status === 'active')
      .forEach(sub => {
        if (sub.plan_type in distribution) {
          distribution[sub.plan_type as keyof typeof distribution]++;
        }
      });
    return distribution;
  };

  const monthlyGrowth = processMonthlyGrowth(userGrowth);
  const subscriptionDistribution = processSubscriptionDistribution(subscriptionTrends);

  const totalActivePrograms = programsStats.filter(p => p.is_active).length;
  const totalActiveNutrition = nutritionStats.filter(n => n.is_active).length;

  // Calculate conversion rate (clients with trainers / total clients)
  const totalClients = userGrowth.filter(u => u.role === 'client').length;
  const clientsWithPrograms = new Set(programsStats.map(p => p.client_id)).size;
  const conversionRate = totalClients > 0 ? (clientsWithPrograms / totalClients) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Анализи и статистики</h1>
        <p className="text-muted-foreground">
          Детайлни анализи на използването и ръста на платформата
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-blue-100 text-blue-700">
                  <Activity className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">Активни програми</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivePrograms}</div>
            <div className="text-xs text-muted-foreground">
              Тренировъчни програми
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-green-100 text-green-700">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">Хранителни планове</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveNutrition}</div>
            <div className="text-xs text-muted-foreground">
              Активни планове
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-purple-100 text-purple-700">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">Conversion Rate</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              Клиенти с програми
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-orange-100 text-orange-700">
                  <Users className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">Общо потребители</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userGrowth.length}</div>
            <div className="text-xs text-muted-foreground">
              Треньори + клиенти
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Месечен растеж на потребителите
            </CardTitle>
            <CardDescription>
              Брой нови регистрации по месеци
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyGrowth.map(([month, data]) => (
                <div key={month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{month}</span>
                    <span className="text-muted-foreground">
                      {data.trainers + data.clients} общо
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 p-3 rounded-md text-center">
                      <div className="text-blue-700 font-bold">{data.trainers}</div>
                      <div className="text-blue-600 text-xs">Треньори</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-md text-center">
                      <div className="text-green-700 font-bold">{data.clients}</div>
                      <div className="text-green-600 text-xs">Клиенти</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Разпределение по планове
            </CardTitle>
            <CardDescription>
              Активни абонаменти по типове планове
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">
                    {subscriptionDistribution.free}
                  </div>
                  <div className="text-sm text-gray-600">Free</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    $0/месец
                  </Badge>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {subscriptionDistribution.pro}
                  </div>
                  <div className="text-sm text-blue-600">Pro</div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    $29.99/месец
                  </Badge>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">
                    {subscriptionDistribution.beast}
                  </div>
                  <div className="text-sm text-purple-600">Beast</div>
                  <Badge variant="default" className="mt-1 text-xs">
                    $59.99/месец
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Общо активни:</span>
                    <span className="font-medium">
                      {Object.values(subscriptionDistribution).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Платени планове:</span>
                    <span className="font-medium">
                      {subscriptionDistribution.pro + subscriptionDistribution.beast}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion rate:</span>
                    <span className="font-medium">
                      {Object.values(subscriptionDistribution).reduce((a, b) => a + b, 0) > 0
                        ? (((subscriptionDistribution.pro + subscriptionDistribution.beast) /
                           Object.values(subscriptionDistribution).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Активност по програми
          </CardTitle>
          <CardDescription>
            Създадени програми и планове през последните месеци
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Тренировъчни програми</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Общо създадени:</span>
                  <span className="font-medium">{programsStats.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Активни:</span>
                  <span className="font-medium text-green-600">{totalActivePrograms}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Неактивни:</span>
                  <span className="font-medium text-gray-600">
                    {programsStats.length - totalActivePrograms}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Хранителни планове</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Общо създадени:</span>
                  <span className="font-medium">{nutritionStats.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Активни:</span>
                  <span className="font-medium text-green-600">{totalActiveNutrition}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Неактивни:</span>
                  <span className="font-medium text-gray-600">
                    {nutritionStats.length - totalActiveNutrition}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}