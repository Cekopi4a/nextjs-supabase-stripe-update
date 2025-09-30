// app/protected/clients/page.tsx - Подобрена версия с по-хубав дизайн
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import {
  Plus,
  Users,
  Search,
  Calendar,
  TrendingUp,
  Apple,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  Dumbbell,
  Utensils
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/utils/supabase/client';

const subscriptionPlans = {
  free: { name: 'Безплатен', limit: 3, color: 'bg-muted text-muted-foreground' },
  pro: { name: 'Pro', limit: 6, color: 'bg-blue-100 text-blue-800' },
  beast: { name: 'Beast', limit: 999999, color: 'bg-purple-100 text-purple-800' }
} as const;

type SubscriptionPlan = keyof typeof subscriptionPlans;

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState('');
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('free');
  const [currentLimit, setCurrentLimit] = useState<number | null>(3);

  useEffect(() => {
    fetchClients();
  }, []);
  

  useEffect(() => {
    filterClients();
  }, [searchTerm, selectedStatus, clients]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('=== STARTING FETCH CLIENTS (Main Page) ===');
      
      const supabase = createSupabaseClient();
      
      // Try to get current session first
      console.log('Attempting to get Supabase session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('Session result:', { session: !!session, error: sessionError });
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('Проблем с автентификацията: ' + sessionError.message);
        setLoading(false);
        return;
      }
      
      if (!session) {
        console.log('No session found');
        setError('Не сте влязъл в системата');
        setLoading(false);
        return;
      }
      
      const user = session.user;
      if (!user) {
        console.log('No user found in session');
        setError('Няма потребителска информация');
        setLoading(false);
        return;
      }

      console.log('Authenticated user ID:', user.id);

      // Вземи всички клиенти, асоциирани с треньора (включително неактивни)
      const { data: trainerClients, error: trainerClientsError } = await supabase
        .from('trainer_clients')
        .select('client_id, status')
        .eq('trainer_id', user.id);

      console.log('Trainer clients query result:', { data: trainerClients, error: trainerClientsError });

      if (trainerClientsError) {
        console.error('Error fetching trainer clients:', trainerClientsError);
        setError('Грешка при заредане на връзките с клиентите: ' + trainerClientsError.message);
        setClients([]);
        setFilteredClients([]);
        setLoading(false);
        return;
      }

      if (!trainerClients || trainerClients.length === 0) {
        console.log('No clients found for trainer');
        setClients([]);
        setFilteredClients([]);
        setLoading(false);
        return;
      }

      const clientIds = trainerClients.map(tc => tc.client_id);
      console.log('Client IDs to fetch profiles for:', clientIds);

      // Вземи профилите на клиентите (БЕЗ 'goals' полето което не съществува)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone, created_at')
        .in('id', clientIds);

      console.log('Profiles query result:', { data: profiles, error: profilesError });

      if (profilesError) {
        console.error('Error fetching client profiles:', profilesError);
        setError('Грешка при заредане на профилите на клиентите: ' + profilesError.message);
        setClients([]);
        setFilteredClients([]);
        setLoading(false);
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found for the client IDs');
        setClients([]);
        setFilteredClients([]);
        setLoading(false);
        return;
      }

      // Get active programs for clients
      const { data: activePrograms } = await supabase
        .from('workout_programs')
        .select('client_id, name')
        .in('client_id', clientIds)
        .eq('is_active', true);

      console.log('Active programs:', activePrograms);

      // Get nutrition plans for clients
      const { data: nutritionPlans } = await supabase
        .from('nutrition_plans')
        .select('client_id, name')
        .in('client_id', clientIds);

      console.log('Nutrition plans:', nutritionPlans);

      // Добавяме статуса от trainer_clients към профилите
      const clientsWithStatus = profiles.map((profile: any) => {
        const tc = trainerClients.find((tc: any) => tc.client_id === profile.id);
        const activeProgram = activePrograms?.find(ap => ap.client_id === profile.id);
        const nutritionPlan = nutritionPlans?.find(np => np.client_id === profile.id);

        return {
          ...profile,
          trainer_status: tc?.status || 'unknown', // Използваме trainer_status за избягване на объркване
          has_active_program: !!activeProgram,
          workout_program_name: activeProgram?.name || null,
          nutrition_plan_name: nutritionPlan?.name || null
        };
      });

      console.log('Successfully loaded client profiles with status:', clientsWithStatus);
      setClients(clientsWithStatus);
      setFilteredClients(clientsWithStatus);
      
      // Заредени и subscription информацията за треньора
      await fetchTrainerSubscription(user.id);
      
    } catch (error: any) {
      console.error('Unexpected error in fetchClients:', error);
      setError('Неочаквана грешка: ' + error.message);
      setClients([]);
      setFilteredClients([]);
    } finally {
      setLoading(false);
      console.log('=== FETCH CLIENTS COMPLETE (Main Page) ===');
    }
  };

  const fetchTrainerSubscription = async (trainerId: string) => {
    try {
      const supabase = createSupabaseClient();
      const { data: subscription, error } = await supabase
        .from('trainer_subscriptions')
        .select('plan_type, client_limit')
        .eq('trainer_id', trainerId)
        .single();

      console.log('Subscription data:', subscription, 'Error:', error);

      if (subscription && !error) {
        const planType = subscription.plan_type as SubscriptionPlan;
        setCurrentPlan(planType);
        setCurrentLimit(subscription.client_limit);
        
        console.log('Current plan set to:', planType, 'with limit:', subscription.client_limit);
      } else {
        console.log('No subscription found or error occurred, using default free plan');
        setCurrentPlan('free');
        setCurrentLimit(3);
      }
    } catch (error) {
      console.log('Error fetching subscription, using default free plan:', error);
      setCurrentPlan('free');
      setCurrentLimit(3);
    }
  };

  const filterClients = () => {
    if (!clients.length) return;

    let filtered = clients.filter(client => {
      const nameMatch = client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const emailMatch = client.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      return nameMatch || emailMatch;
    });

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(client => 
        selectedStatus === 'active' 
          ? client.trainer_status === 'active'
          : client.trainer_status !== 'active'
      );
    }

    setFilteredClients(filtered);
  };

  const getClientStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 font-medium">
            <CheckCircle className="h-3 w-3 mr-1" />
            Активен
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 font-medium">
            <Clock className="h-3 w-3 mr-1" />
            Неактивен
          </Badge>
        );
      case 'terminated':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 font-medium">
            <AlertCircle className="h-3 w-3 mr-1" />
            Прекратен
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-border font-medium">
            Неизвестен
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="font-semibold text-foreground mb-2">Зареждане на клиенти</h3>
            <p className="text-muted-foreground">Моля изчакайте...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center">
        <Card className="p-8 shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-destructive mb-2">Възникна грешка</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-2">
              <Button onClick={fetchClients} className="w-full">
                Опитай отново
              </Button>
              <Button onClick={() => window.location.href = '/sign-in'} variant="outline" className="w-full">
                Влез отново
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const planInfo = {
    ...subscriptionPlans[currentPlan],
    limit: currentLimit
  };
  const activeClients = clients.filter(client => client.trainer_status === 'active');
  const canAddMore = currentLimit === null || currentLimit >= 999999 || activeClients.length < currentLimit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-none mx-auto p-3 sm:p-4 lg:p-6 lg:pr-2 space-y-6 lg:space-y-8">
        {/* Header Section */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Управление на клиенти</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Преглед и управление на вашите клиенти и тяхните програми</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" disabled={!canAddMore} className="shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 w-full sm:w-auto" asChild>
                <Link href="/protected/clients/invite">
                  <Plus className="h-4 w-4 mr-2" />
                  Покани клиент
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Общо клиенти</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{clients.length}</p>
                </div>
                <div className="p-2 sm:p-3 bg-background/20 rounded-lg">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Активни клиенти</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{activeClients.length}</p>
                </div>
                <div className="p-2 sm:p-3 bg-background/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Текущ план</p>
                  <p className="text-lg sm:text-xl font-bold mt-1">{planInfo.name}</p>
                </div>
                <div className="p-2 sm:p-3 bg-background/20 rounded-lg">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Капацитет</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">
                    {activeClients.length}<span className="text-lg sm:text-xl">/{currentLimit >= 999999 ? '∞' : planInfo.limit}</span>
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-background/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-sm border border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Търсене по име или имейл..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 shadow-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('all')}
                  className="shadow-sm flex-1 sm:flex-none text-xs sm:text-sm"
                  size="sm"
                >
                  Всички ({clients.length})
                </Button>
                <Button
                  variant={selectedStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('active')}
                  className="shadow-sm flex-1 sm:flex-none text-xs sm:text-sm"
                  size="sm"
                >
                  Активни ({activeClients.length})
                </Button>
                <Button
                  variant={selectedStatus === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('inactive')}
                  className="shadow-sm flex-1 sm:flex-none text-xs sm:text-sm"
                  size="sm"
                >
                  Неактивни ({clients.length - activeClients.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredClients.map(client => (
            <Card key={client.id} className="p-5 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={client.avatar_url}
                    alt={client.full_name || "Клиент"}
                    size="lg"
                    className="flex-shrink-0"
                    fallback={
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {client.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'К'}
                        </span>
                      </div>
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-foreground truncate">{client.full_name}</h3>
                    <p className="text-gray-500 truncate text-sm">{client.email}</p>
                  </div>
                </div>
                <Badge 
                  variant={client.trainer_status === 'active' ? 'default' : 'secondary'}
                  className="text-xs py-1 px-2"
                >
                  {client.trainer_status === 'active' ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>

              {/* Plans info */}
              <div className="grid grid-cols-1 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Тренировъчен план</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {client.workout_program_name || 'Няма зададен план'}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Utensils className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Хранителен план</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {client.nutrition_plan_name || 'Няма зададен план'}
                  </p>
                </div>
              </div>


              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-2 mb-3">
                <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                  <Link href={`/protected/clients/${client.id}/nutrition`}>
                    <Apple className="h-3 w-3 mr-1" />
                    Храна
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                  <Link href={`/protected/clients/${client.id}/progress`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Прогрес
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                  <Link href={`/protected/clients/${client.id}/calendar`}>
                    <Calendar className="h-3 w-3 mr-1" />
                    Тренировки
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" className="text-xs h-8" asChild>
                  <Link href={`/protected/clients/${client.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    Преглед
                  </Link>
                </Button>
              </div>

              {/* Last activity */}
              <div className="text-xs text-gray-500 pt-3 border-t mt-3 space-y-1">
                <div>Последна активност: {client.lastActive || 'Никога'}</div>
                <div>Присъединен: {client.joinedDate || 'Неизвестно'}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Upgrade Prompt */}
        {!canAddMore && currentPlan !== 'beast' && (
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 text-lg mb-1">
                    Достигнахте лимита от {planInfo.limit} клиента
                  </h3>
                  <p className="text-amber-800">
                    {currentPlan === 'free' 
                      ? 'Надстройте до Pro план (до 6 клиента) или Beast план (неограничено) за да добавите повече клиенти и да разширите бизнеса си.'
                      : currentPlan === 'pro'
                      ? 'Надстройте до Beast план (неограничено клиенти) за да добавите повече клиенти и да разширите бизнеса си.'
                      : 'Вие имате максималния план - Beast.'}
                  </p>
                </div>
                <div className="lg:ml-auto flex-shrink-0">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm">
                    Надстройте плана
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}