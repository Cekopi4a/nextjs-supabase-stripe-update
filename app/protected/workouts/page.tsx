"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Dumbbell,
  CheckCircle2,
  User,
  Play
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { formatScheduledDate, dateToLocalDateString } from "@/utils/date-utils";
import { ActiveWorkoutSession } from "@/components/workout/active-workout-session";

interface WorkoutExercise {
  id?: string;
  exercise_id: string;
  exercise?: {
    id: string;
    name: string;
    primary_muscles: string[];
    secondary_muscles: string[];
    equipment: string;
    level: string;
    images: string[];
    custom_images: string[];
    video_urls?: string[];
  };
  planned_sets: number;
  planned_reps: string;
  planned_weight?: string;
  rest_time: number;
  notes?: string;
  order: number;
}

interface Workout {
  id: string;
  name: string;
  scheduled_date: string;
  estimated_duration_minutes: number;
  workout_type: string;
  difficulty_level?: string;
  status?: 'scheduled' | 'completed' | 'skipped';
  notes?: string;
  workout_programs?: {
    name: string;
    trainer_id: string;
    profiles?: {
      full_name: string;
    };
  };
  completed_at?: string;
  exercises?: WorkoutExercise[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  workouts: Workout[];
}

const WORKOUT_COLORS = {
  strength: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700",
  cardio: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700", 
  flexibility: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700",
  rest: "bg-muted text-muted-foreground border-border",
  active_recovery: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700"
};

const BULGARIAN_MONTHS = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];

const BULGARIAN_DAYS = ["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"];

