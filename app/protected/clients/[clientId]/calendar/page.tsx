// app/protected/clients/[clientId]/calendar/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Dumbbell,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  User,
  Target,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Workout {
  id: string;
  name: string;
  scheduled_date: string;
  estimated_duration_minutes: number;
  workout_type: string;
  difficulty_level?: string;
  instructions?: string;
  status?: 'scheduled' | 'completed' | 'skipped';
  program_id?: string;
  workout_programs?: {
    name: string;
  };
}

interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  workouts: Workout[];
}

interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
}

const WORKOUT_TYPES = [
  { value: 'strength', label: 'Силова тренировка', color: 'bg-blue-100 text-blue-800' },
  { value: 'cardio', label: 'Кардио', color: 'bg-red-100 text-red-800' },
  { value: 'flexibility', label: 'Гъвкавост', color: 'bg-green-100 text-green-800' },
  { value: 'rest', label: 'Почивка', color: 'bg-gray-100 text-gray-800' },
  { value: 'active_recovery', label: 'Активно възстановяване', color: 'bg-yellow-100 text-yellow-800' }
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Начинаещ' },
  { value: 'intermediate', label: 'Средно ниво' },
  { value: 'advanced', label: 'Напреднал' }
];

const BULGARIAN_MONTHS = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];

const BULGARIAN_DAYS = ["Нед", "Пон", "Вто", "Сря", "Чет", "Пет", "Съб"];

