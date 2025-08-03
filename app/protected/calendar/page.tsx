// app/protected/calendar/page.tsx
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
  Play,
  CheckCircle2,
  Plus,
  Filter,
  Eye
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Workout {
  id: string;
  name: string;
  scheduled_date: string;
  estimated_duration_minutes: number;
  workout_type: string;
  difficulty_level?: string;
  status?: 'scheduled' | 'completed' | 'skipped';
  workout_programs?: {
    name: string;
    trainer_id: string;
    profiles?: {
      full_name: string;
    };
  };
  completed_at?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  workouts: Workout[];
}

const WORKOUT_COLORS = {
  strength: "bg-blue-100 text-blue-800 border-blue-200",
  cardio: "bg-red-100 text-red-800 border-red-200", 
  flexibility: "bg-green-100 text-green-800 border-green-200",
  rest: "bg-gray-100 text-gray-800 border-gray-200",
  active_recovery: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

const BULGARIAN_MONTHS = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];

const BULGARIAN_DAYS = ["Нед", "Пон", "Вто", "Сря", "Чет", "Пет", "Съб"];

export default function WorkoutCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [userRole, setUserRole] = useState<'client' | 'trainer' | null>(null);

  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchWorkouts();
    }
  }, [currentDate, userRole]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, workouts]);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setUserRole(profile?.role || 'client');
  };

  const fetchWorkouts = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get start and end of month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      let query = supabase
        .from("workouts")
        .select(`
          *,
          workout_programs!inner(
            name,
            trainer_id,
            profiles!workout_programs_trainer_id_fkey(full_name)
          )
        `)
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate)
        .order("scheduled_date", { ascending: true });

      // Filter based on user role
      if (userRole === 'client') {
        query = query.eq("workout_programs.client_id", user.id);
      } else if (userRole === 'trainer') {
        query = query.eq("workout_programs.trainer_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get workout completion status from logs
      const workoutIds = data?.map(w => w.id) || [];
      if (workoutIds.length > 0) {
        const { data: logs } = await supabase
          .from("workout_logs")
          .select("workout_id, completed, completed_at")
          .in("workout_id", workoutIds);

        // Merge completion status
        const workoutsWithStatus = data?.map(workout => {
          const log = logs?.find(l => l.workout_id === workout.id);
          return {
            ...workout,
            status: log ? (log.completed ? 'completed' : 'skipped') : 'scheduled',
            completed_at: log?.completed_at
          };
        }) || [];

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
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the beginning of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End at the end of the week containing the last day
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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const markWorkoutComplete = async (workoutId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("workout_logs")
        .upsert({
          client_id: user.id,
          workout_id: workoutId,
          date: new Date().toISOString().split('T')[0],
          exercises_completed: [], // Empty for quick complete
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Refresh workouts
      fetchWorkouts();
    } catch (error) {
      console.error("Error marking workout complete:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <CalendarIcon className="h-6 w-6 mr-2" />
            Календар с тренировки
          </h1>
          <p className="text-muted-foreground">
            Планирайте и проследявайте тренировките си
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Днес
          </Button>
          {userRole === 'trainer' && (
            <Button asChild>
              <Link href="/protected/programs/create">
                <Plus className="h-4 w-4 mr-2" />
                Нова програма
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Navigation */}
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
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Планирани
            </Badge>
            <Badge variant="success" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Завършени
            </Badge>
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
              onWorkoutClick={setSelectedWorkout}
              onMarkComplete={markWorkoutComplete}
              userRole={userRole}
            />
          ))}
        </div>
      </Card>

      {/* Workout Details Modal */}
      {selectedWorkout && (
        <WorkoutDetailsModal 
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onMarkComplete={markWorkoutComplete}
          userRole={userRole}
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
  onMarkComplete, 
  userRole 
}: { 
  day: CalendarDay; 
  onWorkoutClick: (workout: Workout) => void;
  onMarkComplete: (workoutId: string) => void;
  userRole: string | null;
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
        {day.isToday && (
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        )}
      </div>
      
      <div className="space-y-1">
        {day.workouts.slice(0, 3).map((workout) => (
          <WorkoutItem 
            key={workout.id}
            workout={workout}
            onClick={() => onWorkoutClick(workout)}
            onMarkComplete={onMarkComplete}
            userRole={userRole}
          />
        ))}
        
        {day.workouts.length > 3 && (
          <div className="text-xs text-muted-foreground text-center py-1">
            +{day.workouts.length - 3} още
          </div>
        )}
      </div>
    </div>
  );
}

function WorkoutItem({ 
  workout, 
  onClick, 
  onMarkComplete, 
  userRole 
}: { 
  workout: Workout; 
  onClick: () => void;
  onMarkComplete: (workoutId: string) => void;
  userRole: string | null;
}) {
  const isCompleted = workout.status === 'completed';
  const workoutTypeColor = WORKOUT_COLORS[workout.workout_type as keyof typeof WORKOUT_COLORS] || WORKOUT_COLORS.strength;
  
  return (
    <div 
      className={`
        text-xs p-2 rounded border cursor-pointer transition-all hover:shadow-sm
        ${isCompleted ? 'bg-green-50 border-green-200 text-green-800' : workoutTypeColor}
      `}
      onClick={onClick}
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
        
        {!isCompleted && userRole === 'client' && (
          <Button
            size="sm"
            variant="ghost"
            className="h-4 w-4 p-0 hover:bg-green-100"
            onClick={(e) => {
              e.stopPropagation();
              onMarkComplete(workout.id);
            }}
          >
            <CheckCircle2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2 mt-1">
        <span className="flex items-center gap-1">
          <Clock className="h-2 w-2" />
          {workout.estimated_duration_minutes}мин
        </span>
        {workout.difficulty_level && (
          <span className="text-[10px] opacity-75">
            {workout.difficulty_level}
          </span>
        )}
      </div>
    </div>
  );
}

function WorkoutDetailsModal({ 
  workout, 
  onClose, 
  onMarkComplete, 
  userRole 
}: { 
  workout: Workout; 
  onClose: () => void;
  onMarkComplete: (workoutId: string) => void;
  userRole: string | null;
}) {
  const isCompleted = workout.status === 'completed';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{workout.name}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Програма</p>
              <p className="font-medium">{workout.workout_programs?.name}</p>
              {workout.workout_programs?.profiles?.full_name && (
                <p className="text-sm text-muted-foreground">
                  Треньор: {workout.workout_programs.profiles.full_name}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Продължителност</p>
                <p className="font-medium">{workout.estimated_duration_minutes} минути</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Тип</p>
                <Badge variant="secondary">{workout.workout_type}</Badge>
              </div>
            </div>
            
            {workout.difficulty_level && (
              <div>
                <p className="text-sm text-muted-foreground">Ниво</p>
                <p className="font-medium">{workout.difficulty_level}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground">Статус</p>
              <Badge variant={isCompleted ? "success" : "secondary"}>
                {isCompleted ? "Завършена" : "Планирана"}
              </Badge>
              {isCompleted && workout.completed_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Завършена: {new Date(workout.completed_at).toLocaleString('bg-BG')}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Затвори
            </Button>
            
            <Button asChild className="flex-1">
              <Link href={`/protected/workouts/${workout.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Детайли
              </Link>
            </Button>
            
            {!isCompleted && userRole === 'client' && (
              <Button 
                onClick={() => {
                  onMarkComplete(workout.id);
                  onClose();
                }}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Завърши
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}