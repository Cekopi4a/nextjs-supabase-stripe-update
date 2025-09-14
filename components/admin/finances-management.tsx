"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Mail
} from "lucide-react";

interface FinancesManagementProps {
  monthlyRevenue: Array<{
    month_year: string;
    free_count: number;
    pro_count: number;
    beast_count: number;
    pro_revenue: number;
    beast_revenue: number;
    total_revenue: number;
  }>;
  subscriptionStats: Record<string, number>;
  currentMRR: number;
  recentSubscriptions: Array<{
    id: string;
    plan_type: string;
    status: string;
    created_at: string;
    profiles: {
      full_name: string | null;
      email: string;
    } | null;
  }>;
}

export default function FinancesManagement({
  monthlyRevenue,
  subscriptionStats,
  currentMRR,
  recentSubscriptions,
}: FinancesManagementProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("6");

  const getGrowthPercentage = (currentValue: number, previousValue: number) => {
    if (previousValue === 0) return currentValue > 0 ? 100 : 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG");
  };

  // Calculate growth metrics
  const currentMonth = monthlyRevenue[0];
  const previousMonth = monthlyRevenue[1];
  const revenueGrowth = currentMonth && previousMonth
    ? getGrowthPercentage(currentMonth.total_revenue, previousMonth.total_revenue)
    : 0;

  const totalActiveUsers = Object.values(subscriptionStats).reduce((sum, count) => sum + count, 0);

  const filteredRevenue = monthlyRevenue.slice(0, parseInt(selectedPeriod));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Финансови отчети</h1>
        <p className="text-muted-foreground">
          Преглед на приходи и абонаментни статистики
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-green-100 text-green-700">
                  <DollarSign className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">Месечни приходи</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {formatCurrency(currentMRR)}
              </div>
              <div className="flex items-center text-xs">
                {revenueGrowth > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={revenueGrowth > 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">от предишен месец</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-blue-100 text-blue-700">
                  <Users className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">Активни абонаменти</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveUsers}</div>
            <div className="text-xs text-muted-foreground">
              Платени потребители
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-purple-100 text-purple-700">
                  <CreditCard className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">Pro планове</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.pro || 0}</div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency((subscriptionStats.pro || 0) * 29.99)} MRR
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-amber-100 text-amber-700">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">Beast планове</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.beast || 0}</div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency((subscriptionStats.beast || 0) * 59.99)} MRR
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Месечни приходи
              </CardTitle>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 месеца</SelectItem>
                  <SelectItem value="6">6 месеца</SelectItem>
                  <SelectItem value="12">12 месеца</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Разбивка на приходите по планове за последните месеци
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRevenue.map((month, index) => (
                <div key={month.month_year} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">
                      {month.month_year}
                    </div>
                    <div className="font-bold">
                      {formatCurrency(month.total_revenue)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="text-orange-700 font-medium">{month.free_count}</div>
                      <div className="text-orange-600">Free</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-blue-700 font-medium">{month.pro_count}</div>
                      <div className="text-blue-600">Pro</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-purple-700 font-medium">{month.beast_count}</div>
                      <div className="text-purple-600">Beast</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Последни абонаменти
            </CardTitle>
            <CardDescription>
              Най-новите абонаментни промени
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubscriptions.slice(0, 6).map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-sm">
                      {subscription.profiles?.full_name || "Без име"}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {subscription.profiles?.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(subscription.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        subscription.plan_type === "beast" ? "default" :
                        subscription.plan_type === "pro" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {subscription.plan_type}
                    </Badge>
                    <Badge
                      variant={subscription.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                </div>
              ))}

              {recentSubscriptions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Няма данни за абонаменти
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Детайлна разбивка по месеци</CardTitle>
          <CardDescription>
            Пълна история на приходите по планове
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Месец</TableHead>
                  <TableHead className="text-center">Free</TableHead>
                  <TableHead className="text-center">Pro</TableHead>
                  <TableHead className="text-center">Beast</TableHead>
                  <TableHead className="text-right">Pro приходи</TableHead>
                  <TableHead className="text-right">Beast приходи</TableHead>
                  <TableHead className="text-right">Общо</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyRevenue.map((month) => (
                  <TableRow key={month.month_year}>
                    <TableCell className="font-medium">{month.month_year}</TableCell>
                    <TableCell className="text-center">{month.free_count}</TableCell>
                    <TableCell className="text-center">{month.pro_count}</TableCell>
                    <TableCell className="text-center">{month.beast_count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.pro_revenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.beast_revenue)}</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(month.total_revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {monthlyRevenue.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Няма данни за приходи за показване.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}