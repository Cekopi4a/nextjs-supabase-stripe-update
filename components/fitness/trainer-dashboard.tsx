// components/fitness/trainer-dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Users,
  Calendar,
  TrendingUp,
  Dumbbell,
  Utensils,
  Plus,
  Activity,
  Award,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { createSupabaseClient } from "@/utils/supabase/client";

interface TrainerDashboardProps {
  user: any;
  profile: any;
}

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalPrograms: number;
  totalNutritionPlans: number;
  recentClients: any[];
  upcomingWorkouts: any[];
  subscriptionPlan: string;
  clientLimit: number;
}

export default function TrainerDashboard({ user, profile }: TrainerDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    totalPrograms: 0,
    totalNutritionPlans: 0,
    recentClients: [],
    upcomingWorkouts: [],
    subscriptionPlan: 'free',
    clientLimit: 3
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const supabase = createSupabaseClient();

      // Fetch subscription info
      const { data: subscription } = await supabase
        .from('trainer_subscriptions')
        .select('plan_type, client_limit')
        .eq('trainer_id', user.id)
        .single();

      // Fetch all clients
      const { data: trainerClients } = await supabase
        .from('trainer_clients')
        .select('client_id, status, created_at')
        .eq('trainer_id', user.id);

      const clientIds = trainerClients?.map(tc => tc.client_id) || [];
      const activeClientIds = trainerClients?.filter(tc => tc.status === 'active').map(tc => tc.client_id) || [];

      // Fetch client profiles
      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .in('id', clientIds)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch workout programs
      const { data: programs } = await supabase
        .from('workout_programs')
        .select('id, name, client_id, is_active')
        .eq('trainer_id', user.id);

      // Fetch nutrition plans
      const { data: nutritionPlans } = await supabase
        .from('nutrition_plans')
        .select('id, name, client_id')
        .eq('trainer_id', user.id);

      // Combine data
      const recentClientsWithDetails = clientProfiles?.map(client => {
        const tc = trainerClients?.find(tc => tc.client_id === client.id);
        const program = programs?.find(p => p.client_id === client.id && p.is_active);
        const nutritionPlan = nutritionPlans?.find(np => np.client_id === client.id);

        return {
          ...client,
          status: tc?.status || 'inactive',
          joined: tc?.created_at,
          hasProgram: !!program,
          hasNutritionPlan: !!nutritionPlan
        };
      }) || [];

      setStats({
        totalClients: clientIds.length,
        activeClients: activeClientIds.length,
        totalPrograms: programs?.length || 0,
        totalNutritionPlans: nutritionPlans?.length || 0,
        recentClients: recentClientsWithDetails,
        upcomingWorkouts: [],
        subscriptionPlan: subscription?.plan_type || 'free',
        clientLimit: subscription?.client_limit || 3
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadge = (plan: string) => {
    const badges = {
      free: { label: 'Безплатен', color: 'bg-gray-100 text-gray-800' },
      pro: { label: 'Pro', color: 'bg-blue-100 text-blue-800' },
      beast: { label: 'Beast', color: 'bg-purple-100 text-purple-800' }
    };
    return badges[plan as keyof typeof badges] || badges.free;
  };

  const planBadge = getPlanBadge(stats.subscriptionPlan);
  const capacityPercent = stats.clientLimit ? (stats.activeClients / stats.clientLimit) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Зареждане на dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 lg:p-8 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-4 border-white/30 shadow-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-4 border-white/30 shadow-lg bg-white/20 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {profile.full_name?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl lg:text-3xl font-bold">
                    Добре дошъл, {profile.full_name}!
                  </h1>
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="text-blue-100">Твоят dashboard за управление на клиенти и програми</p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
              asChild
            >
              <Link href="/protected/clients/invite">
                <Plus className="h-5 w-5 mr-2" />
                Покани клиент
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0">Активни</Badge>
              </div>
              <p className="text-blue-100 text-sm font-medium mb-1">Общо клиенти</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold">{stats.activeClients}</p>
                <p className="text-blue-100 text-lg pb-1">/ {stats.totalClients}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0">Програми</Badge>
              </div>
              <p className="text-purple-100 text-sm font-medium mb-1">Тренировъчни програми</p>
              <p className="text-4xl font-bold">{stats.totalPrograms}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Utensils className="h-6 w-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0">Храна</Badge>
              </div>
              <p className="text-green-100 text-sm font-medium mb-1">Хранителни планове</p>
              <p className="text-4xl font-bold">{stats.totalNutritionPlans}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Award className="h-6 w-6" />
                </div>
                <Badge className={`${planBadge.color} border-0`}>{planBadge.label}</Badge>
              </div>
              <p className="text-orange-100 text-sm font-medium mb-1">Капацитет</p>
              <p className="text-4xl font-bold">{stats.activeClients}/{stats.clientLimit >= 999999 ? '∞' : stats.clientLimit}</p>
              <div className="mt-2 bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg border-border/50">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Бързи действия
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto flex-col items-start p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors" asChild>
                <Link href="/protected/clients">
                  <Users className="h-8 w-8 mb-2 text-blue-600" />
                  <span className="font-semibold">Клиенти</span>
                  <span className="text-xs text-muted-foreground">Управление на клиенти</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-start p-4 hover:bg-purple-50 hover:border-purple-300 transition-colors" asChild>
                <Link href="/protected/programs">
                  <Dumbbell className="h-8 w-8 mb-2 text-purple-600" />
                  <span className="font-semibold">Програми</span>
                  <span className="text-xs text-muted-foreground">Тренировъчни програми</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-start p-4 hover:bg-green-50 hover:border-green-300 transition-colors" asChild>
                <Link href="/protected/nutrition-plans">
                  <Utensils className="h-8 w-8 mb-2 text-green-600" />
                  <span className="font-semibold">Хранене</span>
                  <span className="text-xs text-muted-foreground">Хранителни планове</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col items-start p-4 hover:bg-orange-50 hover:border-orange-300 transition-colors" asChild>
                <Link href="/protected/exercises">
                  <Activity className="h-8 w-8 mb-2 text-orange-600" />
                  <span className="font-semibold">Упражнения</span>
                  <span className="text-xs text-muted-foreground">Библиотека</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Clients & Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-lg border-border/50">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Последни клиенти
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/protected/clients">
                    Виж всички
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {stats.recentClients.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentClients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/protected/clients/${client.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                    >
                      {client.avatar_url ? (
                        <img
                          src={client.avatar_url}
                          alt={client.full_name}
                          className="w-12 h-12 rounded-full border-2 border-border object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-border bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {client.full_name?.split(' ').map((n: string) => n[0]).join('') || 'К'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{client.full_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {client.status === 'active' ? 'Активен' : 'Неактивен'}
                        </Badge>
                        <div className="flex gap-1">
                          {client.hasProgram && (
                            <div className="p-1 bg-blue-100 rounded" title="Има програма">
                              <Dumbbell className="h-3 w-3 text-blue-600" />
                            </div>
                          )}
                          {client.hasNutritionPlan && (
                            <div className="p-1 bg-green-100 rounded" title="Има хранителен план">
                              <Utensils className="h-3 w-3 text-green-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium mb-1">Все още нямаш клиенти</p>
                  <p className="text-sm text-muted-foreground mb-4">Започни като поканиш първия си клиент</p>
                  <Button asChild>
                    <Link href="/protected/clients/invite">
                      <Plus className="h-4 w-4 mr-2" />
                      Покани клиент
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border/50">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Бърз преглед
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">Активни програми</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">{stats.totalPrograms} общо</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/protected/programs">Виж</Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Utensils className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">Хранителни планове</p>
                      <p className="text-sm text-green-600 dark:text-green-300">{stats.totalNutritionPlans} създадени</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/protected/nutrition-plans">Виж</Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-900 dark:text-purple-100">Subscription план</p>
                      <p className="text-sm text-purple-600 dark:text-purple-300">{planBadge.label}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/protected/subscription">Upgrade</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}