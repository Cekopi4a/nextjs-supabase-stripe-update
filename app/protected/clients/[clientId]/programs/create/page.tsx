// app/protected/clients/[clientId]/programs/create/page.tsx
"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/utils/supabase/client';
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
  Filter
} from 'lucide-react';

// UI Components
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card = ({ children, className = "", onClick }: CardProps) => (
  <div 
    className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

const CardContent = ({ children, className = "" }: CardContentProps) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

interface ButtonProps {
  children: ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const Button = ({ children, variant = "default", size = "default", className = "", onClick, disabled = false }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<string, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-background hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  const sizes: Record<string, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = ({ className = "", ...props }: InputProps) => (
  <input 
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const Textarea = ({ className = "", ...props }: TextareaProps) => (
  <textarea 
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

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

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "success" | "warning" | "destructive";
}

const Badge = ({ children, className = "", variant = "default" }: BadgeProps) => {
  const variants: Record<string, string> = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    destructive: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

const Label = ({ children, htmlFor, className = "" }: LabelProps) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  goals?: string;
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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, goals')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create workout program
      const { data: program, error: programError } = await supabase
        .from("workout_programs")
        .insert({
          trainer_id: user.id,
          client_id: clientId,
          name: programName,
          description: programDescription,
          program_type: "workout_only",
          goals: { goals: client?.goals || "" },
          difficulty_level: difficultyLevel,
          estimated_duration_weeks: durationWeeks,
          workouts_per_week: workoutDays.length,
          is_active: true
        })
        .select()
        .single();

      if (programError) throw programError;

      // Create individual workouts for each day with exercises
      for (const dateKey of workoutDays) {
        const date = new Date(dateKey);
        const dayWorkouts = workouts[dateKey];
        
        const { error: workoutError } = await supabase
          .from("workouts")
          .insert({
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
          });

        if (workoutError) throw workoutError;
      }

      alert(`Програмата "${programName}" беше създадена успешно!`);
      router.push(`/protected/clients/${clientId}`);
      
    } catch (error) {
      console.error("Error saving program:", error);
      alert("Грешка при запазване на програмата");
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/protected/clients')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
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
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowExerciseLibrary(!showExerciseLibrary)}
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              {showExerciseLibrary ? "Скрий" : "Покажи"} упражнения
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Program Settings Sidebar */}
          <Card className="lg:col-span-1">
            <CardContent>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Настройки
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="program-name">Име на програмата</Label>
                  <Input
                    id="program-name"
                    value={programName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramName(e.target.value)}
                    placeholder="Например: Силова програма"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="program-description">Описание</Label>
                  <Textarea
                    id="program-description"
                    value={programDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProgramDescription(e.target.value)}
                    placeholder="Кратко описание..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty-level">Ниво на сложност</Label>
                  <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                    <SelectItem value="beginner" onClick={() => {}}>Начинаещ</SelectItem>
                    <SelectItem value="intermediate" onClick={() => {}}>Средно ниво</SelectItem>
                    <SelectItem value="advanced" onClick={() => {}}>Напреднал</SelectItem>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration-weeks">Продължителност</Label>
                  <Select value={durationWeeks.toString()} onValueChange={(val: string) => setDurationWeeks(parseInt(val))}>
                    <SelectItem value="2" onClick={() => {}}>2 седмици</SelectItem>
                    <SelectItem value="4" onClick={() => {}}>4 седмици</SelectItem>
                    <SelectItem value="6" onClick={() => {}}>6 седмици</SelectItem>
                    <SelectItem value="8" onClick={() => {}}>8 седмици</SelectItem>
                    <SelectItem value="12" onClick={() => {}}>12 седмици</SelectItem>
                  </Select>
                </div>
              </div>

              {/* Client Info */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Информация за клиента
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Име:</span> {client.full_name}</p>
                  <p><span className="text-gray-500">Имейл:</span> {client.email}</p>
                  {client.goals && (
                    <p><span className="text-gray-500">Цели:</span> {client.goals}</p>
                  )}
                </div>
              </div>

              {/* Program Summary */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Обобщение</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-blue-600 font-medium text-sm">Общо упражнения</p>
                    <p className="text-xl font-bold text-blue-800">{getTotalExercises()}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-green-600 font-medium text-sm">Дни с тренировки</p>
                    <p className="text-xl font-bold text-green-800">
                      {Object.keys(workouts).filter(date => workouts[date].length > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card className="lg:col-span-3">
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Календар за програмата
                </h2>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                    >
                      Седмица
                    </Button>
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                    >
                      Месец
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold min-w-[200px] text-center">
                      {BULGARIAN_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {BULGARIAN_DAYS.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dateKey = day.date.toISOString().split('T')[0];
                  const dayWorkouts = workouts[dateKey] || [];
                  const hasWorkouts = dayWorkouts.length > 0;
                  
                  return (
                    <Card 
                      key={index}
                      className={`h-24 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        !day.isCurrentMonth ? 'opacity-30' : ''
                      } ${day.isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${
                        hasWorkouts ? 'bg-green-50 border-green-200' : ''
                      }`}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setShowExerciseLibrary(true);
                      }}
                    >
                      <CardContent className="p-2 h-full">
                        <div className="flex flex-col h-full">
                          <div className="text-sm font-semibold mb-1">
                            {day.date.getDate()}
                          </div>
                          {hasWorkouts && (
                            <div className="flex-1 flex flex-col gap-1">
                              <Badge variant="success" className="text-xs">
                                {dayWorkouts.length} упр.
                              </Badge>
                              <div className="text-xs text-gray-600 truncate">
                                {dayWorkouts[0]?.exercise.name}
                                {dayWorkouts.length > 1 && ` +${dayWorkouts.length - 1}`}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Selected Day Details */}
              {selectedDate && workouts[selectedDate.toISOString().split('T')[0]]?.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">
                    Тренировка за {selectedDate.toLocaleDateString('bg-BG')}
                  </h3>
                  <div className="space-y-2">
                    {workouts[selectedDate.toISOString().split('T')[0]].map((workout, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                            {index + 1}
                          </span>
                          <div>
                            <span className="font-medium">{workout.exercise.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {workout.sets} сета × {workout.reps}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            removeExerciseFromDay(selectedDate, index);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exercise Library Modal */}
        {showExerciseLibrary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">
                  Добави упражнение {selectedDate && `за ${selectedDate.toLocaleDateString('bg-BG')}`}
                </h2>
                <Button variant="ghost" onClick={() => setShowExerciseLibrary(false)}>
                  ✕
                </Button>
              </div>
              
              {/* Exercise Filters */}
              <div className="p-6 border-b bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      placeholder="Търси упражнения..."
                      className="pl-10"
                    />
                  </div>
                  
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

              {/* Exercise Grid */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {filteredExercises.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Няма намерени упражнения</h3>
                    <p className="text-gray-500">Опитайте с различни филтри или създайте ново упражнение</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredExercises.map(exercise => (
                      <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{exercise.name}</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={
                                  exercise.difficulty === 'beginner' ? 'success' :
                                  exercise.difficulty === 'intermediate' ? 'warning' : 'destructive'
                                }>
                                  {exercise.difficulty === 'beginner' ? 'Начинаещ' :
                                   exercise.difficulty === 'intermediate' ? 'Средно ниво' : 'Напреднал'}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {exercise.exercise_type}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                Мускули: {exercise.muscle_groups.join(", ")}
                              </p>
                              <p className="text-xs text-gray-500">
                                Оборудване: {exercise.equipment.join(", ")}
                              </p>
                            </div>
                            
                            <Button 
                              size="sm"
                              onClick={() => {
                                if (selectedDate) {
                                  addExerciseToDay(exercise, selectedDate);
                                }
                                setShowExerciseLibrary(false);
                              }}
                              disabled={!selectedDate}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {exercise.instructions?.steps && (
                            <div className="bg-gray-50 p-2 rounded text-xs">
                              <p className="font-medium mb-1">Инструкции:</p>
                              <ol className="space-y-1">
                                {exercise.instructions.steps.slice(0, 2).map((step, idx) => (
                                  <li key={idx} className="text-gray-600">
                                    {idx + 1}. {step}
                                  </li>
                                ))}
                                {exercise.instructions.steps.length > 2 && (
                                  <li className="text-gray-500 italic">
                                    +{exercise.instructions.steps.length - 2} още стъпки...
                                  </li>
                                )}
                              </ol>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Progress Bar */}
        {getTotalExercises() > 0 && (
          <Card>
            <CardContent className="p-4">
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}