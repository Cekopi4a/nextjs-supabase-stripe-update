// app/protected/clients/[clientId]/programs/create/page.tsx
"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/utils/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Plus,
  User,
  Target,
  Clock,
  Save,
  Dumbbell,
  Edit,
  Trash2,
  Copy,
  Settings,
  Search,
  Filter,
  X,
  Info,
  CalendarDays,
  Timer,
  Weight,
  Repeat,
  BarChart3
} from 'lucide-react';

// Interfaces
interface SelectProps {
  children: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const Select = ({ children, value, onValueChange, className = "" }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleItemClick = (itemValue: string) => {
    onValueChange(itemValue);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || "Избери..."}</span>
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-md">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              const props = child.props as { value?: string; children?: ReactNode };
              return (
                <div 
                  key={props.value}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleItemClick(props.value || '')}
                >
                  {props.children}
                </div>
              );
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

interface SelectItemProps {
  children: ReactNode;
  value: string;
  onClick?: () => void;
}

const SelectItem = ({ children, value, onClick }: SelectItemProps) => (
  <div 
    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
    onClick={onClick}
  >
    {children}
  </div>
);

interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
}

interface Exercise {
  id: string;
  name: string;
  muscle_groups: string[];
  difficulty: string;
  exercise_type: string;
  equipment: string[];
  instructions: { steps: string[] };
  is_global: boolean;
}

interface WorkoutExercise {
  exercise_id: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  weight: string;
  rest_time: number;
  notes: string;
  order: number;
}

interface CalendarDay {
  date: Date;
  workouts: WorkoutExercise[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const BULGARIAN_MONTHS = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];

const BULGARIAN_DAYS = ["Нед", "Пон", "Вто", "Сря", "Чет", "Пет", "Съб"];

const muscleGroups = [
  "chest", "shoulders", "triceps", "biceps", "back", "core", 
  "quadriceps", "hamstrings", "glutes", "calves", "legs", "cardiovascular"
];

export default function ClientProgramCreator() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const supabase = createSupabaseClient();

  // States
  const [client, setClient] = useState<Client | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  
  const [programName, setProgramName] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("intermediate");
  const [durationWeeks, setDurationWeeks] = useState(4);
  
  // Calendar states
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [workouts, setWorkouts] = useState<Record<string, WorkoutExercise[]>>({});
  
