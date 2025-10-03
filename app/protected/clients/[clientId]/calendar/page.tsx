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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Dumbbell,
  Plus,
  Trash2,
  Save,
  X,
  Target,
  CheckCircle2,
  Bed,
  Copy
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { dateToLocalDateString } from "@/utils/date-utils";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { WorkoutEditModal } from "@/components/calendar/WorkoutEditModal";

interface WorkoutSession {
  id: string;
  name: string;
  scheduled_date: string;
  status: 'planned' | 'completed' | 'skipped';
  program_id?: string;
  client_id: string;
  exercises?: unknown[];
  workout_type?: string;
  instructions?: string;
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
  workouts: WorkoutSession[];
}

interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: unknown[];
  workout_type: string;
  difficulty_level: string;
  estimated_duration_minutes: number;
}

const WORKOUT_TYPES = [
  { value: 'strength', label: 'Силова тренировка', color: 'bg-blue-100 text-blue-800' },
  { value: 'cardio', label: 'Кардио', color: 'bg-red-100 text-red-800' },
  { value: 'flexibility', label: 'Гъвкавост', color: 'bg-green-100 text-green-800' },
  { value: 'rest', label: 'Почивка', color: 'bg-muted text-muted-foreground' },
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

const BULGARIAN_DAYS = ["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"];

export default function ClientCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateSelectModal, setShowTemplateSelectModal] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutSession | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copySourceDate, setCopySourceDate] = useState<Date | null>(null);
  const [copyWorkoutId, setCopyWorkoutId] = useState<string | null>(null);

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
    fetchWorkoutTemplates();
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

  const fetchWorkoutTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("workouts")
        .select("id, name, description, exercises, workout_type, difficulty_level, estimated_duration_minutes")
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkoutTemplates(data || []);
    } catch (error) {
      console.error("Error fetching workout templates:", error);
    }
  };

  const fetchWorkouts = async () => {
    if (!client) return;
    
    setLoading(true);
    
    try {
      // Get start and end of month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = dateToLocalDateString(startOfMonth);
      const endDate = dateToLocalDateString(endOfMonth);

      const { data, error } = await supabase
        .from("workout_sessions")
        .select(`
          *,
          workout_programs(name)
        `)
        .eq("client_id", clientId)
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;

      // workout_sessions вече има status поле, не е нужно да търсим в workout_logs
      setWorkouts(data || []);
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
    // Adjust for Monday start (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    const endDate = new Date(lastDay);
    // Adjust end date for Monday start
    const lastDayOfWeek = lastDay.getDay();
    const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    endDate.setDate(endDate.getDate() + daysToAdd);
    
    const days: CalendarDay[] = [];
    const currentDateLoop = new Date(startDate);
    const today = new Date();
    
    while (currentDateLoop <= endDate) {
      const dateStr = dateToLocalDateString(currentDateLoop);
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

  const openCreateModal = (date: Date, workoutType: string = 'strength', name: string = '') => {
    setSelectedDate(date);

    if (workoutType === 'rest') {
      setWorkoutForm({
        name: name || 'Ден за почивка',
        workout_type: 'rest',
        difficulty_level: 'beginner',
        estimated_duration_minutes: 0,
        instructions: '',
        program_id: ''
      });
      setEditingWorkout(null);
      setShowRestModal(true);
      return;
    }

    // Set first active program as default, or empty string if no programs
    const defaultProgramId = programs.length > 0 ? programs[0].id : '';

    setWorkoutForm({
      name: name,
      workout_type: workoutType,
      difficulty_level: 'intermediate',
      estimated_duration_minutes: workoutType === 'cardio' ? 30 : 60,
      instructions: '',
      program_id: defaultProgramId
    });
    setEditingWorkout(null);
    setShowCreateModal(true);
  };

  const openEditModal = (workout: WorkoutSession) => {
    setEditingWorkout(workout);

    // Check if it's a rest day
    if (workout.workout_type === 'rest') {
      setSelectedDate(new Date(workout.scheduled_date + 'T00:00:00'));
      setWorkoutForm({
        name: workout.name,
        workout_type: workout.workout_type || 'rest',
        difficulty_level: 'beginner',
        estimated_duration_minutes: 0,
        instructions: workout.instructions || '',
        program_id: ''
      });
      setShowRestModal(true);
    } else {
      setShowEditModal(true);
    }
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
        scheduled_date: dateToLocalDateString(selectedDate),
        program_id: workoutForm.program_id || null,
        status: 'planned' as const,
        workout_type: workoutForm.workout_type,
        instructions: workoutForm.instructions || null,
        exercises: editingWorkout?.exercises || [] // Keep existing exercises or empty array
      };

      if (editingWorkout) {
        // Update existing workout session
        const { error } = await supabase
          .from("workout_sessions")
          .update(workoutData)
          .eq("id", editingWorkout.id)
          .select();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
      } else {
        // Create new workout session
        const { error } = await supabase
          .from("workout_sessions")
          .insert(workoutData)
          .select();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
      }

      setShowCreateModal(false);
      setShowRestModal(false);
      fetchWorkouts();
    } catch (error) {
      console.error("Error saving workout:", error);
      // Log full error details
      if (error && typeof error === 'object') {
        console.error("Error details:", JSON.stringify(error, null, 2));
      }
      alert(`Грешка при запазване на тренировката: ${error instanceof Error ? error.message : 'Неизвестна грешка'}`);
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази тренировка?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("workout_sessions")
        .delete()
        .eq("id", workoutId);

      if (error) throw error;
      fetchWorkouts();
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert("Грешка при изтриване на тренировката");
    }
  };


  const copyDay = async (targetDate: Date) => {
    if (!copySourceDate) {
      alert("Първо изберете ден за копиране");
      return;
    }

    const sourceDateStr = dateToLocalDateString(copySourceDate);
    const targetDateStr = dateToLocalDateString(targetDate);

    const sourceWorkouts = workouts.filter(w => w.scheduled_date === sourceDateStr);

    if (sourceWorkouts.length === 0) {
      alert("Няма тренировки за копиране от избрания ден");
      setCopySourceDate(null);
      return;
    }

    try {
      const workoutsToCreate = sourceWorkouts.map(workout => ({
        client_id: clientId,
        name: workout.name,
        scheduled_date: targetDateStr,
        program_id: workout.program_id,
        status: 'planned',
        workout_type: workout.workout_type,
        exercises: workout.exercises || []
      }));

      const { error } = await supabase
        .from("workout_sessions")
        .insert(workoutsToCreate);

      if (error) throw error;

      setCopySourceDate(null);
      fetchWorkouts();
      alert(`Копирани ${sourceWorkouts.length} тренировки`);
    } catch (error) {
      console.error("Error copying workouts:", error);
      alert("Грешка при копиране на тренировките");
    }
  };

  const copyWorkout = async (workoutId: string, targetDate: Date) => {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) {
      alert("Тренировката не е намерена");
      return;
    }

    try {
      const workoutData = {
        client_id: clientId,
        name: workout.name,
        scheduled_date: dateToLocalDateString(targetDate),
        program_id: workout.program_id,
        status: 'planned',
        workout_type: workout.workout_type,
        exercises: workout.exercises || []
      };

      const { error } = await supabase
        .from("workout_sessions")
        .insert(workoutData);

      if (error) throw error;

      fetchWorkouts();
      alert("Тренировка успешно копирана!");
    } catch (error) {
      console.error("Error copying workout:", error);
      alert("Грешка при копиране на тренировката");
    }
  };

  const addWorkoutFromTemplate = async (templateId: string, date: Date) => {
    const template = workoutTemplates.find(t => t.id === templateId);
    if (!template) {
      alert("Тренировката не е намерена");
      return;
    }

    try {
      const workoutData = {
        client_id: clientId,
        name: template.name,
        scheduled_date: dateToLocalDateString(date),
        program_id: null,
        status: 'planned' as const,
        workout_type: template.workout_type,
        exercises: template.exercises || [],
        instructions: template.description || null
      };

      console.log("Adding workout from template:", workoutData);

      const { data, error } = await supabase
        .from("workout_sessions")
        .insert(workoutData)
        .select();

      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }

      console.log("Workout added successfully:", data);

      setShowTemplateSelectModal(false);
      fetchWorkouts();
      alert(`Тренировка "${template.name}" добавена успешно!`);
    } catch (error) {
      console.error("Error adding workout from template:", error);
      if (error && typeof error === 'object' && 'message' in error) {
        alert(`Грешка при добавяне на тренировката: ${(error as { message: string }).message}`);
      } else {
        alert("Грешка при добавяне на тренировката");
      }
    }
  };

  const handleQuickAction = (date: Date, action: string) => {
    // Check if action is a copy workout action
    if (action.startsWith('copy_workout_')) {
      const workoutId = action.replace('copy_workout_', '');

      // If a workout is already selected for copying, paste it
      if (copyWorkoutId) {
        copyWorkout(copyWorkoutId, date);
        setCopyWorkoutId(null);
      } else {
        // Select this workout for copying
        setCopyWorkoutId(workoutId);
        const workout = workouts.find(w => w.id === workoutId);
        alert(`Тренировка "${workout?.name}" избрана за копиране. Кликнете на друг ден за да я поставите там.`);
      }
      return;
    }

    switch (action) {
      case 'add_rest':
        openCreateModal(date, 'rest', 'Ден за почивка');
        break;
      case 'add_from_template':
        setSelectedDate(date);
        setShowTemplateSelectModal(true);
        break;
      case 'copy_day':
        if (copySourceDate) {
          copyDay(date);
        } else {
          const sourceDateStr = dateToLocalDateString(date);
          const sourceWorkouts = workouts.filter(w => w.scheduled_date === sourceDateStr);

          if (sourceWorkouts.length === 0) {
            alert('Не можете да копирате празен ден. Моля, изберете ден със съществуващи тренировки.');
            return;
          }

          setCopySourceDate(date);
          alert('Ден избран за копиране. Сега кликнете на друг ден за да поставите копието.');
        }
        break;
      case 'paste_workout':
        if (copyWorkoutId) {
          copyWorkout(copyWorkoutId, date);
          setCopyWorkoutId(null);
        }
        break;
      default:
        openCreateModal(date);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/protected/clients">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Назад</span>
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
              {client.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold flex items-center">
                <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                <span className="hidden sm:inline">Календар - </span>{client.full_name}
              </h1>
              <p className="text-muted-foreground text-sm truncate">{client.email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/protected/clients/${clientId}/programs`}>
              <Dumbbell className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Програми</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/protected/clients/${clientId}/progress`}>
              <Target className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Прогрес</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-3 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="text-lg sm:text-xl font-semibold">
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

          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            {WORKOUT_TYPES.slice(0, 3).map((type) => (
              <Badge key={type.value} className={`${type.color} text-xs whitespace-nowrap`}>
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {/* Week headers */}
          {BULGARIAN_DAYS.map((day) => (
            <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <CalendarDayCell
              key={index}
              day={day}
              onEditWorkout={openEditModal}
              onDeleteWorkout={deleteWorkout}
              onQuickAction={handleQuickAction}
              copySourceDate={copySourceDate}
              copyWorkoutId={copyWorkoutId}
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

      {/* Rest Day Modal */}
      {showRestModal && (
        <RestDayModal
          isOpen={showRestModal}
          isEditing={!!editingWorkout}
          selectedDate={selectedDate}
          workoutForm={workoutForm}
          setWorkoutForm={setWorkoutForm}
          onSave={saveWorkout}
          onClose={() => {
            setShowRestModal(false);
            setEditingWorkout(null);
          }}
          onDelete={editingWorkout ? () => deleteWorkout(editingWorkout.id) : undefined}
        />
      )}

      {/* Advanced Edit Modal */}
      <WorkoutEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        workout={editingWorkout}
        onSave={() => {
          setShowEditModal(false);
          fetchWorkouts();
        }}
      />

      {/* Template Select Modal */}
      {showTemplateSelectModal && selectedDate && (
        <TemplateSelectModal
          isOpen={showTemplateSelectModal}
          selectedDate={selectedDate}
          templates={workoutTemplates}
          onSelectTemplate={(templateId) => addWorkoutFromTemplate(templateId, selectedDate)}
          onClose={() => setShowTemplateSelectModal(false)}
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
  onEditWorkout,
  onDeleteWorkout,
  onQuickAction,
  copySourceDate,
  copyWorkoutId
}: {
  day: CalendarDay;
  onEditWorkout: (workout: WorkoutSession) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onQuickAction: (date: Date, action: string) => void;
  copySourceDate: Date | null;
  copyWorkoutId: string | null;
}) {
  const dayNumber = day.date.getDate();

  return (
    <div className={`
      min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border border-border transition-colors hover:bg-muted/30 group
      ${!day.isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''}
      ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}
      ${copySourceDate && dateToLocalDateString(day.date) === dateToLocalDateString(copySourceDate) ? 'bg-yellow-50 border-yellow-300' : ''}
      ${copyWorkoutId ? 'cursor-copy' : ''}
    `}>
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <span className={`text-xs sm:text-sm font-medium ${day.isToday ? 'text-blue-600' : ''}`}>
          {dayNumber}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
            >
              <Plus className="h-2 w-2 sm:h-3 sm:w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => onQuickAction(day.date, 'default')}>
              <Plus className="h-4 w-4 mr-2" />
              Създай нова тренировка
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickAction(day.date, 'add_from_template')}>
              <Dumbbell className="h-4 w-4 mr-2" />
              Добави готова тренировка
            </DropdownMenuItem>
            {day.workouts.length === 0 && (
              <DropdownMenuItem onClick={() => onQuickAction(day.date, 'add_rest')}>
                <Bed className="h-4 w-4 mr-2" />
                Добави почивка
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onQuickAction(day.date, 'copy_day')}>
              <Copy className="h-4 w-4 mr-2" />
              {copySourceDate ? 'Постави ден' : 'Копирай ден'}
            </DropdownMenuItem>
            {copyWorkoutId && (
              <DropdownMenuItem onClick={() => onQuickAction(day.date, 'paste_workout')}>
                <Copy className="h-4 w-4 mr-2" />
                Постави тренировка тук
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="space-y-1">
        {day.workouts.slice(0, 2).map((workout) => (
          <WorkoutItem
            key={workout.id}
            workout={workout}
            onEdit={() => onEditWorkout(workout)}
            onDelete={() => onDeleteWorkout(workout.id)}
            onCopy={() => onQuickAction(day.date, 'copy_workout_' + workout.id)}
          />
        ))}
        
        {day.workouts.length > 2 && (
          <div className="text-xs text-muted-foreground text-center py-1">
            +{day.workouts.length - 2} още
          </div>
        )}
        
        {day.workouts.length === 0 && day.isCurrentMonth && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-6 sm:h-8 text-[10px] sm:text-xs text-muted-foreground border-dashed border"
              >
                <Plus className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                <span className="hidden sm:inline">Добави</span>
                <span className="sm:hidden">+</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              <DropdownMenuItem onClick={() => onQuickAction(day.date, 'default')}>
                <Plus className="h-4 w-4 mr-2" />
                Създай нова тренировка
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onQuickAction(day.date, 'add_from_template')}>
                <Dumbbell className="h-4 w-4 mr-2" />
                Добави готова тренировка
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onQuickAction(day.date, 'add_rest')}>
                <Bed className="h-4 w-4 mr-2" />
                Добави почивка
              </DropdownMenuItem>
              {copySourceDate && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onQuickAction(day.date, 'copy_day')}>
                    <Copy className="h-4 w-4 mr-2" />
                    Постави ден
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function WorkoutItem({
  workout,
  onEdit,
  onDelete,
  onCopy
}: {
  workout: WorkoutSession;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
}) {
  const isCompleted = workout.status === 'completed';
  const isPlanned = workout.status === 'planned';
  const isRestDay = workout.workout_type === 'rest';

  return (
    <div
      onClick={onEdit}
      className={`
        text-[10px] sm:text-xs p-1 sm:p-2 rounded border cursor-pointer transition-all hover:shadow-sm group
        ${isRestDay ? 'bg-gray-50 border-gray-300 text-gray-700' :
          isCompleted ? 'bg-green-50 border-green-200 text-green-800' :
          isPlanned ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-muted text-muted-foreground'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5 sm:gap-1 min-w-0 flex-1">
          {isRestDay ? (
            <Bed className="h-2 w-2 sm:h-3 sm:w-3 text-gray-600 flex-shrink-0" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-2 w-2 sm:h-3 sm:w-3 text-green-600 flex-shrink-0" />
          ) : (
            <Dumbbell className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
          )}
          <span className="font-medium truncate">{workout.name}</span>
        </div>

        {!isRestDay && workout.exercises && workout.exercises.length > 0 && (
          <span className="text-[8px] sm:text-xs text-muted-foreground ml-1 hidden sm:inline">
            ({workout.exercises.length} упр.)
          </span>
        )}

        <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            variant="ghost"
            className="h-3 w-3 sm:h-4 sm:w-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
          >
            <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-3 w-3 sm:h-4 sm:w-4 p-0 text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
        <span className="text-[8px] sm:text-[10px] opacity-75 truncate">
          {isRestDay ? 'Почивен ден' : (workout.workout_programs?.name || 'Тренировка')}
        </span>
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
  workoutForm: {
    name: string;
    workout_type: string;
    difficulty_level: string;
    estimated_duration_minutes: number;
    instructions: string;
    program_id: string;
  };
  setWorkoutForm: (form: {
    name: string;
    workout_type: string;
    difficulty_level: string;
    estimated_duration_minutes: number;
    instructions: string;
    program_id: string;
  }) => void;
  programs: WorkoutProgram[];
  onSave: () => void;
  onClose: () => void;
}) {
  if (!isOpen || !selectedDate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
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
                value={dateToLocalDateString(selectedDate)}
                readOnly
                className="bg-muted/30"
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
              {programs.length > 0 ? (
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
              ) : (
                <div className="text-sm text-muted-foreground p-2 border rounded bg-muted/30">
                  Няма активни програми. Тренировката ще бъде създадена без програма.
                </div>
              )}
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

function RestDayModal({
  isOpen,
  isEditing,
  selectedDate,
  workoutForm,
  setWorkoutForm,
  onSave,
  onClose,
  onDelete
}: {
  isOpen: boolean;
  isEditing?: boolean;
  selectedDate: Date | null;
  workoutForm: {
    name: string;
    workout_type: string;
    difficulty_level: string;
    estimated_duration_minutes: number;
    instructions: string;
    program_id: string;
  };
  setWorkoutForm: (form: {
    name: string;
    workout_type: string;
    difficulty_level: string;
    estimated_duration_minutes: number;
    instructions: string;
    program_id: string;
  }) => void;
  onSave: () => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  if (!isOpen || !selectedDate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">
                {isEditing ? 'Редактирай почивен ден' : 'Добави почивен ден'}
              </h3>
            </div>
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
                value={dateToLocalDateString(selectedDate)}
                readOnly
                className="bg-muted/30"
              />
            </div>

            <div>
              <Label htmlFor="rest-name">Име (опционално)</Label>
              <Input
                id="rest-name"
                value={workoutForm.name}
                onChange={(e) => setWorkoutForm({...workoutForm, name: e.target.value})}
                placeholder="Напр: Активна почивка"
              />
            </div>

            <div>
              <Label htmlFor="rest-instructions">Бележки (опционално)</Label>
              <Textarea
                id="rest-instructions"
                value={workoutForm.instructions}
                onChange={(e) => setWorkoutForm({...workoutForm, instructions: e.target.value})}
                placeholder="Напр: Лека разходка, стречинг..."
                rows={3}
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                Почивните дни са важна част от тренировъчния процес. Използвайте ги за възстановяване и регенерация.
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            {isEditing && onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm("Сигурни ли сте, че искате да изтриете този почивен ден?")) {
                    onDelete();
                    onClose();
                  }
                }}
                className="flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отказ
            </Button>
            <Button onClick={onSave} className="flex-1 bg-gray-600 hover:bg-gray-700">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Запази промените' : 'Добави почивка'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TemplateSelectModal({
  isOpen,
  selectedDate,
  templates,
  onSelectTemplate,
  onClose
}: {
  isOpen: boolean;
  selectedDate: Date;
  templates: WorkoutTemplate[];
  onSelectTemplate: (templateId: string) => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const getWorkoutTypeLabel = (type: string) => {
    const workoutType = WORKOUT_TYPES.find(t => t.value === type);
    return workoutType?.label || type;
  };

  const getWorkoutTypeColor = (type: string) => {
    const workoutType = WORKOUT_TYPES.find(t => t.value === type);
    return workoutType?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Избери готова тренировка</h3>
              <p className="text-sm text-muted-foreground">
                Дата: {selectedDate.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                Все още нямате създадени готови тренировки.
              </p>
              <Button variant="outline" asChild>
                <Link href="/protected/workouts">
                  Създай тренировка
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge className={`text-xs ${getWorkoutTypeColor(template.workout_type)}`}>
                          {getWorkoutTypeLabel(template.workout_type)}
                        </Badge>
                      </div>

                      {template.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          {template.exercises?.length || 0} упражнения
                        </span>
                        <span>⏱️ {template.estimated_duration_minutes} мин</span>
                        <span>📊 {template.difficulty_level === 'beginner' ? 'Начинаещ' : template.difficulty_level === 'intermediate' ? 'Средно' : 'Напреднал'}</span>
                      </div>
                    </div>

                    <Button size="sm" onClick={() => onSelectTemplate(template.id)}>
                      Избери
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отказ
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}