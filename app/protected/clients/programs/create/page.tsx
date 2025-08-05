// app/protected/clients/programs/create/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, User, Dumbbell, Clock, Target, ChevronLeft, ChevronRight, Save, Edit, Trash2 } from 'lucide-react';
import { createSupabaseClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interfaces
interface Client {
  id: string;
  full_name: string;
  email: string;
  goals?: string;
}

interface Exercise {
  id: string;
  name: string;
  muscle_groups: string[];
  equipment: string[];
}

interface WorkoutExercise {
  exercise_id: string;
  exercise_name?: string;
  muscle_groups?: string[];
  sets: number;
  reps: string;
  weight: string;
  rest_time: number;
  notes: string;
  order: number;
}

interface WorkoutForm {
  name: string;
  type: string;
  exercises: WorkoutExercise[];
  instructions: string;
  estimated_duration: number;
}

// Mock data - заменете с реални данни от Supabase
const mockClients = [
  { id: '1', full_name: 'Иван Петров', email: 'ivan@example.com', goals: 'Отслабване' },
  { id: '2', full_name: 'Мария Георгиева', email: 'maria@example.com', goals: 'Увеличаване на мускулна маса' },
  { id: '3', full_name: 'Петър Димитров', email: 'petar@example.com', goals: 'Обща физическа форма' }
];

const mockExercises = [
  { id: '1', name: 'Клек', muscle_groups: ['legs', 'glutes'], equipment: ['barbell'] },
  { id: '2', name: 'Bench Press', muscle_groups: ['chest', 'triceps'], equipment: ['barbell'] },
  { id: '3', name: 'Deadlift', muscle_groups: ['back', 'legs'], equipment: ['barbell'] },
  { id: '4', name: 'Pull-ups', muscle_groups: ['back', 'biceps'], equipment: ['pull-up bar'] },
  { id: '5', name: 'Push-ups', muscle_groups: ['chest', 'triceps'], equipment: [] },
  { id: '6', name: 'Planks', muscle_groups: ['core'], equipment: [] }
];

const workoutTypes = [
  { value: 'strength', label: 'Силова', color: 'bg-blue-500' },
  { value: 'cardio', label: 'Кардио', color: 'bg-red-500' },
  { value: 'flexibility', label: 'Гъвкавост', color: 'bg-green-500' },
  { value: 'rest', label: 'Почивка', color: 'bg-gray-500' },
  { value: 'active_recovery', label: 'Активно възстановяване', color: 'bg-yellow-500' }
];

  const daysOfWeek = ['Нед', 'Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб'];

  // Функция за създаване на базови упражнения
  const createBasicExercises = async (trainerId: string, supabaseClient: any) => {
    try {
      const basicExercises = [
        {
          name: 'Клек',
          muscle_groups: ['legs', 'glutes'],
          equipment: ['barbell'],
          is_global: true,
          trainer_id: null
        },
        {
          name: 'Bench Press',
          muscle_groups: ['chest', 'triceps'],
          equipment: ['barbell'],
          is_global: true,
          trainer_id: null
        },
        {
          name: 'Deadlift',
          muscle_groups: ['back', 'legs'],
          equipment: ['barbell'],
          is_global: true,
          trainer_id: null
        },
        {
          name: 'Pull-ups',
          muscle_groups: ['back', 'biceps'],
          equipment: ['pull-up bar'],
          is_global: true,
          trainer_id: null
        },
        {
          name: 'Push-ups',
          muscle_groups: ['chest', 'triceps'],
          equipment: [],
          is_global: true,
          trainer_id: null
        },
        {
          name: 'Planks',
          muscle_groups: ['core'],
          equipment: [],
          is_global: true,
          trainer_id: null
        }
      ];

      const { error } = await supabaseClient
        .from('exercises')
        .insert(basicExercises);

      if (error) {
        console.error('Error creating basic exercises:', error);
      } else {
        console.log('Basic exercises created successfully');
      }
    } catch (error) {
      console.error('Error in createBasicExercises:', error);
    }
  };



  export default function CreateWorkoutProgramPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [workouts, setWorkouts] = useState<Record<string, any>>({});
  const [showWorkoutDialog, setShowWorkoutDialog] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createSupabaseClient();

  // Workout form state
  const [workoutForm, setWorkoutForm] = useState<WorkoutForm>({
    name: '',
    type: 'strength',
    exercises: [],
    instructions: '',
    estimated_duration: 60
  });

  // Exercise form state
  const [exerciseForm, setExerciseForm] = useState({
    exercise_id: '',
    sets: 3,
    reps: '10-12',
    weight: '',
    rest_time: 60,
    notes: ''
  });

  useEffect(() => {
    fetchClients();
    fetchExercises();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        setLoading(false);
        return;
      }
  
      console.log('Fetching clients for trainer:', user.id);
  
      // Проста и директна заявка
      const { data: trainerClients, error } = await supabase
        .from("trainer_clients")
        .select("client_id, status")
        .eq("trainer_id", user.id)
        .eq("status", "active");
  
      if (error) {
        console.error('Error fetching trainer clients:', error);
        throw error;
      }
  
      console.log('Trainer clients found:', trainerClients);
  
      if (!trainerClients || trainerClients.length === 0) {
        console.log('No active clients found');
        setClients([]);
        setLoading(false);
        return;
      }
  
      // Извличаме профилите на клиентите
      const clientIds = trainerClients.map(tc => tc.client_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", clientIds);
  
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
  
      console.log('Client profiles found:', profiles);
  
      // Форматираме данните
      const clientsData = profiles?.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Без име',
        email: profile.email,
        goals: 'Обща физическа форма' // Default стойност
      })) || [];
  
      console.log('Final clients data:', clientsData);
      setClients(clientsData as Client[]);
  
    } catch (error) {
      console.error('Error in fetchClients:', error);
      // Можете да покажете съобщение за грешка на потребителя
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found for exercises');
        setExercises(mockExercises);
        return;
      }

      console.log('Fetching exercises for user:', user.id);

      // Първо опитваме да вземем глобалните упражнения
      console.log('Fetching global exercises...');
      const { data: globalExercises, error: globalError } = await supabase
        .from("exercises")
        .select("*")
        .eq("is_global", true)
        .order("name");

      console.log('Global exercises result:', { data: globalExercises, error: globalError });

      if (globalError) {
        console.error('Error fetching global exercises:', globalError);
        // Не хвърляме грешка веднага, опитваме с проста заявка
        console.log('Trying simple query for exercises...');
        const { data: simpleExercises, error: simpleError } = await supabase
          .from("exercises")
          .select("*")
          .limit(10);

        console.log('Simple exercises result:', { data: simpleExercises, error: simpleError });

        if (simpleError) {
          throw globalError; // Хвърляме оригиналната грешка
        }

        // Ако простата заявка работи, използваме всички упражнения
        setExercises(simpleExercises || []);
        return;
      }

      // След това опитваме да вземем упражненията на тренъра
      const { data: trainerExercises, error: trainerError } = await supabase
        .from("exercises")
        .select("*")
        .eq("trainer_id", user.id)
        .order("name");

      if (trainerError) {
        console.error('Error fetching trainer exercises:', trainerError);
        // Не хвърляме грешка тук, защото може да няма упражнения на тренъра
      }

      // Комбинираме упражненията
      const allExercises = [
        ...(globalExercises || []),
        ...(trainerExercises || [])
      ];

      console.log('All exercises:', allExercises);
      
      // Ако няма упражнения в базата данни, създаваме някои базови
      if (allExercises.length === 0) {
        console.log('No exercises found in database, creating basic exercises...');
        await createBasicExercises(user.id, supabase);
        setExercises(mockExercises);
      } else {
        setExercises(allExercises);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      alert('Грешка при зареждане на упражненията. Използват се тестови данни.');
      // Fallback to mock data
      setExercises(mockExercises);
    }
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);

    // Добавяме дни от предишния месец за попълване на календара
    const startDay = firstDay.getDay();
    startDate.setDate(firstDay.getDate() - startDay);

    // Добавяме дни от следващия месец
    const endDay = lastDay.getDay();
    endDate.setDate(lastDay.getDate() + (6 - endDay));

    const dates = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(currentDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const addExerciseToWorkout = () => {
    if (!exerciseForm.exercise_id) return;
    
    const exercise = exercises.find(ex => ex.id === exerciseForm.exercise_id);
    const newExercise: WorkoutExercise = {
      ...exerciseForm,
      exercise_name: exercise?.name,
      muscle_groups: exercise?.muscle_groups,
      order: workoutForm.exercises.length + 1
    };

    setWorkoutForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));

    setExerciseForm({
      exercise_id: '',
      sets: 3,
      reps: '10-12',
      weight: '',
      rest_time: 60,
      notes: ''
    });
  };

  const removeExercise = (index: number) => {
    setWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const saveWorkout = (date: Date) => {
    if (!workoutForm.name || workoutForm.exercises.length === 0) {
      alert('Моля въведете име на тренировката и добавете поне едно упражнение');
      return;
    }

    const dateKey = formatDateKey(date);
    const workout = {
      ...workoutForm,
      date: dateKey,
      id: editingWorkout?.id || Date.now().toString()
    };

    setWorkouts(prev => ({
      ...prev,
      [dateKey]: workout
    }));

    setShowWorkoutDialog(false);
    setEditingWorkout(null);
    setWorkoutForm({
      name: '',
      type: 'strength',
      exercises: [],
      instructions: '',
      estimated_duration: 60
    });
  };

  const editWorkout = (date: Date) => {
    const dateKey = formatDateKey(date);
    const workout = workouts[dateKey];
    if (workout) {
      setWorkoutForm(workout);
      setEditingWorkout({ ...workout, date });
      setShowWorkoutDialog(true);
    }
  };

  const deleteWorkout = (date: Date) => {
    const dateKey = formatDateKey(date);
    setWorkouts(prev => {
      const newWorkouts = { ...prev };
      delete newWorkouts[dateKey];
      return newWorkouts;
    });
  };

  const saveProgram = async () => {
    if (!selectedClient || !programName) {
      alert('Моля изберете клиент и въведете име на програмата');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create workout program
      const { data: program, error: programError } = await supabase
        .from('workout_programs')
        .insert({
          name: programName,
          description: programDescription,
          trainer_id: user.id,
          client_id: selectedClient.id,
          is_active: true
        })
        .select()
        .single();

      if (programError) throw programError;

      // Create workouts
      const workoutPromises = Object.entries(workouts).map(([date, workout]) => {
        const dayOfWeek = new Date(date).getDay();
        return supabase
          .from('workouts')
          .insert({
            program_id: program.id,
            name: workout.name,
            day_of_week: dayOfWeek,
            workout_type: workout.type,
            exercises: workout.exercises,
            estimated_duration_minutes: workout.estimated_duration,
            instructions: workout.instructions
          });
      });

      await Promise.all(workoutPromises);

      alert('Програмата е запазена успешно!');
      router.push('/protected/clients');
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Грешка при запазване на програмата');
    }
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    
    return (
      <div className="grid grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const dateKey = formatDateKey(date);
          const workout = workouts[dateKey];
          const isToday = formatDateKey(new Date()) === dateKey;
          
          return (
            <Card key={dateKey} className={`min-h-[200px] ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{daysOfWeek[index]}</h3>
                    <p className="text-sm text-muted-foreground">{date.getDate()}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingWorkout({ date });
                      setShowWorkoutDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {workout ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${workoutTypes.find(t => t.value === workout.type)?.color} text-white`}
                      >
                        {workoutTypes.find(t => t.value === workout.type)?.label}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm">{workout.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {workout.estimated_duration} мин
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Dumbbell className="h-3 w-3" />
                      {workout.exercises.length} упражнения
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editWorkout(date)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteWorkout(date)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-sm">
                    Без тренировка
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const currentMonth = currentDate.getMonth();
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm">
            {day}
          </div>
        ))}
        {monthDates.map((date) => {
          const dateKey = formatDateKey(date);
          const workout = workouts[dateKey];
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isToday = formatDateKey(new Date()) === dateKey;
          
          return (
            <Card 
              key={dateKey} 
              className={`min-h-[80px] cursor-pointer transition-colors hover:bg-muted/50 ${
                !isCurrentMonth ? 'opacity-50' : ''
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => {
                setEditingWorkout({ date });
                setShowWorkoutDialog(true);
              }}
            >
              <CardContent className="p-2">
                <div className="text-sm font-medium">{date.getDate()}</div>
                {workout && (
                  <div className="mt-1">
                    <Badge 
                      className={`text-xs ${workoutTypes.find(t => t.value === workout.type)?.color} text-white`}
                    >
                      {workoutTypes.find(t => t.value === workout.type)?.label}
                    </Badge>
                    <div className="text-xs mt-1 truncate">{workout.name}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Зареждане...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
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
            <h1 className="text-3xl font-bold">Създаване на тренировъчни програми</h1>
            <p className="text-muted-foreground">Планирайте тренировки за вашите клиенти</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
          >
            Седмичен изглед
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            onClick={() => setViewMode('month')}
          >
            Месечен изглед
          </Button>
        </div>
      </div>

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Избор на клиент
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Няма намерени клиенти</h3>
              <p className="text-muted-foreground mb-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clients.map(client => (
                <Card 
                  key={client.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedClient?.id === client.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{client.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                    <Badge variant="outline" className="mt-2">
                      {client.goals}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedClient && (
        <>
          {/* Program Details */}
          <Card>
            <CardHeader>
              <CardTitle>Детайли на програмата</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="program-name">Име на програмата</Label>
                  <Input
                    id="program-name"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    placeholder="например: Програма за отслабване - Януари 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="client-name">Клиент</Label>
                  <Input
                    id="client-name"
                    value={selectedClient.full_name}
                    disabled
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="program-description">Описание</Label>
                <Textarea
                  id="program-description"
                  value={programDescription}
                  onChange={(e) => setProgramDescription(e.target.value)}
                  placeholder="Кратко описание на програмата и целите..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Calendar Navigation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {viewMode === 'week' ? 'Седмичен план' : 'Месечен план'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold">
                    {viewMode === 'week' 
                      ? `Седмица от ${getWeekDates(currentDate)[0].toLocaleDateString('bg-BG')}`
                      : currentDate.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })
                    }
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'week' ? renderWeekView() : renderMonthView()}
            </CardContent>
          </Card>

          {/* Save Program */}
          <div className="flex justify-end">
            <Button onClick={saveProgram} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Запази програмата
            </Button>
          </div>
        </>
      )}

      {/* Workout Dialog */}
      <Dialog open={showWorkoutDialog} onOpenChange={setShowWorkoutDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWorkout?.id ? 'Редактиране на тренировка' : 'Нова тренировка'}
            </DialogTitle>
            <DialogDescription>
              {editingWorkout?.date && 
                `Дата: ${editingWorkout.date.toLocaleDateString('bg-BG')}`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workout-name">Име на тренировката</Label>
                <Input
                  id="workout-name"
                  value={workoutForm.name}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="например: Push Day - Гърди, рамене, трицепс"
                />
              </div>
              <div>
                <Label htmlFor="workout-type">Тип тренировка</Label>
                <Select
                  value={workoutForm.type}
                  onValueChange={(value) => setWorkoutForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimated-duration">Предполагаема продължителност (минути)</Label>
                <Input
                  id="estimated-duration"
                  type="number"
                  value={workoutForm.estimated_duration}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 60 }))}
                />
              </div>
            </div>

            {/* Add Exercise */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Добави упражнение</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Упражнение</Label>
                    <Select
                      value={exerciseForm.exercise_id}
                      onValueChange={(value) => setExerciseForm(prev => ({ ...prev, exercise_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Избери упражнение" />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises.map(exercise => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Сетове</Label>
                    <Input
                      type="number"
                      value={exerciseForm.sets}
                      onChange={(e) => setExerciseForm(prev => ({ ...prev, sets: parseInt(e.target.value) || 3 }))}
                    />
                  </div>
                  <div>
                    <Label>Повторения</Label>
                    <Input
                      value={exerciseForm.reps}
                      onChange={(e) => setExerciseForm(prev => ({ ...prev, reps: e.target.value }))}
                      placeholder="10-12 или 15"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Тегло (кг)</Label>
                    <Input
                      value={exerciseForm.weight}
                      onChange={(e) => setExerciseForm(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="20 или 15-20"
                    />
                  </div>
                  <div>
                    <Label>Почивка (секунди)</Label>
                    <Input
                      type="number"
                      value={exerciseForm.rest_time}
                      onChange={(e) => setExerciseForm(prev => ({ ...prev, rest_time: parseInt(e.target.value) || 60 }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addExerciseToWorkout} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Добави
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Бележки</Label>
                  <Textarea
                    value={exerciseForm.notes}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Техника, специални указания..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Exercise List */}
            {workoutForm.exercises.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Упражнения в тренировката</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workoutForm.exercises.map((exercise: WorkoutExercise, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{exercise.exercise_name}</h4>
                          <div className="text-sm text-muted-foreground mt-1">
                            {exercise.sets} сета × {exercise.reps} повторения
                            {exercise.weight && ` × ${exercise.weight}кг`}
                            {exercise.rest_time && ` • Почивка: ${exercise.rest_time}с`}
                          </div>
                          {exercise.notes && (
                            <p className="text-sm text-muted-foreground mt-1 italic">
                              {exercise.notes}
                            </p>
                          )}
                          <div className="flex gap-1 mt-2">
                            {exercise.muscle_groups?.map((group: string) => (
                              <Badge key={group} variant="secondary" className="text-xs">
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeExercise(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <div>
              <Label htmlFor="workout-instructions">Инструкции за тренировката</Label>
              <Textarea
                id="workout-instructions"
                value={workoutForm.instructions}
                onChange={(e) => setWorkoutForm(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Общи указания, загрявка, техника..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWorkoutDialog(false)}>
                Отказ
              </Button>
              <Button onClick={() => saveWorkout(editingWorkout?.date || new Date())}>
                {editingWorkout?.id ? 'Запази промените' : 'Създай тренировка'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}