export default function ClientWorkoutsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchWorkouts();
    }
  }, [currentDate, userProfile]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, workouts]);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
  };

  const fetchWorkouts = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get start and end of month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = dateToLocalDateString(startOfMonth);
      const endDate = dateToLocalDateString(endOfMonth);

      // Query workout sessions for client
      const { data, error } = await supabase
        .from("workout_sessions")
        .select(`
          *,
          workout_programs!inner(
            id,
            name,
            trainer_id,
            client_id,
            profiles!workout_programs_trainer_id_fkey(full_name)
          )
        `)
        .eq("client_id", user.id)
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;

      // Get all unique exercise IDs from sessions
      const exerciseIds = new Set<string>();
      data?.forEach(session => {
        if (Array.isArray(session.exercises)) {
          session.exercises.forEach((ex: any) => {
            if (ex.exercise_id) {
              exerciseIds.add(ex.exercise_id);
            }
          });
        }
      });

      // Fetch exercise details - use service role to bypass RLS for reading exercise names
      let exerciseDetails: { [key: string]: any } = {};
      if (exerciseIds.size > 0) {
        try {
          // Call API endpoint to get exercise details (bypasses RLS)
          const response = await fetch('/api/exercises/details', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ exerciseIds: Array.from(exerciseIds) })
          });
          
          if (response.ok) {
            const exercises = await response.json();
            exercises.forEach((ex: any) => {
              exerciseDetails[ex.id] = ex;
            });
          } else {
            console.error('Failed to fetch exercise details from API');
          }
        } catch (error) {
          console.error('Error calling exercise details API:', error);
        }
      }

      // Transform data to match our interface
      const workoutsWithDetails = data?.map(session => ({
        id: session.id,
        name: session.name,
        scheduled_date: session.scheduled_date,
        estimated_duration_minutes: session.planned_duration_minutes || 60,
        workout_type: 'strength', // Default type since it's not in the sessions table
        difficulty_level: session.difficulty_rating ? `${session.difficulty_rating}/10` : undefined,
        status: session.status === 'completed' ? 'completed' : (session.status === 'skipped' ? 'skipped' : 'scheduled'),
        notes: session.description,
        workout_programs: {
          name: session.workout_programs?.name || '',
          trainer_id: session.workout_programs?.trainer_id || '',
          profiles: {
            full_name: session.workout_programs?.profiles?.full_name || ''
          }
        },
        completed_at: session.completed_date,
        exercises: Array.isArray(session.exercises) ? session.exercises.map((ex: any, index: number) => {
          // Handle both JSONB format (direct names) and reference format (exercise_id)
          let exerciseName = 'Неизвестно упражнение';
          let primaryMuscles: string[] = [];
          let secondaryMuscles: string[] = [];
          let equipment = 'body only';
          let level = 'intermediate';
          let images: string[] = [];
          let customImages: string[] = [];
          let videoUrls: string[] = [];

          if (ex.name) {
            // Direct JSONB format
            exerciseName = ex.name;
            primaryMuscles = ex.primary_muscles || ex.muscle_groups || [];
            secondaryMuscles = ex.secondary_muscles || [];
            equipment = ex.equipment || 'body only';
            level = ex.level || 'intermediate';
            images = ex.images || [];
            customImages = ex.custom_images || [];
            videoUrls = ex.video_urls || [];
          } else if (ex.exercise_id) {
            // Reference format - use fetched exercise details
            const exerciseData = exerciseDetails[ex.exercise_id];
            if (exerciseData) {
              exerciseName = exerciseData.name;
              primaryMuscles = exerciseData.primary_muscles || [];
              secondaryMuscles = exerciseData.secondary_muscles || [];
              equipment = exerciseData.equipment || 'body only';
              level = exerciseData.level || 'intermediate';
              images = exerciseData.images || [];
              customImages = exerciseData.custom_images || [];
              videoUrls = exerciseData.video_urls || [];
            }
          }

          return {
            id: `temp-${index}`,
            exercise_id: ex.exercise_id || '',
            exercise: {
              id: ex.exercise_id || '',
              name: exerciseName,
              primary_muscles: primaryMuscles,
              secondary_muscles: secondaryMuscles,
              equipment: equipment,
              level: level,
              images: images,
              custom_images: customImages,
              video_urls: videoUrls
            },
            planned_sets: ex.sets || ex.planned_sets || 3,
            planned_reps: ex.reps || ex.planned_reps || '10',
            planned_weight: ex.weight || ex.planned_weight || '',
            rest_time: ex.rest_time || 60,
            notes: ex.notes || '',
            order: index
          };
        }) : []
      })) || [];

      setWorkouts(workoutsWithDetails);
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
    // Adjust to start from Monday (1) instead of Sunday (0)
    const firstDayOfWeek = firstDay.getDay();
    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const endDate = new Date(lastDay);
    // Adjust to end on Sunday (0)
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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const markWorkoutComplete = async (workoutId: string, duration?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("workout_sessions")
        .update({
          status: 'completed',
          completed_date: dateToLocalDateString(new Date()),
          actual_duration_minutes: duration || null
        })
        .eq("id", workoutId)
        .eq("client_id", user.id);

      if (error) throw error;

      setActiveWorkout(null);
      setSelectedWorkout(null);
      fetchWorkouts();
    } catch (error) {
      console.error("Error marking workout complete:", error);
    }
  };

  const handleStartWorkout = (workout: Workout) => {
    setSelectedWorkout(null);
    setActiveWorkout(workout);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Dumbbell className="h-6 w-6 mr-2" />
            Моите тренировки
          </h1>
          <p className="text-muted-foreground">
            {userProfile?.full_name && (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Добре дошъл, {userProfile.full_name}!
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Днес
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="p-8 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20 shadow-lg border-0 ring-1 ring-black/5 dark:ring-white/10">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-10 w-10 rounded-full p-0 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950 transition-all shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {BULGARIAN_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-10 w-10 rounded-full p-0 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950 transition-all shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Планирани</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Завършени</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 dark:ring-white/10">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
            {/* Week headers */}
            {BULGARIAN_DAYS.map((day) => (
              <div key={day} className="p-4 text-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => (
              <CalendarDayCell
                key={index}
                day={day}
                onWorkoutClick={setSelectedWorkout}
                onMarkComplete={markWorkoutComplete}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Workout Details Modal */}
      {selectedWorkout && (
        <ClientWorkoutDetailsModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onMarkComplete={markWorkoutComplete}
          onStartWorkout={handleStartWorkout}
        />
      )}

      {/* Active Workout Session */}
      {activeWorkout && activeWorkout.exercises && activeWorkout.exercises.length > 0 && (
        <ActiveWorkoutSession
          workoutId={activeWorkout.id}
          workoutName={activeWorkout.name}
          exercises={activeWorkout.exercises}
          onComplete={(duration) => markWorkoutComplete(activeWorkout.id, duration)}
          onCancel={() => setActiveWorkout(null)}
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
  onWorkoutClick,
  onMarkComplete
}: {
  day: CalendarDay;
  onWorkoutClick: (workout: Workout) => void;
  onMarkComplete: (workoutId: string) => void;
}) {
  const dayNumber = day.date.getDate();
  const hasWorkouts = day.workouts.length > 0;
  const completedWorkouts = day.workouts.filter(w => w.status === 'completed').length;
  const totalWorkouts = day.workouts.length;

  return (
    <div className={`
      relative min-h-[140px] p-3 border-r border-b border-slate-200 dark:border-slate-700
      transition-all duration-200
      ${!day.isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/30 opacity-60' : 'bg-white dark:bg-slate-800/30'}
      ${day.isToday ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 ring-2 ring-blue-400 dark:ring-blue-600 ring-inset' : ''}
      ${hasWorkouts && !day.isToday ? 'hover:bg-blue-50/50 dark:hover:bg-blue-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
    `}>
      {/* Day Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`
            text-sm font-bold
            ${day.isToday ? 'flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md' : ''}
            ${!day.isToday && day.isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : ''}
            ${!day.isToday && !day.isCurrentMonth ? 'text-slate-400 dark:text-slate-600' : ''}
          `}>
            {dayNumber}
          </span>
        </div>

        {/* Workout Progress Indicator */}
        {hasWorkouts && (
          <div className="flex items-center gap-1">
            {completedWorkouts === totalWorkouts ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-[10px] font-bold text-green-700 dark:text-green-400">{totalWorkouts}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Dumbbell className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">
                  {completedWorkouts}/{totalWorkouts}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workouts List */}
      <div className="space-y-1.5">
        {day.workouts.slice(0, 2).map((workout) => (
          <WorkoutItem
            key={workout.id}
            workout={workout}
            onClick={() => onWorkoutClick(workout)}
            onMarkComplete={onMarkComplete}
          />
        ))}

        {day.workouts.length > 2 && (
          <button
            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-center py-1 px-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            onClick={() => day.workouts.length > 0 && onWorkoutClick(day.workouts[2])}
          >
            +{day.workouts.length - 2} още
          </button>
        )}
      </div>

      {/* Today Indicator */}
      {day.isToday && (
        <div className="absolute bottom-2 right-2">
          <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-cyan-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

function WorkoutItem({
  workout,
  onClick,
  onMarkComplete
}: {
  workout: Workout;
  onClick: () => void;
  onMarkComplete: (workoutId: string) => void;
}) {
  const isCompleted = workout.status === 'completed';

  return (
    <div
      className={`
        group relative text-xs p-2.5 rounded-lg cursor-pointer transition-all duration-200
        ${isCompleted
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border border-green-200 dark:border-green-800 shadow-sm'
          : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-800 hover:shadow-md hover:scale-[1.02]'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div className={`
            mt-0.5 p-1 rounded-md
            ${isCompleted
              ? 'bg-green-100 dark:bg-green-900/50'
              : 'bg-blue-100 dark:bg-blue-900/50'
            }
          `}>
            {isCompleted ? (
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <Dumbbell className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className={`
              font-semibold truncate leading-tight
              ${isCompleted
                ? 'text-green-800 dark:text-green-300'
                : 'text-blue-800 dark:text-blue-300'
              }
            `}>
              {workout.name}
            </div>

            <div className={`
              flex items-center gap-2 mt-1
              ${isCompleted
                ? 'text-green-600 dark:text-green-400'
                : 'text-blue-600 dark:text-blue-400'
              }
            `}>
              <span className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                <span className="font-medium">{workout.estimated_duration_minutes}м</span>
              </span>
              {workout.difficulty_level && (
                <span className="text-[10px] opacity-75 font-medium">
                  {workout.difficulty_level}
                </span>
              )}
            </div>
          </div>
        </div>

        {!isCompleted && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-100 dark:hover:bg-green-900/50 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onMarkComplete(workout.id);
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ClientWorkoutDetailsModal({
  workout,
  onClose,
  onMarkComplete,
  onStartWorkout
}: {
  workout: Workout;
  onClose: () => void;
  onMarkComplete: (workoutId: string) => void;
  onStartWorkout: (workout: Workout) => void;
}) {
  const isCompleted = workout.status === 'completed';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border-0 ring-1 ring-black/10 dark:ring-white/10 animate-in zoom-in-95 duration-200">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{workout.name}</h3>
                  <p className="text-blue-100 text-sm flex items-center gap-2 mt-1">
                    <CalendarIcon className="h-4 w-4" />
                    {formatScheduledDate(workout.scheduled_date)}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
            >
              ✕
            </Button>
          </div>

          {/* Status Badge */}
          <div className="relative mt-4">
            <Badge
              variant={isCompleted ? "default" : "secondary"}
              className={`
                ${isCompleted
                  ? "bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg"
                  : "bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                }
                px-3 py-1
              `}
            >
              {isCompleted ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> Завършена</>
              ) : (
                <><Clock className="h-3 w-3 mr-1" /> Планирана</>
              )}
            </Badge>
            {isCompleted && workout.completed_at && (
              <p className="text-xs text-blue-100 mt-2">
                Завършена: {new Date(workout.completed_at).toLocaleString('bg-BG')}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                  <Clock className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">Продължителност</p>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{workout.estimated_duration_minutes} <span className="text-sm text-muted-foreground">мин</span></p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-1">
                  <Dumbbell className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">Тип</p>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{workout.workout_type}</p>
              </div>

              {workout.difficulty_level && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                    <User className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-wide">Ниво</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{workout.difficulty_level}</p>
                </div>
              )}
            </div>

            {/* Program Info */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Програма</p>
              <p className="font-bold text-slate-900 dark:text-white">{workout.workout_programs?.name}</p>
              {workout.workout_programs?.profiles?.full_name && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Треньор: {workout.workout_programs.profiles.full_name}
                </p>
              )}
            </div>

            {/* Exercises */}
            {workout.exercises && workout.exercises.length > 0 && (
              <div>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-cyan-500 rounded-full"></div>
                  Упражнения ({workout.exercises.length})
                </h4>
                <div className="space-y-3">
                  {workout.exercises.map((exercise, index) => (
                    <div key={exercise.id || index} className="group bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-slate-900 dark:text-white">{exercise.exercise?.name || 'Неизвестно упражнение'}</h5>
                            {exercise.exercise?.equipment && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">{exercise.exercise.equipment}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                          {exercise.exercise?.level || 'средно'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                          <span className="text-xs text-muted-foreground block mb-1">Серии</span>
                          <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{exercise.planned_sets}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                          <span className="text-xs text-muted-foreground block mb-1">Повторения</span>
                          <p className="font-bold text-lg text-cyan-600 dark:text-cyan-400">{exercise.planned_reps}</p>
                        </div>
                        {exercise.planned_weight && (
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                            <span className="text-xs text-muted-foreground block mb-1">Тежест</span>
                            <p className="font-bold text-lg text-purple-600 dark:text-purple-400">{exercise.planned_weight} кг</p>
                          </div>
                        )}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                          <span className="text-xs text-muted-foreground block mb-1">Почивка</span>
                          <p className="font-bold text-lg text-green-600 dark:text-green-400">{exercise.rest_time}с</p>
                        </div>
                      </div>

                      {exercise.exercise?.primary_muscles && exercise.exercise.primary_muscles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="text-xs text-muted-foreground">Основни мускули:</span>
                          {exercise.exercise.primary_muscles.map((muscle, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {exercise.exercise?.secondary_muscles && exercise.exercise.secondary_muscles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="text-xs text-muted-foreground">Вторични мускули:</span>
                          {exercise.exercise.secondary_muscles.map((muscle, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {exercise.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 block mb-1">Бележки:</span>
                          <span className="text-sm text-yellow-900 dark:text-yellow-200">{exercise.notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workout.notes && (
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">Общи бележки</p>
                <p className="text-sm text-slate-900 dark:text-white">{workout.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
            >
              Затвори
            </Button>

            {!isCompleted && workout.exercises && workout.exercises.length > 0 && (
              <>
                <Button
                  onClick={() => onStartWorkout(workout)}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Започни тренировка
                </Button>

                <Button
                  onClick={() => {
                    onMarkComplete(workout.id);
                    onClose();
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Завърши тренировката
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}