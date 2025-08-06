// app/protected/clients/page.tsx - Подобрена версия с по-хубав дизайн
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
  User,
  Settings,
  MessageCircle,
  Award
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
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, selectedStatus, clients]);

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('=== STARTING FETCH CLIENTS (Main Page) ===');
      
      const supabase = createSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('User authentication error:', userError);
        setError('Не сте влязъл в системата');
        setClients([]);
        setFilteredClients([]);
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

      // Добавяме статуса от trainer_clients към профилите
      const clientsWithStatus = profiles.map((profile: any) => {
        const tc = trainerClients.find((tc: any) => tc.client_id === profile.id);
        return { 
          ...profile, 
          trainer_status: tc?.status || 'unknown' // Използваме trainer_status за избягване на объркване
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
        .select('plan_type')
        .eq('trainer_id', trainerId)
        .single();

      if (subscription && !error) {
        setCurrentPlan(subscription.plan_type as SubscriptionPlan);
      }
    } catch (error) {
      console.log('No subscription found, using default free plan');
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
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-medium">
            Неизвестен
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="font-semibold text-gray-900 mb-2">Зареждане на клиенти</h3>
            <p className="text-gray-600">Моля изчакайте...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="p-8 shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-900 mb-2">Възникна грешка</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchClients} className="w-full">
              Опитай отново
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const planInfo = subscriptionPlans[currentPlan];
  const activeClients = clients.filter(client => client.trainer_status === 'active');
  const canAddMore = planInfo.limit === null || activeClients.length < planInfo.limit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-none mx-auto p-4 lg:p-6 lg:pr-2 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление на клиенти</h1>
              <p className="text-gray-600">Преглед и управление на вашите клиенти и тяхните програми</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
              <Button variant="outline" size="lg" asChild className="shadow-sm">
                <Link href="/protected/clients/programs/create">
                  <Calendar className="h-4 w-4 mr-2" />
                  Създай програма
                </Link>
              </Button>
              <Button size="lg" disabled={!canAddMore} className="shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="h-4 w-4 mr-2" />
                Покани клиент
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Общо клиенти</p>
                  <p className="text-3xl font-bold mt-1">{clients.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Users className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Активни клиенти</p>
                  <p className="text-3xl font-bold mt-1">{activeClients.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Текущ план</p>
                  <p className="text-xl font-bold mt-1">{planInfo.name}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Award className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Капацитет</p>
                  <p className="text-3xl font-bold mt-1">
                    {activeClients.length}<span className="text-xl">/{planInfo.limit || '∞'}</span>
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
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
              <div className="flex gap-2 lg:ml-auto">
                <Button
                  variant={selectedStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('all')}
                  className="shadow-sm"
                >
                  Всички ({clients.length})
                </Button>
                <Button
                  variant={selectedStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('active')}
                  className="shadow-sm"
                >
                  Активни ({activeClients.length})
                </Button>
                <Button
                  variant={selectedStatus === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('inactive')}
                  className="shadow-sm"
                >
                  Неактивни ({clients.length - activeClients.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {clients.length === 0 ? 'Няmate клиенти все още' : 'Няма намерени клиенти'}
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  {clients.length === 0 
                    ? 'Започнете да разширявате екипа си като поканите първия си клиент и започнете съвместното путешествие към фитнес целите.'
                    : 'Опитайте различни критерии за търсене или филтриране, за да намерите желания клиент.'
                  }
                </p>
                {clients.length === 0 && canAddMore && (
                  <Button asChild size="lg" className="shadow-sm">
                    <Link href="/protected/clients/invite">
                      <Plus className="h-5 w-5 mr-2" />
                      Покани първия си клиент
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="group hover:shadow-lg transition-all duration-300 shadow-sm border border-gray-200 hover:border-gray-300 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 ring-2 ring-gray-100">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                          {client.full_name?.charAt(0)?.toUpperCase() || 'К'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {client.full_name || 'Без име'}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getClientStatusBadge(client.trainer_status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    
                    {client.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}

                    {client.created_at && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <span>Присъединен: {new Date(client.created_at).toLocaleDateString('bg-BG')}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" asChild className="h-9 shadow-sm hover:bg-blue-50 hover:border-blue-200">
                        <Link href={`/protected/clients/${client.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="h-9 shadow-sm hover:bg-green-50 hover:border-green-200">
                        <Link href={`/protected/clients/${client.id}/calendar`}>
                          <Calendar className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="h-9 shadow-sm hover:bg-purple-50 hover:border-purple-200">
                        <Link href={`/protected/clients/${client.id}/progress`}>
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button variant="outline" size="sm" className="h-9 shadow-sm hover:bg-orange-50 hover:border-orange-200">
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Програма
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 shadow-sm hover:bg-teal-50 hover:border-teal-200">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Съобщение
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upgrade Prompt */}
        {!canAddMore && (
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
                    Надстройте до Pro план (до 6 клиента) или Beast план (неограничено) за да добавите повече клиенти и да разширите бизнеса си.
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