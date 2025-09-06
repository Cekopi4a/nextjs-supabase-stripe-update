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
  User
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";

interface WorkoutExercise {
  id?: string;
  exercise_id: string;
  exercise?: {
    id: string;
    name: string;
    muscle_groups: string[];
    equipment: string[];
    difficulty: string;
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

const BULGARIAN_DAYS = ["Нед", "Пон", "Вто", "Сря", "Чет", "Пет", "Съб"];

export default function ClientWorkoutsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
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
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

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
        exercises: Array.isArray(session.exercises) ? session.exercises.map((ex: any, index: number) => ({
          id: `temp-${index}`,
          exercise_id: '',
          exercise: {
            id: '',
            name: ex.name || 'Неизвестно упражнение',
            muscle_groups: ex.muscle_groups || [],
            equipment: ex.equipment || [],
            difficulty: ex.difficulty || 'средно'
          },
          planned_sets: ex.sets || 3,
          planned_reps: ex.reps || '10',
          planned_weight: ex.weight || '',
          rest_time: ex.rest_time || 60,
          notes: ex.notes || '',
          order: index
        })) : []
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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const markWorkoutComplete = async (workoutId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("workout_sessions")
        .update({
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0],
          actual_duration_minutes: null // Could be filled in later
        })
        .eq("id", workoutId)
        .eq("client_id", user.id);

      if (error) throw error;
      
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
            <Badge className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
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
            />
          ))}
        </div>
      </Card>

      {/* Workout Details Modal */}
      {selectedWorkout && (
        <ClientWorkoutDetailsModal 
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onMarkComplete={markWorkoutComplete}
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
  
  return (
    <div className={`
      min-h-[120px] p-2 border border-border transition-colors hover:bg-muted/30
      ${!day.isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''}
      ${day.isToday ? 'bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700' : ''}
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
  onMarkComplete
}: { 
  workout: Workout; 
  onClick: () => void;
  onMarkComplete: (workoutId: string) => void;
}) {
  const isCompleted = workout.status === 'completed';
  const workoutTypeColor = WORKOUT_COLORS[workout.workout_type as keyof typeof WORKOUT_COLORS] || WORKOUT_COLORS.strength;
  
  return (
    <div 
      className={`
        text-xs p-2 rounded border cursor-pointer transition-all hover:shadow-sm
        ${isCompleted ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-700 dark:text-green-300' : workoutTypeColor}
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
        
        {!isCompleted && (
          <Button
            size="sm"
            variant="ghost"
            className="h-4 w-4 p-0 hover:bg-green-100 dark:hover:bg-green-900"
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

function ClientWorkoutDetailsModal({ 
  workout, 
  onClose, 
  onMarkComplete
}: { 
  workout: Workout; 
  onClose: () => void;
  onMarkComplete: (workoutId: string) => void;
}) {
  const isCompleted = workout.status === 'completed';
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{workout.name}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Workout Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Програма</p>
                <p className="font-medium">{workout.workout_programs?.name}</p>
                {workout.workout_programs?.profiles?.full_name && (
                  <p className="text-sm text-muted-foreground">
                    Треньор: {workout.workout_programs.profiles.full_name}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Дата</p>
                <p className="font-medium">{new Date(workout.scheduled_date).toLocaleDateString('bg-BG')}</p>
              </div>
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
              <Badge variant={isCompleted ? "default" : "secondary"} className={isCompleted ? "bg-green-100 text-green-800 border-green-200" : ""}>
                {isCompleted ? "Завършена" : "Планирана"}
              </Badge>
              {isCompleted && workout.completed_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Завършена: {new Date(workout.completed_at).toLocaleString('bg-BG')}
                </p>
              )}
            </div>

            {/* Exercises */}
            {workout.exercises && workout.exercises.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-3">Упражнения</h4>
                <div className="space-y-3">
                  {workout.exercises.map((exercise, index) => (
                    <Card key={exercise.id || index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{exercise.exercise?.name || 'Неизвестно упражнение'}</h5>
                        <Badge variant="outline" className="text-xs">
                          {exercise.exercise?.difficulty || 'средно'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Серии:</span>
                          <p className="font-medium">{exercise.planned_sets}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Повторения:</span>
                          <p className="font-medium">{exercise.planned_reps}</p>
                        </div>
                        {exercise.planned_weight && (
                          <div>
                            <span className="text-muted-foreground">Тежест:</span>
                            <p className="font-medium">{exercise.planned_weight} кг</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Почивка:</span>
                          <p className="font-medium">{exercise.rest_time}сек</p>
                        </div>
                      </div>

                      {exercise.exercise?.muscle_groups && exercise.exercise.muscle_groups.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Мускулни групи: </span>
                          <span className="text-xs">{exercise.exercise.muscle_groups.join(', ')}</span>
                        </div>
                      )}

                      {exercise.notes && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Бележки: </span>
                          <span className="text-xs">{exercise.notes}</span>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {workout.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Бележки</p>
                <p className="text-sm">{workout.notes}</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Затвори
            </Button>
            
            {!isCompleted && (
              <Button 
                onClick={() => {
                  onMarkComplete(workout.id);
                  onClose();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Завърши тренировката
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}