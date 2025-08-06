"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Users, 
  Search, 
  Calendar, 
  Target, 
  TrendingUp,
  Dumbbell,
  Apple,
  BarChart3,
  Eye,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import Link from 'next/link';
import { createSupabaseClient } from '@/utils/supabase/client';

const subscriptionPlans = {
  free: { name: 'Безплатен', limit: 3, color: 'bg-gray-100 text-gray-800' },
  pro: { name: 'Pro', limit: 6, color: 'bg-blue-100 text-blue-800' },
  beast: { name: 'Beast', limit: null, color: 'bg-purple-100 text-purple-800' }
} as const;

type SubscriptionPlan = keyof typeof subscriptionPlans;

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState('');
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('free');

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setClients([]);
        setFilteredClients([]);
        setLoading(false);
        return;
      }
      // Вземи всички клиенти, асоциирани с треньора
      const { data: trainerClients, error: trainerClientsError } = await supabase
        .from('trainer_clients')
        .select('client_id, status')
        .eq('trainer_id', user.id);
      if (trainerClientsError || !trainerClients) {
        setClients([]);
        setFilteredClients([]);
        setLoading(false);
        return;
      }
      const clientIds = trainerClients.map((tc: any) => tc.client_id);
      if (clientIds.length === 0) {
        setClients([]);
        setFilteredClients([]);
        setLoading(false);
        return;
      }
      // Вземи профилите на клиентите
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, goals, status')
        .in('id', clientIds);
      if (profilesError || !profiles) {
        setClients([]);
        setFilteredClients([]);
        setLoading(false);
        return;
      }
      // Добавяме статуса от trainer_clients, ако е нужен
      const clientsWithStatus = profiles.map((profile: any) => {
        const tc = trainerClients.find((tc: any) => tc.client_id === profile.id);
        return { ...profile, status: tc?.status || profile.status };
      });
      setClients(clientsWithStatus);
      setFilteredClients(clientsWithStatus);
      setLoading(false);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, selectedStatus, clients]);

  const filterClients = () => {
    let filtered = clients.filter(client =>
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(client => 
        selectedStatus === 'active' 
          ? client.status === 'active'
          : client.status !== 'active'
      );
    }

    setFilteredClients(filtered);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const activeClients = clients.filter(c => c.status === 'active').length;
  const currentLimit = subscriptionPlans[currentPlan].limit;
  const canAddMore = currentLimit === null || activeClients < currentLimit;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Зареждане на клиенти...</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Грешка при зареждане</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => setError('')} variant="outline">
              Опитай отново
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-4">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Управление на клиенти</h1>
            <p className="text-gray-600 mt-1">
              {clients.length > 0 
                ? `Имате ${clients.length} ${clients.length === 1 ? 'клиент' : 'клиента'}`
                : 'Управлявайте програмите и прогреса на вашите клиенти'
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Subscription info */}
            <Badge className={subscriptionPlans[currentPlan].color}>
              {subscriptionPlans[currentPlan].name} план ({activeClients}/{currentLimit || '∞'})
            </Badge>
            <div className="flex gap-2">
              {!canAddMore && (
                <Button variant="outline" className="text-orange-600 border-orange-300">
                  Надстройте плана
                </Button>
              )}
              <Button asChild>
                <Link href="/protected/clients/programs/create">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Нова програма
                </Link>
              </Button>
              <Button variant="outline" asChild disabled={!canAddMore}>
                <Link href="/protected/clients/invite">
                  <Plus className="h-4 w-4 mr-2" />
                  Покани клиент
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Активни клиенти</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeClients}
                  {currentLimit && <span className="text-lg text-gray-500 ml-1">/{currentLimit}</span>}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Тази седмица</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
                <p className="text-sm text-green-600 font-medium">тренировки</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Dumbbell className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Средно постижение</p>
                <p className="text-2xl font-bold text-gray-900">78%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Нови програми</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-yellow-600 font-medium">този месец</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      {clients.length > 0 && (
        <Card className="p-4 shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Търси клиент по име или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
              >
                Всички
              </Button>
              <Button
                variant={selectedStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('active')}
              >
                Активни
              </Button>
              <Button
                variant={selectedStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('inactive')}
              >
                Неактивни
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Clients Grid */}
      {filteredClients.length === 0 && clients.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Нямате клиенти</h3>
            <p className="text-muted-foreground mb-4">
              Започнете като поканите вашия първи клиент
            </p>
            <Button asChild>
              <Link href="/protected/clients/invite">
                <Plus className="h-4 w-4 mr-2" />
                Покани клиент
              </Link>
            </Button>
          </div>
        </Card>
      ) : filteredClients.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground">Няма намерени клиенти за "{searchTerm}"</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredClients.map(client => (
            <Card key={client.id} className="p-5 hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 bg-gradient-to-br from-blue-500 to-purple-600">
                    <AvatarFallback className="text-white font-semibold text-sm">
                      {getInitials(client.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-gray-900 truncate">{client.full_name}</h3>
                    <p className="text-gray-500 truncate text-sm">{client.email}</p>
                  </div>
                </div>
                <Badge 
                  variant={client.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs py-1 px-2"
                >
                  {client.status === 'active' ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Напредък към целта</span>
                  <span className="font-semibold text-gray-900">{client.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(client.progress)} transition-all duration-500`}
                    style={{ width: `${client.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Goal and Weight info */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Цел</p>
                  <p className="font-semibold text-gray-900">{client.goals}</p>
                </div>
                <div>
                  <p className="text-gray-500">Тегло</p>
                  <p className="font-semibold text-gray-900">{client.currentWeight} → {client.targetWeight} кг</p>
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Тази седмица</span>
                  {client.streak > 0 && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5">
                      🔥 {client.streak}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    {client.completedWorkouts}/{client.weeklyGoal} тренировки
                  </span>
                  <span className="font-semibold text-gray-900">
                    {Math.round((client.completedWorkouts / client.weeklyGoal) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min((client.completedWorkouts / client.weeklyGoal) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <Button variant="outline" size="sm" className="flex-1 h-9" asChild>
                  <Link href={`/protected/clients/${client.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    Преглед
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-9" asChild>
                  <Link href={`/protected/clients/${client.id}/calendar`}>
                    <Calendar className="h-3 w-3 mr-1" />
                    Календар
                  </Link>
                </Button>
              </div>

              {/* Last activity */}
              <div className="text-xs text-gray-500 pt-2 border-t space-y-1">
                <div>Последна активност: {client.lastActive}</div>
                <div>Присъединен: {client.joinedDate}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-gray-500">Debug Info</summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify({ totalClients: clients.length, filteredClients: filteredClients.length, clients }, null, 2)}
          </pre>
        </details>
      )}
      </div>
    </div>
  );
}