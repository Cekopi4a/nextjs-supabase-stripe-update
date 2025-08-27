"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Apple, 
  Users, 
  Search, 
  Calendar, 
  Target, 
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NutritionPlanActions from '@/components/nutrition-plan-actions';

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  plan_type: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  client: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface Client {
  id: string;
  full_name: string;
  email: string;
}

const planTypes = {
  weight_loss: { name: 'Отслабване', color: 'bg-red-100 text-red-800', icon: '📉' },
  weight_gain: { name: 'Качване на тегло', color: 'bg-green-100 text-green-800', icon: '📈' },
  maintenance: { name: 'Поддържане', color: 'bg-blue-100 text-blue-800', icon: '⚖️' },
  muscle_building: { name: 'Мускулна маса', color: 'bg-purple-100 text-purple-800', icon: '💪' },
  cutting: { name: 'Релеф', color: 'bg-orange-100 text-orange-800', icon: '🔥' }
};

export default function NutritionPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<NutritionPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [macrosData, setMacrosData] = useState<{[key: string]: any}>({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [searchTerm, selectedClient, selectedType, plans]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Извличане на хранителните режими
      const plansResponse = await fetch('/api/nutrition-plans');
      if (!plansResponse.ok) {
        throw new Error('Грешка при зареждане на хранителните режими');
      }
      const plansData = await plansResponse.json();
      setPlans(plansData.plans || []);

      // Извличане на клиентите
      const clientsResponse = await fetch('/api/clients');
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData.clients || []);
      }

      // Зареждане на макросите за всеки план
      if (plansData.plans && plansData.plans.length > 0) {
        plansData.plans.forEach((plan: any) => {
          if (plan.is_active) {
            fetchPlanMacros(plan.id);
          }
        });
      }

    } catch (error: any) {
      console.error('Грешка при зареждане:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterPlans = () => {
    if (!plans.length) return;

    let filtered = plans.filter(plan => {
      const nameMatch = plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const clientMatch = plan.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const descriptionMatch = plan.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      
      return nameMatch || clientMatch || descriptionMatch;
    });

    if (selectedClient !== 'all') {
      filtered = filtered.filter(plan => plan.client?.id === selectedClient);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(plan => plan.plan_type === selectedType);
    }

    setFilteredPlans(filtered);
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този хранителен режим?')) {
      return;
    }

    try {
      const response = await fetch(`/api/nutrition-plans/${planId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Грешка при изтриване на режима');
      }

      setPlans(plans.filter(plan => plan.id !== planId));
    } catch (error: any) {
      alert('Грешка: ' + error.message);
    }
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const response = await fetch(`/api/nutrition-plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: plan.name,
          description: plan.description,
          target_calories: plan.target_calories,
          target_protein: plan.target_protein,
          target_carbs: plan.target_carbs,
          target_fat: plan.target_fat,
          plan_type: plan.plan_type,
          start_date: plan.start_date,
          end_date: plan.end_date,
          is_active: !currentStatus
        })
      });

      if (!response.ok) {
        throw new Error('Грешка при обновяване на статуса');
      }

      setPlans(plans.map(p => 
        p.id === planId ? { ...p, is_active: !currentStatus } : p
      ));
    } catch (error: any) {
      alert('Грешка: ' + error.message);
    }
  };

  const getPlanStatusBadge = (plan: NutritionPlan) => {
    if (!plan.is_active) {
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
          <Clock className="h-3 w-3 mr-1" />
          Неактивен
        </Badge>
      );
    }

    const now = new Date();
    const startDate = new Date(plan.start_date);
    const endDate = plan.end_date ? new Date(plan.end_date) : null;

    if (endDate && now > endDate) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Изтекъл
        </Badge>
      );
    }

    if (now < startDate) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Предстоящ
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Активен
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="font-semibold text-gray-900 mb-2">Зареждане на хранителни режими</h3>
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
            <Button onClick={fetchData} className="w-full">
              Опитай отново
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const activePlans = plans.filter(plan => plan.is_active);
  const totalClients = new Set(plans.map(plan => plan.client?.id)).size;

  const fetchPlanMacros = async (planId: string) => {
    try {
      const response = await fetch(`/api/nutrition-plans/${planId}/macros`);
      if (response.ok) {
        const data = await response.json();
        setMacrosData(prev => ({ ...prev, [planId]: data }));
      }
    } catch (error) {
      console.error('Грешка при зареждане на макроси:', error);
    }
  };

  const handlePlanCopied = () => {
    fetchData(); // Презареждаме данните след копиране
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-none mx-auto p-4 lg:p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Хранителни режими</h1>
              <p className="text-gray-600">Създавайте и управлявайте хранителните планове за вашите клиенти</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
              <Button size="lg" className="shadow-sm bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700" asChild>
                <Link href="/protected/nutrition/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Нов хранителен режим
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Общо режими</p>
                  <p className="text-3xl font-bold mt-1">{plans.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Apple className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Активни режими</p>
                  <p className="text-3xl font-bold mt-1">{activePlans.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Клиенти с режими</p>
                  <p className="text-3xl font-bold mt-1">{totalClients}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Users className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Най-популярен тип</p>
                  <p className="text-xl font-bold mt-1">Отслабване</p>
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
                    placeholder="Търсене по име на режим или клиент..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 shadow-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 lg:ml-auto">
                <select 
                  value={selectedClient} 
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">Всички клиенти</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.full_name}</option>
                  ))}
                </select>
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">Всички типове</option>
                  {Object.entries(planTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlans.map(plan => {
            const planType = planTypes[plan.plan_type as keyof typeof planTypes] || planTypes.maintenance;
            
            return (
              <Card key={plan.id} className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{plan.name}</h3>
                    <p className="text-gray-500 text-sm truncate">{plan.client?.full_name}</p>
                    <p className="text-gray-400 text-xs truncate">{plan.client?.email}</p>
                  </div>
                  {getPlanStatusBadge(plan)}
                </div>

                <div className="mb-4">
                  <Badge className={`${planType.color} text-xs py-1 px-2 mb-2`}>
                    {planType.icon} {planType.name}
                  </Badge>
                  {plan.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{plan.description}</p>
                  )}
                </div>

                {/* Nutritional Targets */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Дневни цели</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Калории:</span>
                      <span className="ml-1 font-semibold">{plan.target_calories || 'Не е зададено'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Протеини:</span>
                      <span className="ml-1 font-semibold">{plan.target_protein || 0}г</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Въглехидрати:</span>
                      <span className="ml-1 font-semibold">{plan.target_carbs || 0}г</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Мазнини:</span>
                      <span className="ml-1 font-semibold">{plan.target_fat || 0}г</span>
                    </div>
                  </div>
                </div>

                {/* Period */}
                <div className="text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" />
                    От: {new Date(plan.start_date).toLocaleDateString('bg-BG')}
                  </div>
                  {plan.end_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      До: {new Date(plan.end_date).toLocaleDateString('bg-BG')}
                    </div>
                  )}
                </div>

                {/* Macros Summary */}
                {macrosData[plan.id] && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <h4 className="text-xs font-medium text-blue-700 mb-2 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Средни дневни макроси
                    </h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div>
                        <span className="text-blue-600">Кал:</span>
                        <span className="ml-1 font-semibold">
                          {Math.round(macrosData[plan.id].average_macros?.avg_calories || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600">Бел:</span>
                        <span className="ml-1 font-semibold">
                          {Math.round(macrosData[plan.id].average_macros?.avg_protein || 0)}г
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600">Въгл:</span>
                        <span className="ml-1 font-semibold">
                          {Math.round(macrosData[plan.id].average_macros?.avg_carbs || 0)}г
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600">Маз:</span>
                        <span className="ml-1 font-semibold">
                          {Math.round(macrosData[plan.id].average_macros?.avg_fat || 0)}г
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plan Actions */}
                <div className="mb-3">
                  <NutritionPlanActions 
                    planId={plan.id} 
                    planName={plan.name} 
                    onPlanCopied={handlePlanCopied}
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="text-xs h-8 bg-gradient-to-r from-orange-600 to-red-600"
                    asChild
                  >
                    <Link href={`/protected/nutrition/${plan.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      Преглед
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8"
                    asChild
                  >
                    <Link href={`/protected/nutrition/${plan.id}/edit`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Редактирай
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                  >
                    {plan.is_active ? '⏸️ Деактивирай' : '▶️ Активирай'}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deletePlan(plan.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Изтрий
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPlans.length === 0 && !loading && (
          <Card className="border-2 border-dashed border-gray-300 shadow-sm">
            <CardContent className="p-12">
              <div className="text-center">
                <Apple className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {plans.length === 0 ? 'Няма създадени хранителни режими' : 'Няма резултати'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {plans.length === 0 
                    ? 'Започнете да създавате персонализирани хранителни планове за вашите клиенти.'
                    : 'Опитайте с различни филтри или търсене.'
                  }
                </p>
                {plans.length === 0 && (
                  <Button className="bg-gradient-to-r from-orange-600 to-red-600" asChild>
                    <Link href="/protected/nutrition/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Създай първия си хранителен режим
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}