export default function ClientCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  // Form states
  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    workout_type: 'strength',
    difficulty_level: 'intermediate',
    estimated_duration_minutes: 60,
    instructions: '',
    program_id: ''
  });

  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchClientData();
    fetchPrograms();
  }, [clientId]);

  useEffect(() => {
    if (client) {
      fetchWorkouts();
    }
  }, [currentDate, client]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, workouts]);

  const fetchClientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verify trainer has access to this client
      const { data: relationship } = await supabase
        .from("trainer_clients")
        .select("*")
        .eq("trainer_id", user.id)
        .eq("client_id", clientId)
        .single();

      if (!relationship) {
        router.push("/protected/clients");
        return;
      }

      // Get client data
      const { data: clientData, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      setClient(clientData);
    } catch (error) {
      console.error("Error fetching client:", error);
      router.push("/protected/clients");
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("workout_programs")
        .select("id, name, description")
        .eq("trainer_id", user.id)
        .eq("client_id", clientId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchWorkouts = async () => {
    if (!client) return;
    
    setLoading(true);
    
    try {
      // Get start and end of month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("workouts")
        .select(`
          *,
          workout_programs(name)
        `)
        .eq("client_id", clientId)
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;

      // Get workout completion status
      const workoutIds = data?.map(w => w.id) || [];
      if (workoutIds.length > 0) {
        const { data: logs } = await supabase
          .from("workout_logs")
          .select("workout_id, completed")
          .in("workout_id", workoutIds);

        const workoutsWithStatus = data?.map(workout => ({
          ...workout,
          status: logs?.find(l => l.workout_id === workout.id)?.completed 
            ? 'completed' : 'scheduled'
        })) || [];

        setWorkouts(workoutsWithStatus);
      } else {
        setWorkouts(data || []);
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDateLoop = new Date(startDate);
    const today = new Date();
    
    while (currentDateLoop <= endDate) {
      const dateStr = currentDateLoop.toISOString().split('T')[0];
      const dayWorkouts = workouts.filter(w => w.scheduled_date === dateStr);
      
      days.push({
        date: new Date(currentDateLoop),
        isCurrentMonth: currentDateLoop.getMonth() === month,
        isToday: currentDateLoop.toDateString() === today.toDateString(),
        workouts: dayWorkouts
      });
      
      currentDateLoop.setDate(currentDateLoop.getDate() + 1);
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

  const openCreateModal = (date: Date) => {
    setSelectedDate(date);
    setWorkoutForm({
      name: '',
      workout_type: 'strength',
      difficulty_level: 'intermediate',
      estimated_duration_minutes: 60,
      instructions: '',
      program_id: programs[0]?.id || ''
    });
    setEditingWorkout(null);
    setShowCreateModal(true);
  };

  const openEditModal = (workout: Workout) => {
    setSelectedDate(new Date(workout.scheduled_date));
    setWorkoutForm({
      name: workout.name,
      workout_type: workout.workout_type,
      difficulty_level: workout.difficulty_level || 'intermediate',
      estimated_duration_minutes: workout.estimated_duration_minutes,
      instructions: workout.instructions || '',
      program_id: workout.program_id || ''
    });
    setEditingWorkout(workout);
    setShowCreateModal(true);
  };

  const saveWorkout = async () => {
    if (!selectedDate || !workoutForm.name.trim()) {
      alert("Моля въведете име на тренировката");
      return;
    }

    try {
      const workoutData = {
        client_id: clientId,
        name: workoutForm.name,
        scheduled_date: selectedDate.toISOString().split('T')[0],
        workout_type: workoutForm.workout_type,
        difficulty_level: workoutForm.difficulty_level,
        estimated_duration_minutes: workoutForm.estimated_duration_minutes,
        instructions: workoutForm.instructions,
        program_id: workoutForm.program_id || null,
        exercises: [] // Empty exercises array for now
      };

      if (editingWorkout) {
        // Update existing workout
        const { error } = await supabase
          .from("workouts")
          .update(workoutData)
          .eq("id", editingWorkout.id);
        
        if (error) throw error;
      } else {
        // Create new workout
        const { error } = await supabase
          .from("workouts")
          .insert(workoutData);
        
        if (error) throw error;
      }

      setShowCreateModal(false);
      fetchWorkouts();
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Грешка при запазване на тренировката");
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази тренировка?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) throw error;
      fetchWorkouts();
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert("Грешка при изтриване на тренировката");
    }
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/protected/clients">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Link>
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {client.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <CalendarIcon className="h-6 w-6 mr-2" />
                Календар - {client.full_name}
              </h1>
              <p className="text-muted-foreground">{client.email}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/protected/clients/${clientId}/programs`}>
              <Dumbbell className="h-4 w-4 mr-2" />
              Програми
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/protected/clients/${clientId}/progress`}>
              <Target className="h-4 w-4 mr-2" />
              Прогрес
            </Link>
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-xl font-semibold">
              {BULGARIAN_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {WORKOUT_TYPES.slice(0, 3).map((type) => (
              <Badge key={type.value} className={type.color}>
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week headers */}
          {BULGARIAN_DAYS.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <CalendarDayCell 
              key={index} 
              day={day}
              onCreateWorkout={openCreateModal}
              onEditWorkout={openEditModal}
              onDeleteWorkout={deleteWorkout}
            />
          ))}
        </div>
      </Card>

      {/* Create/Edit Workout Modal */}
      {showCreateModal && (
        <WorkoutModal
          isOpen={showCreateModal}
          isEditing={!!editingWorkout}
          selectedDate={selectedDate}
          workoutForm={workoutForm}
          setWorkoutForm={setWorkoutForm}
          programs={programs}
          onSave={saveWorkout}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

function CalendarDayCell({ 
  day, 
  onCreateWorkout, 
  onEditWorkout, 
  onDeleteWorkout 
}: { 
  day: CalendarDay; 
  onCreateWorkout: (date: Date) => void;
  onEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workoutId: string) => void;
}) {
  const dayNumber = day.date.getDate();
  
  return (
    <div className={`
      min-h-[120px] p-2 border border-gray-200 transition-colors hover:bg-gray-50
      ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
      ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}
    `}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${day.isToday ? 'text-blue-600' : ''}`}>
          {dayNumber}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
          onClick={() => onCreateWorkout(day.date)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-1">
        {day.workouts.slice(0, 2).map((workout) => (
          <WorkoutItem 
            key={workout.id}
            workout={workout}
            onEdit={() => onEditWorkout(workout)}
            onDelete={() => onDeleteWorkout(workout.id)}
          />
        ))}
        
        {day.workouts.length > 2 && (
          <div className="text-xs text-muted-foreground text-center py-1">
            +{day.workouts.length - 2} още
          </div>
        )}
        
        {day.workouts.length === 0 && day.isCurrentMonth && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground border-dashed border"
            onClick={() => onCreateWorkout(day.date)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Добави
          </Button>
        )}
      </div>
    </div>
  );
}

function WorkoutItem({ 
  workout, 
  onEdit, 
  onDelete 
}: { 
  workout: Workout; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isCompleted = workout.status === 'completed';
  const workoutType = WORKOUT_TYPES.find(t => t.value === workout.workout_type);
  
  return (
    <div 
      className={`
        text-xs p-2 rounded border cursor-pointer transition-all hover:shadow-sm group
        ${isCompleted ? 'bg-green-50 border-green-200 text-green-800' : workoutType?.color || 'bg-gray-100 text-gray-800'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {isCompleted ? (
            <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
          ) : (
            <Dumbbell className="h-3 w-3 flex-shrink-0" />
          )}
          <span className="font-medium truncate">{workout.name}</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            variant="ghost"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-4 w-4 p-0 text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-1">
        <span className="flex items-center gap-1">
          <Clock className="h-2 w-2" />
          {workout.estimated_duration_minutes}мин
        </span>
        {workout.difficulty_level && (
          <span className="text-[10px] opacity-75">
            {DIFFICULTY_LEVELS.find(d => d.value === workout.difficulty_level)?.label}
          </span>
        )}
      </div>
    </div>
  );
}

function WorkoutModal({ 
  isOpen, 
  isEditing, 
  selectedDate, 
  workoutForm, 
  setWorkoutForm, 
  programs, 
  onSave, 
  onClose 
}: {
  isOpen: boolean;
  isEditing: boolean;
  selectedDate: Date | null;
  workoutForm: any;
  setWorkoutForm: (form: any) => void;
  programs: WorkoutProgram[];
  onSave: () => void;
  onClose: () => void;
}) {
  if (!isOpen || !selectedDate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {isEditing ? 'Редактирай тренировка' : 'Създай тренировка'}
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="name">Име на тренировката *</Label>
              <Input
                id="name"
                value={workoutForm.name}
                onChange={(e) => setWorkoutForm({...workoutForm, name: e.target.value})}
                placeholder="Напр: Гърди и трицепс"
              />
            </div>

            <div>
              <Label htmlFor="program">Програма</Label>
              <Select
                value={workoutForm.program_id}
                onValueChange={(value) => setWorkoutForm({...workoutForm, program_id: value === 'none' ? '' : value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Избери програма (опционално)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без програма</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Тип тренировка</Label>
              <Select
                value={workoutForm.workout_type}
                onValueChange={(value) => setWorkoutForm({...workoutForm, workout_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Ниво на трудност</Label>
              <Select
                value={workoutForm.difficulty_level}
                onValueChange={(value) => setWorkoutForm({...workoutForm, difficulty_level: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Продължителност (минути)</Label>
              <Input
                id="duration"
                type="number"
                value={workoutForm.estimated_duration_minutes}
                onChange={(e) => setWorkoutForm({...workoutForm, estimated_duration_minutes: parseInt(e.target.value)})}
                min="10"
                max="180"
              />
            </div>

            <div>
              <Label htmlFor="instructions">Инструкции (опционално)</Label>
              <Textarea
                id="instructions"
                value={workoutForm.instructions}
                onChange={(e) => setWorkoutForm({...workoutForm, instructions: e.target.value})}
                placeholder="Специални инструкции за тренировката..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отказ
            </Button>
            <Button onClick={onSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Запази промените' : 'Създай тренировка'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}