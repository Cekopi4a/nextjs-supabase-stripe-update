"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Save,
  User,
  Target,
  Calendar,
  Apple,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatScheduledDate } from '@/utils/date-utils';

interface Client {
  id: string;
  full_name: string;
  email: string;
}

const planTypes = {
  weight_loss: { name: 'Отслабване', description: 'Режим за намаляване на телесното тегло' },
  weight_gain: { name: 'Качване на тегло', description: 'Режим за увеличаване на телесното тегло' },
  maintenance: { name: 'Поддържане', description: 'Режим за поддържане на текущото тегло' },
  muscle_building: { name: 'Мускулна маса', description: 'Режим за увеличаване на мускулната маса' },
  cutting: { name: 'Релеф', description: 'Режим за намаляване на мазнините при запазване на мускулите' }
};

export default function CreateNutritionPlanPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingClients, setLoadingClients] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    description: '',
    target_calories: '',
    target_protein: '',
    target_carbs: '',
    target_fat: '',
    plan_type: 'weight_loss',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Грешка при зареждане на клиентите');
      }
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error: any) {
      console.error('Грешка при зареждане на клиенти:', error);
      setError(error.message);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.client_id) {
      setError('Моля изберете клиент');
      return;
    }
    
    if (!formData.name.trim()) {
      setError('Моля въведете име на режима');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Подготовка на данните за изпращане
      const submitData = {
        client_id: formData.client_id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        target_calories: formData.target_calories ? parseInt(formData.target_calories) : null,
        target_protein: formData.target_protein ? parseInt(formData.target_protein) : null,
        target_carbs: formData.target_carbs ? parseInt(formData.target_carbs) : null,
        target_fat: formData.target_fat ? parseInt(formData.target_fat) : null,
        plan_type: formData.plan_type,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        meals: []
      };

      const response = await fetch('/api/nutrition-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Грешка при създаване на режима');
      }

      const result = await response.json();
      
      // Пренасочване към страницата с подробности за новия режим
      router.push(`/protected/nutrition/${result.plan.id}`);
      
    } catch (error: any) {
      console.error('Грешка при създаване на режим:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id === formData.client_id);
  const selectedPlanType = planTypes[formData.plan_type as keyof typeof planTypes];

  if (loadingClients) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="font-semibold text-foreground mb-2">Зареждане на клиенти</h3>
            <p className="text-gray-600">Моля изчакайте...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/protected/nutrition">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Нов хранителен режим</h1>
            <p className="text-gray-600">Създайте персонализиран хранителен план за вашия клиент</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Client Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Избор на клиент
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="client_id">Клиент *</Label>
                    <select
                      id="client_id"
                      value={formData.client_id}
                      onChange={(e) => handleInputChange('client_id', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Изберете клиент</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.full_name} ({client.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedClient && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Избран клиент:</strong> {selectedClient.full_name}
                      </p>
                      <p className="text-xs text-blue-600">{selectedClient.email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="h-5 w-5" />
                    Основна информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Име на режима *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="напр. Хранителен план за отслабване"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Опишете целите и особеностите на режима..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="plan_type">Тип на режима</Label>
                    <select
                      id="plan_type"
                      value={formData.plan_type}
                      onChange={(e) => handleInputChange('plan_type', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {Object.entries(planTypes).map(([key, type]) => (
                        <option key={key} value={key}>{type.name}</option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedPlanType.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Period */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Период на режима
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Начална дата *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">Крайна дата</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => handleInputChange('end_date', e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Ако не зададете крайна дата, режимът ще остане активен до ръчно деактивиране.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Nutritional Targets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Дневни хранителни цели
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="target_calories">Целеви калории</Label>
                    <Input
                      id="target_calories"
                      type="number"
                      value={formData.target_calories}
                      onChange={(e) => handleInputChange('target_calories', e.target.value)}
                      placeholder="2000"
                      min="800"
                      max="5000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Препоръчително: 1200-3500 калории/ден</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="target_protein">Протеини (г)</Label>
                      <Input
                        id="target_protein"
                        type="number"
                        value={formData.target_protein}
                        onChange={(e) => handleInputChange('target_protein', e.target.value)}
                        placeholder="150"
                        min="0"
                        max="500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target_carbs">Въглехидрати (г)</Label>
                      <Input
                        id="target_carbs"
                        type="number"
                        value={formData.target_carbs}
                        onChange={(e) => handleInputChange('target_carbs', e.target.value)}
                        placeholder="200"
                        min="0"
                        max="800"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target_fat">Мазнини (г)</Label>
                      <Input
                        id="target_fat"
                        type="number"
                        value={formData.target_fat}
                        onChange={(e) => handleInputChange('target_fat', e.target.value)}
                        placeholder="70"
                        min="0"
                        max="300"
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">💡 Съвет</h4>
                    <p className="text-xs text-yellow-700">
                      Можете да оставите празни полетата, които не искате да следите. 
                      След създаването можете да добавите конкретни храни и ястия за всеки ден.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800">Резюме</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Клиент:</span>
                      <span className="font-medium">{selectedClient?.full_name || 'Не е избран'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Тип режим:</span>
                      <span className="font-medium">{selectedPlanType.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Начална дата:</span>
                      <span className="font-medium">
                        {formatScheduledDate(formData.start_date)}
                      </span>
                    </div>
                    {formData.end_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Крайна дата:</span>
                        <span className="font-medium">
                          {formatScheduledDate(formData.end_date)}
                        </span>
                      </div>
                    )}
                    {formData.target_calories && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Дневни калории:</span>
                        <span className="font-medium">{formData.target_calories}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" asChild>
              <Link href="/protected/nutrition">
                Отказ
              </Link>
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.client_id || !formData.name.trim()}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Създаване...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Създай режим
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}