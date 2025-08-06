// app/protected/clients/programs/create/page.tsx - Поправена версия
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
  Calendar,
  Target,
  Save,
  Clock,
  Dumbbell
} from 'lucide-react';
import Link from 'next/link';
import { createSupabaseClient } from '@/utils/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const workoutTypes = [
  { value: 'strength', label: 'Силова тренировка', color: 'bg-blue-500' },
  { value: 'cardio', label: 'Кардио', color: 'bg-red-500' },
  { value: 'hiit', label: 'HIIT', color: 'bg-orange-500' },
  { value: 'flexibility', label: 'Гъвкавост', color: 'bg-green-500' },
  { value: 'sport', label: 'Спорт', color: 'bg-purple-500' },
  { value: 'recovery', label: 'Възстановяване', color: 'bg-gray-500' }
];

const daysOfWeek = ['Нед', 'Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб'];

export default function CreateProgramsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [workouts, setWorkouts] = useState<Record<string, any>>({});
  const [showWorkoutDialog, setShowWorkoutDialog] = useState<boolean>(false);
  const [editingWorkout, setEditingWorkout] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('=== STARTING FETCH CLIENTS ===');
      
      const supabase = createSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('User authentication error:', userError);
        setError('Не сте влязъл в системата');
        setClients([]);
        setLoading(false);
        return;
      }

      console.log('Authenticated user ID:', user.id);

      // Вземи всички активни клиенти, асоциирани с треньора
      const { data: trainerClients, error: trainerClientsError } = await supabase
        .from('trainer_clients')
        .select('client_id, status')
        .eq('trainer_id', user.id)
        .eq('status', 'active');

      console.log('Trainer clients query result:', { data: trainerClients, error: trainerClientsError });

      if (trainerClientsError) {
        console.error('Error fetching trainer clients:', trainerClientsError);
        setError('Грешка при заредане на връзките с клиентите: ' + trainerClientsError.message);
        setClients([]);
        setLoading(false);
        return;
      }

      if (!trainerClients || trainerClients.length === 0) {
        console.log('No active clients found for trainer');
        setClients([]);
        setLoading(false);
        return;
      }

      const clientIds = trainerClients.map(tc => tc.client_id);
      console.log('Client IDs to fetch profiles for:', clientIds);

      // Вземи профилите на клиентите (БЕЗ 'goals' полето което не съществува)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone')
        .in('id', clientIds);

      console.log('Profiles query result:', { data: profiles, error: profilesError });

      if (profilesError) {
        console.error('Error fetching client profiles:', profilesError);
        setError('Грешка при заредане на профилите на клиентите: ' + profilesError.message);
        setClients([]);
        setLoading(false);
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found for the client IDs');
        setClients([]);
        setLoading(false);
        return;
      }

      console.log('Successfully loaded client profiles:', profiles);
      setClients(profiles);
      
    } catch (error: any) {
      console.error('Unexpected error in fetchClients:', error);
      setError('Неочаквана грешка: ' + error.message);
      setClients([]);
    } finally {
      setLoading(false);
      console.log('=== FETCH CLIENTS COMPLETE ===');
    }
  };

  // Calendar generation functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    while (startDate <= endDate) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const renderCalendarView = () => {
    const days = viewMode === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);
    
    if (viewMode === 'week') {
      return (
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map(day => (
            <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-50 rounded-md">
              {day}
            </div>
          ))}
          {days.map((date: Date) => {
            const dateKey = formatDate(date);
            const workout = workouts[dateKey];
            const todayClass = isToday(date);
            
            return (
              <Card 
                key={dateKey}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md min-h-[120px] ${
                  todayClass ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => {
                  setEditingWorkout({ date });
                  setShowWorkoutDialog(true);
                }}
              >
                <CardContent className="p-3 h-full">
                  <div className="flex flex-col h-full">
                    <div className="text-lg font-bold mb-2">{date.getDate()}</div>
                    {workout && (
                      <div className="flex-1">
                        <Badge 
                          className={`text-xs mb-2 ${workoutTypes.find(t => t.value === workout.type)?.color} text-white`}
                        >
                          {workoutTypes.find(t => t.value === workout.type)?.label}
                        </Badge>
                        <div className="text-sm font-medium text-gray-900">{workout.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {workout.duration} мин
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    }

    // Month view
    return (
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-700 bg-gray-100">
            {day}
          </div>
        ))}
        {days.map((date: Date) => {
          const dateKey = formatDate(date);
          const workout = workouts[dateKey];
          const todayClass = isToday(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          
          return (
            <Card 
              key={dateKey}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md min-h-[80px] ${
                !isCurrentMonthDate ? 'opacity-40' : ''
              } ${todayClass ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
              onClick={() => {
                setEditingWorkout({ date });
                setShowWorkoutDialog(true);
              }}
            >
              <CardContent className="p-2 h-full">
                <div className="flex flex-col h-full">
                  <div className="text-sm font-semibold mb-1">{date.getDate()}</div>
                  {workout && (
                    <div className="flex-1">
                      <Badge 
                        className={`text-xs mb-1 ${workoutTypes.find(t => t.value === workout.type)?.color} text-white`}
                      >
                        {workoutTypes.find(t => t.value === workout.type)?.label}
                      </Badge>
                      <div className="text-xs font-medium text-gray-900 line-clamp-1">{workout.name}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-4">Възникна грешка:</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchClients}>Опитай отново</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/protected/clients">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Назад
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Създаване на тренировъчни програми</h1>
              <p className="text-gray-600 mt-1">Планирайте тренировки за вашите клиенти</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              onClick={() => setViewMode('week')}
              size="sm"
            >
              Седмичен изглед
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              onClick={() => setViewMode('month')}
              size="sm"
            >
              Месечен изглед
            </Button>
          </div>
        </div>

        {/* Client Selection */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Избор на клиент
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2 text-gray-600">Няма намерени клиенти</h3>
                <p className="text-gray-500 mb-4">
                  За да създадете тренировъчни програми, първо трябва да имате клиенти.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/protected/clients/invite">
                      <Plus className="h-4 w-4 mr-2" />
                      Покани клиент
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client: any) => (
                  <Card 
                    key={client.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md p-4 ${
                      selectedClient?.id === client.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {client.full_name?.charAt(0)?.toUpperCase() || 'К'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {client.full_name || 'Без име'}
                        </h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                      {selectedClient?.id === client.id && (
                        <div className="text-blue-500">
                          <Target className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar Section */}
        {selectedClient && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Календар за {selectedClient.full_name}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    {viewMode === 'month' 
                      ? currentDate.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })
                      : `${getWeekDays(currentDate)[0].getDate()} - ${getWeekDays(currentDate)[6].getDate()} ${currentDate.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })}`
                    }
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderCalendarView()}
            </CardContent>
          </Card>
        )}

        {/* Workout Statistics */}
        {selectedClient && Object.keys(workouts).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Dumbbell className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Общо тренировки</p>
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(workouts).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Средно време</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(Object.values(workouts).reduce((acc: any, w: any) => acc + (w.duration || 60), 0) / Object.keys(workouts).length)} мин
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Типове тренировки</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(Object.values(workouts).map((w: any) => w.type)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        {selectedClient && Object.keys(workouts).length > 0 && (
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg">
              <Save className="h-4 w-4 mr-2" />
              Запиши като чернова
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Save className="h-4 w-4 mr-2" />
              Създай програма
            </Button>
          </div>
        )}
      </div>

      {/* Workout Dialog */}
      <Dialog open={showWorkoutDialog} onOpenChange={setShowWorkoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingWorkout?.date 
                ? `Тренировка за ${editingWorkout.date.toLocaleDateString('bg-BG')}` 
                : 'Нова тренировка'
              }
            </DialogTitle>
            <DialogDescription>
              Създайте или редактирайте тренировка за избрания ден
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="workout-name" className="text-sm font-medium">Име на тренировката</Label>
              <Input 
                id="workout-name"
                placeholder="Например: Силова тренировка за горна част"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="workout-type" className="text-sm font-medium">Тип тренировка</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Изберете тип" />
                </SelectTrigger>
                <SelectContent>
                  {workoutTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workout-duration" className="text-sm font-medium">Продължителност (минути)</Label>
              <Input 
                id="workout-duration"
                type="number"
                placeholder="45"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="workout-notes" className="text-sm font-medium">Бележки</Label>
              <Textarea 
                id="workout-notes"
                placeholder="Допълнителни инструкции или бележки..."
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowWorkoutDialog(false)}>
              Отказ
            </Button>
            <Button>
              Запиши тренировка
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}