  // Exercise library states
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClientData();
    fetchExercises();
    generateCalendarDays();
  }, [clientId, currentDate]);

  useEffect(() => {
    // Filter exercises
    let filtered = exercises;
    
    if (searchTerm) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedMuscleGroup) {
      filtered = filtered.filter(ex => 
        ex.muscle_groups.includes(selectedMuscleGroup)
      );
    }
    
    setFilteredExercises(filtered);
  }, [searchTerm, selectedMuscleGroup, exercises]);

  const fetchClientData = async () => {
    try {
      console.log('Fetching client data for ID:', clientId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone, created_at')
        .eq('id', clientId)
        .single();

      console.log('Client query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No client data found');
      }
      
      setClient(data);
      setProgramName(`Програма за ${data.full_name}`);
    } catch (err) {
      console.error('Error fetching client:', err);
      setError('Грешка при зареждане на клиента');
    }
  };

  const fetchExercises = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .or(`trainer_id.eq.${user.id},is_global.eq.true`)
        .order('name');

      if (error) throw error;
      
      setExercises(data || []);
    } catch (err) {
      console.error('Error fetching exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    
    // Start from Monday
    const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    firstDayOfCalendar.setDate(firstDayOfMonth.getDate() - dayOfWeek);
    
    const days: CalendarDay[] = [];
    const dateLoop = new Date(firstDayOfCalendar);
    
    while (days.length < 42) { // 6 weeks × 7 days
      const dateKey = dateLoop.toISOString().split('T')[0];
      const isCurrentMonth = dateLoop.getMonth() === month;
      const isToday = dateLoop.toDateString() === new Date().toDateString();
      
      days.push({
        date: new Date(dateLoop),
        workouts: workouts[dateKey] || [],
        isCurrentMonth,
        isToday
      });
      
      dateLoop.setDate(dateLoop.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const addExerciseToDay = (exercise: Exercise, date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayWorkouts = workouts[dateKey] || [];
    
    const newExercise: WorkoutExercise = {
      exercise_id: exercise.id,
      exercise: exercise,
      sets: 3,
      reps: exercise.exercise_type === "cardio" ? "10 мин" : "8-12",
      weight: exercise.equipment.includes("none") ? "bodyweight" : "",
      rest_time: 60,
      notes: "",
      order: dayWorkouts.length
    };

    setWorkouts({
      ...workouts,
      [dateKey]: [...dayWorkouts, newExercise]
    });
  };

  const removeExerciseFromDay = (date: Date, exerciseIndex: number) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayWorkouts = [...(workouts[dateKey] || [])];
    dayWorkouts.splice(exerciseIndex, 1);
    
    // Reorder remaining exercises
    dayWorkouts.forEach((ex, idx) => {
      ex.order = idx;
    });
    
    setWorkouts({
      ...workouts,
      [dateKey]: dayWorkouts
    });
  };

  const updateExercise = (date: Date, exerciseIndex: number, field: keyof WorkoutExercise, value: any) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayWorkouts = [...(workouts[dateKey] || [])];
    dayWorkouts[exerciseIndex] = { ...dayWorkouts[exerciseIndex], [field]: value };
    
    setWorkouts({
      ...workouts,
      [dateKey]: dayWorkouts
    });
  };

  const saveProgram = async () => {
    if (!programName.trim()) {
      alert("Моля въведете име на програмата");
      return;
    }

    const workoutDays = Object.keys(workouts).filter(date => workouts[date].length > 0);
    if (workoutDays.length === 0) {
      alert("Моля добавете поне една тренировка");
      return;
    }

    setSaving(true);

    try {
      console.log('=== STARTING SAVE PROGRAM ===');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log('User authenticated:', user.id);
      console.log('Client ID:', clientId);
      console.log('Program data:', {
        trainer_id: user.id,
        client_id: clientId,
        name: programName,
        description: programDescription,
        program_type: "workout_only",
        goals: { goals: programDescription || "" },
        difficulty_level: difficultyLevel,
        estimated_duration_weeks: durationWeeks,
        is_active: true
      });

      // Create workout program
      const { data: program, error: programError } = await supabase
        .from("workout_programs")
        .insert({
          trainer_id: user.id,
          client_id: clientId,
          name: programName,
          description: programDescription,
          program_type: "workout_only",
          goals: { goals: programDescription || "" },
          difficulty_level: difficultyLevel,
          estimated_duration_weeks: durationWeeks,
          is_active: true
        })
        .select()
        .single();

      console.log('Program creation result:', { data: program, error: programError });

      if (programError) {
        console.error('Program creation error:', programError);
        throw programError;
      }

      // Create individual workouts for each day with exercises
      console.log('Creating workouts for days:', workoutDays);
      for (const dateKey of workoutDays) {
        const date = new Date(dateKey);
        const dayWorkouts = workouts[dateKey];
        
        console.log(`Processing workout for ${dateKey}:`, dayWorkouts);
        
        const workoutData = {
          program_id: program.id,
          name: `Тренировка ${date.toLocaleDateString('bg-BG')}`,
          day_of_week: date.getDay(),
          week_number: 1,
          workout_type: "strength",
          exercises: dayWorkouts.map(ex => ({
            exercise_id: ex.exercise_id,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest_time: ex.rest_time,
            notes: ex.notes,
            order: ex.order
          })),
          estimated_duration_minutes: dayWorkouts.length * 10 + 30 // Rough estimate
        };
        
        console.log('Workout data to insert:', workoutData);
        
        const { data: workoutResult, error: workoutError } = await supabase
          .from("workouts")
          .insert(workoutData)
          .select();

        console.log('Workout creation result:', { data: workoutResult, error: workoutError });

        if (workoutError) {
          console.error('Workout creation error:', workoutError);
          throw workoutError;
        }
      }

      console.log('=== PROGRAM SAVED SUCCESSFULLY ===');
      alert(`Програмата "${programName}" беше създадена успешно!`);
      router.push(`/protected/clients/${clientId}`);
      
    } catch (error: any) {
      console.error("=== ERROR SAVING PROGRAM ===");
      console.error("Full error object:", error);
      console.error("Error message:", error?.message);
      console.error("Error details:", error?.details);
      console.error("Error hint:", error?.hint);
      console.error("Error code:", error?.code);
      
      let errorMessage = "Грешка при запазване на програмата";
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
      console.log('=== SAVE PROGRAM COMPLETE ===');
    }
  };

  const getTotalExercises = () => {
    return Object.values(workouts).reduce((total, dayWorkouts) => total + dayWorkouts.length, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error || "Клиентът не е намерен"}</p>
          <Button onClick={() => router.push('/protected/clients')}>
            Назад към клиентите
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/protected/clients')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Клиенти
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {client.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Програма за {client.full_name}
                </h1>
                <p className="text-gray-600">Създайте персонализирана тренировъчна програма</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowExerciseLibrary(!showExerciseLibrary)}
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              {showExerciseLibrary ? "Скрий" : "Библиотека"}
            </Button>
            <Button 
              onClick={saveProgram} 
              disabled={saving || !programName.trim() || getTotalExercises() === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Запазване..." : "Запази програма"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Program Settings Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Настройки на програмата
              </h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="program-name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Име на програмата
                  </Label>
                  <Input
                    id="program-name"
                    value={programName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramName(e.target.value)}
                    placeholder="Например: Силова програма"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="program-description" className="text-sm font-medium text-gray-700 mb-2 block">
                    Описание
                  </Label>
                  <Textarea
                    id="program-description"
                    value={programDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProgramDescription(e.target.value)}
                    placeholder="Кратко описание на програмата..."
                    className="w-full min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty-level" className="text-sm font-medium text-gray-700 mb-2 block">
                    Ниво на сложност
                  </Label>
                  <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                    <SelectItem value="beginner">Начинаещ</SelectItem>
                    <SelectItem value="intermediate">Средно ниво</SelectItem>
                    <SelectItem value="advanced">Напреднал</SelectItem>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration-weeks" className="text-sm font-medium text-gray-700 mb-2 block">
                    Продължителност
                  </Label>
                  <Select value={durationWeeks.toString()} onValueChange={(val: string) => setDurationWeeks(parseInt(val))}>
                    <SelectItem value="2">2 седмици</SelectItem>
                    <SelectItem value="4">4 седмици</SelectItem>
                    <SelectItem value="6">6 седмици</SelectItem>
                    <SelectItem value="8">8 седмици</SelectItem>
                    <SelectItem value="12">12 седмици</SelectItem>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Client Info */}
          <Card className="shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Информация за клиента
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {client.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.full_name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  {client.phone && <div>Телефон: {client.phone}</div>}
                  <div>
                    Присъединен: {client.created_at ? new Date(client.created_at).toLocaleDateString('bg-BG') : 'Неизвестно'}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Program Summary */}
          <Card className="shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Обобщение
              </h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Dumbbell className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium text-sm">Общо упражнения</p>
                      <p className="text-2xl font-bold text-blue-800">{getTotalExercises()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <CalendarDays className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-green-600 font-medium text-sm">Дни с тренировки</p>
                      <p className="text-2xl font-bold text-green-800">
                        {Object.keys(workouts).filter(date => workouts[date].length > 0).length}
                      </p>
                    </div>
                  </div>
                </div>

                {getTotalExercises() > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <Timer className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-purple-600 font-medium text-sm">Очаквано време/ден</p>
                        <p className="text-2xl font-bold text-purple-800">
                          ~{Math.round((getTotalExercises() / Object.keys(workouts).filter(date => workouts[date].length > 0).length) * 4) || 0} мин
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Calendar View */}
        <div className="xl:col-span-3">
          <Card className="shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Calendar className="h-6 w-6 mr-3 text-purple-600" />
                  Календар на програмата
                  <Info className="h-4 w-4 ml-2 text-gray-400" />
                </h2>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className="h-8"
                    >
                      Седмица
                    </Button>
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                      className="h-8"
                    >
                      Месец
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold min-w-[200px] text-center">
                      {BULGARIAN_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="mb-6">
                {/* Days Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {BULGARIAN_DAYS.map(day => (
                    <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const dateKey = day.date.toISOString().split('T')[0];
                    const dayWorkouts = workouts[dateKey] || [];
                    const hasWorkouts = dayWorkouts.length > 0;
                    
                    return (
                      <div
                        key={index}
                        className={`
                          h-28 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2
                          ${!day.isCurrentMonth ? 'opacity-40 bg-gray-50' : 'bg-white hover:bg-gray-50'}
                          ${day.isToday ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200'}
                          ${hasWorkouts ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100' : ''}
                          ${selectedDate?.toDateString() === day.date.toDateString() ? 'ring-2 ring-purple-500 border-purple-200' : ''}
                          hover:shadow-md hover:scale-[1.02]
                        `}
                        onClick={() => {
                          setSelectedDate(day.date);
                          setShowExerciseLibrary(true);
                        }}
                      >
                        <div className="flex flex-col h-full">
                          <div className="text-sm font-bold mb-2 text-gray-900">
                            {day.date.getDate()}
                          </div>
                          {hasWorkouts && (
                            <div className="flex-1 flex flex-col gap-1">
                              <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-0">
                                {dayWorkouts.length} упр.
                              </Badge>
                              <div className="text-xs text-gray-600 line-clamp-2 leading-tight">
                                {dayWorkouts[0]?.exercise.name}
                                {dayWorkouts.length > 1 && (
                                  <span className="block text-gray-500">+{dayWorkouts.length - 1} още...</span>
                                )}
                              </div>
                            </div>
                          )}
                          {!hasWorkouts && day.isCurrentMonth && (
                            <div className="flex-1 flex items-center justify-center">
                              <Plus className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Details */}
              {selectedDate && workouts[selectedDate.toISOString().split('T')[0]]?.length > 0 && (
                <div className="border-t pt-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4 text-gray-900 flex items-center">
                      <CalendarDays className="h-5 w-5 mr-2 text-purple-600" />
                      Тренировка за {selectedDate.toLocaleDateString('bg-BG', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="space-y-3">
                      {workouts[selectedDate.toISOString().split('T')[0]].map((workout, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{workout.exercise.name}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Repeat className="h-3 w-3" />
                                  {workout.sets} сета × {workout.reps}
                                </span>
                                {workout.weight && (
                                  <span className="flex items-center gap-1">
                                    <Weight className="h-3 w-3" />
                                    {workout.weight}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  {workout.rest_time}с почивка
                                </span>
                              </div>
                              {workout.notes && (
                                <p className="text-sm text-gray-500 mt-1 italic">"{workout.notes}"</p>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              removeExerciseFromDay(selectedDate, index);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Exercise Library Modal */}
        {showExerciseLibrary && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Dumbbell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Библиотека с упражнения
                    </h2>
                    {selectedDate && (
                      <p className="text-sm text-gray-600">
                        Избери упражнения за {selectedDate.toLocaleDateString('bg-BG', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowExerciseLibrary(false)}
                  className="rounded-full h-10 w-10 p-0 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Exercise Filters */}
              <div className="p-6 border-b bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      placeholder="Търси упражнения по име..."
                      className="pl-10 h-11"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                      <SelectItem value="">Всички мускулни групи</SelectItem>
                      {muscleGroups.map(group => (
                        <SelectItem key={group} value={group}>
                          {group.charAt(0).toUpperCase() + group.slice(1)}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
                
                {/* Filter Summary */}
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Показва се {filteredExercises.length} от {exercises.length} упражнения
                  </span>
                  {(searchTerm || selectedMuscleGroup) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedMuscleGroup("");
                      }}
                      className="h-8 px-3"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Изчисти филтрите
                    </Button>
                  )}
                </div>
              </div>

              {/* Exercise Grid */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {filteredExercises.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Dumbbell className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Няма намерени упражнения</h3>
                    <p className="text-gray-500 mb-4">Опитайте с различни филтри или създайте ново упражнение</p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Създайте ново упражнение
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredExercises.map(exercise => (
                      <Card key={exercise.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md overflow-hidden">
                        <div className="p-6">
                          {/* Exercise Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Dumbbell className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1 line-clamp-2">
                                    {exercise.name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge 
                                      variant={
                                        exercise.difficulty === 'beginner' ? 'default' :
                                        exercise.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                                      }
                                      className={
                                        exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700 border-0' :
                                        exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 border-0' : 'bg-red-100 text-red-700 border-0'
                                      }
                                    >
                                      {exercise.difficulty === 'beginner' ? 'Начинаещ' :
                                       exercise.difficulty === 'intermediate' ? 'Средно' : 'Напреднал'}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                                      {exercise.exercise_type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Exercise Details */}
                          <div className="space-y-3 mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-xs font-semibold text-blue-800 mb-1">Мускулни групи:</p>
                              <p className="text-sm text-blue-700">
                                {exercise.muscle_groups.map(group => 
                                  group.charAt(0).toUpperCase() + group.slice(1)
                                ).join(", ")}
                              </p>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs font-semibold text-gray-800 mb-1">Необходимо оборудване:</p>
                              <p className="text-sm text-gray-700">
                                {exercise.equipment.length > 0 
                                  ? exercise.equipment.join(", ") 
                                  : "Без оборудване"}
                              </p>
                            </div>
                            
                            {exercise.instructions?.steps && (
                              <div className="bg-amber-50 p-3 rounded-lg">
                                <p className="text-xs font-semibold text-amber-800 mb-2">Инструкции:</p>
                                <ol className="space-y-1">
                                  {exercise.instructions.steps.slice(0, 3).map((step, idx) => (
                                    <li key={idx} className="text-sm text-amber-700 leading-relaxed">
                                      {idx + 1}. {step}
                                    </li>
                                  ))}
                                  {exercise.instructions.steps.length > 3 && (
                                    <li className="text-sm text-amber-600 italic">
                                      ... и {exercise.instructions.steps.length - 3} още стъпки
                                    </li>
                                  )}
                                </ol>
                              </div>
                            )}
                          </div>

                          {/* Add Button */}
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
                            onClick={(e) => {
                              if (selectedDate) {
                                addExerciseToDay(exercise, selectedDate);
                                // Show success feedback
                                const button = e.target as HTMLElement;
                                const originalText = button.textContent;
                                button.textContent = "Добавено! ✓";
                                setTimeout(() => {
                                  button.textContent = originalText;
                                }, 1500);
                              }
                            }}
                            disabled={!selectedDate}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Добави упражнение
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Modal Footer */}
              <div className="border-t bg-gray-50/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {selectedDate ? (
                      <span>
                        Избран ден: <strong>{selectedDate.toLocaleDateString('bg-BG')}</strong>
                      </span>
                    ) : (
                      <span className="text-amber-600">Моля изберете ден от календара</span>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowExerciseLibrary(false)}
                  >
                    Затвори
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Progress Bar */}
        {getTotalExercises() > 0 && (
          <Card className="shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Прогрес:</span>
                    <span className="font-semibold ml-2">
                      {Object.keys(workouts).filter(date => workouts[date].length > 0).length} дни с тренировки
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-600">Общо упражнения:</span>
                    <span className="font-semibold ml-2">{getTotalExercises()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setWorkouts({})}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Изчисти всичко
                  </Button>
                  
                  <Button 
                    onClick={saveProgram}
                    disabled={saving || !programName.trim() || getTotalExercises() === 0}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Запазване..." : "Запази програма"}
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(getTotalExercises() * 10, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}