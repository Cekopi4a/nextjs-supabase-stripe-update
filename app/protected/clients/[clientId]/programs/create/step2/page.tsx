"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { WorkoutCalendarWithEditor } from "@/components/program-creation/WorkoutCalendarWithEditor";
import { ExerciseLibrarySidebar } from "@/components/program-creation/ExerciseLibrarySidebar";
import { DayType } from "@/components/program-creation/DayOptionsModal";
import { UnsavedChangesDialog } from "@/components/program-creation/UnsavedChangesDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseClient } from "@/utils/supabase/client";
import { ChevronLeft, Check, User } from "lucide-react";

export interface Exercise {
  id: string;
  name: string;
  muscle_groups: string[];
  difficulty: string;
  equipment: string[];
  instructions: string | string[];
  image_url?: string;
  exercise_type: string;
}

export interface WorkoutExercise {
  exercise_id: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  weight?: string;
  rest_time: number;
  notes?: string;
  order?: number;
}

interface WorkoutDay {
  day_of_week: number;
  name: string;
  exercises: WorkoutExercise[];
  estimated_duration: number;
  workout_type: string;
  status?: 'assigned' | 'completed' | 'skipped';
}

export interface ProgramData {
  name: string;
  difficulty: string;
  durationWeeks: number;
  description: string;
  startDate: string;
}

interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export default function CreateClientProgramStep2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const clientId = params.clientId as string;
  const supabase = createSupabaseClient();

  const [programData, setProgramData] = useState<ProgramData | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  // New calendar-based state
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [workoutsByDate, setWorkoutsByDate] = useState<{[dateKey: string]: WorkoutDay}>({});
  const [dayTypes, setDayTypes] = useState<{[dateKey: string]: DayType}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [programStartDate, setProgramStartDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [restDaysByDate, setRestDaysByDate] = useState<{[dateKey: string]: any}>({});

  const loadExercises = React.useCallback(async () => {
    const { data } = await supabase
      .from("exercises")
      .select("*")
      .or("is_global.eq.true,trainer_id.eq." + (await supabase.auth.getUser()).data.user?.id)
      .order("name");
    
    if (data) {
      setExercises(data);
    }
  }, [supabase]);

  const loadClient = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error) {
      console.error('Error fetching client:', error);
      router.push('/protected/clients');
    } finally {
      setLoading(false);
    }
  }, [supabase, clientId, router]);

  useEffect(() => {
    const params = {
      name: searchParams.get("name") || "",
      difficulty: searchParams.get("difficulty") || "",
      durationWeeks: Number(searchParams.get("durationWeeks")) || 8,
      description: searchParams.get("description") || "",
      startDate: searchParams.get("startDate") || new Date().toISOString().split('T')[0]
    };

    setProgramData(params);

    // Set program start date from params (avoid timezone issues)
    if (params.startDate) {
      const [year, month, day] = params.startDate.split('-').map(Number);
      const startDate = new Date(year, month - 1, day);
      setProgramStartDate(startDate);
      setCurrentDate(startDate);
    }

    loadExercises();
    loadClient();
    checkActiveProgram();
  }, [searchParams, clientId, loadExercises, loadClient]);

  const checkActiveProgram = async () => {
    try {
      const { data } = await supabase
        .from("workout_programs")
        .select("id, name")
        .eq("client_id", clientId)
        .eq("is_active", true)
        .limit(1);

      if (data && data.length > 0) {
        alert(`Клиентът вече има активна програма "${data[0].name}".\n\nМоля първо изтрийте я за да създадете нова.`);
        router.push(`/protected/clients/${clientId}`);
      }
    } catch (error) {
      console.error("Error checking active program:", error);
    }
  };

  // Handle browser back/forward navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopState = () => {
      if (hasUnsavedChanges) {
        setShowUnsavedDialog(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  // New calendar-based functions
  const handleSaveWorkout = (date: Date, workout: WorkoutDay) => {
    const dateKey = date.toISOString().split('T')[0];
    setWorkoutsByDate(prev => ({ ...prev, [dateKey]: workout }));
    setDayTypes(prev => ({ ...prev, [dateKey]: 'workout' }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateWorkoutStatus = (date: Date, status: 'assigned' | 'completed' | 'skipped') => {
    const dateKey = date.toISOString().split('T')[0];
    setWorkoutsByDate(prev => {
      if (!prev[dateKey]) return prev;
      return {
        ...prev,
        [dateKey]: { ...prev[dateKey], status }
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (!selectedDate) {
      alert('Моля първо изберете ден от календара.');
      return;
    }

    const dateKey = selectedDate.toISOString().split('T')[0];
    const workoutExercise: WorkoutExercise = {
      exercise_id: exercise.id,
      exercise: exercise,
      sets: 3,
      reps: "10",
      rest_time: 60,
      order: 0
    };

    setWorkoutsByDate(prev => {
      const currentWorkout = prev[dateKey] || {
        day_of_week: selectedDate.getDay(),
        name: `Тренировка ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`,
        exercises: [],
        estimated_duration: 30,
        workout_type: 'strength'
      };

      const updatedExercises = [...currentWorkout.exercises, workoutExercise];
      
      return {
        ...prev,
        [dateKey]: {
          ...currentWorkout,
          exercises: updatedExercises
        }
      };
    });

    setDayTypes(prev => ({ ...prev, [dateKey]: 'workout' }));
    setHasUnsavedChanges(true);
  };


  const validateProgram = (): string[] => {
    const errors: string[] = [];
    
    const workoutDates = Object.keys(workoutsByDate).filter(dateKey => workoutsByDate[dateKey].exercises.length > 0);
    if (workoutDates.length === 0) {
      errors.push("Моля добавете поне една тренировка в календара");
    }

    return errors;
  };

  const saveProgram = async () => {
    console.log("Започване на запазване на програмата...");
    console.log("Program data:", programData);
    console.log("Workouts by date:", workoutsByDate);
    
    if (!programData) {
      alert("Няма данни за програмата. Моля върнете се към стъпка 1.");
      return;
    }

    const errors = validateProgram();
    if (errors.length > 0) {
      alert("Грешки при валидация:\n" + errors.join("\n"));
      return;
    }

    setSaving(true);

    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user?.id) {
        throw new Error("Потребителят не е влязъл в системата");
      }

      console.log("Запазване на програма:", {
        trainer_id: user.data.user.id,
        client_id: clientId,
        name: programData?.name || "Нова програма",
        description: programData?.description || "",
        difficulty_level: programData?.difficulty || "beginner",
        estimated_duration_weeks: programData?.durationWeeks || 8,
        workouts_count: Object.keys(workoutsByDate).filter(k => workoutsByDate[k].exercises.length > 0).length
      });

      const { data: program, error: programError } = await supabase
        .from("workout_programs")
        .insert({
          trainer_id: user.data.user.id,
          client_id: clientId,
          name: programData?.name || "Нова програма",
          description: programData?.description || "",
          difficulty_level: programData?.difficulty || "beginner",
          estimated_duration_weeks: programData?.durationWeeks || 8,
          start_date: programData?.startDate,
          is_active: true
        })
        .select()
        .single();

      if (programError) {
        console.error("Грешка при създаване на програма:", programError);
        throw programError;
      }

      console.log("Програма създадена успешно:", program);

      // Пропускаме създаването на workouts таблица - тя не съществува в схемата
      const workoutEntries = Object.entries(workoutsByDate).filter(([_, workout]) => workout.exercises.length > 0);
      console.log(`Готови за създаване на ${workoutEntries.length} workout sessions...`);

      // Create workout sessions based on calendar data  
      for (const [dateKey, workout] of workoutEntries) {
        console.log(`Създаване на session за ${dateKey}:`, {
          program_id: program.id,
          client_id: clientId,
          scheduled_date: dateKey,
          name: workout.name || `Тренировка ${new Date(dateKey).getDate()}/${new Date(dateKey).getMonth() + 1}`,
          exercises_count: workout.exercises.length
        });

        const { error: sessionError } = await supabase
          .from("workout_sessions")
          .insert({
            program_id: program.id,
            client_id: clientId,
            scheduled_date: dateKey,
            name: workout.name || `Тренировка ${new Date(dateKey).getDate()}/${new Date(dateKey).getMonth() + 1}`,
            status: "planned",
            exercises: workout.exercises.map(ex => ({
              exercise_id: ex.exercise_id,
              planned_sets: ex.sets,
              planned_reps: ex.reps,
              planned_weight: ex.weight || null,
              rest_time: ex.rest_time,
              notes: ex.notes || null,
              order: ex.order || 0,
              actual_sets: 0,
              actual_reps: "",
              actual_weight: "",
              completed: false
            }))
          });

        if (sessionError) {
          console.error(`Грешка при създаване на session за ${dateKey}:`, sessionError);
          throw sessionError; // Спираме процеса при грешка в session
        } else {
          console.log(`Session за ${dateKey} създаден успешно`);
        }
      }

      setHasUnsavedChanges(false);
      router.push(`/protected/clients/${clientId}?program_created=true`);
    } catch (error) {
      console.error("Грешка при запазване на програмата:", error);
      
      let errorMessage = "Неизвестна грешка при запазване на програмата.";
      
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = String(error.message);
        } else if ('error' in error) {
          errorMessage = String(error.error);
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Грешка при запазване на програмата: ${errorMessage}\n\nМоля проверете конзолата за повече детайли и опитайте отново.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Зарежда...</p>
        </div>
      </div>
    );
  }

  if (!programData || !client) return <div>Зарежда...</div>;

  return (
    <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          {/* Client Header */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (hasUnsavedChanges) {
                    setShowUnsavedDialog(true);
                  } else {
                    router.push('/protected/clients');
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Клиенти
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {client.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {programData.name}
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {client.email}
                </p>
              </div>
            </div>
          </Card>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">              
              <div className="flex-1">
                <h2 className="text-xl font-semibold">Календарен планер</h2>
                <p className="text-muted-foreground">
                  Стъпка 2 от 2: Планиране на тренировки
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                  1
                </div>
                <div className="w-16 h-1 bg-primary"></div>
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  2
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Calendar with Inline Editor */}
            <div className={`${sidebarOpen ? "lg:col-span-2" : "lg:col-span-3"}`}>
              <WorkoutCalendarWithEditor
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                view={calendarView}
                onViewChange={setCalendarView}
                programStartDate={programStartDate}
                programDurationWeeks={programData?.durationWeeks || 8}
                dayTypes={dayTypes}
                workoutsByDate={workoutsByDate}
                restDaysByDate={restDaysByDate}
                onSaveWorkout={handleSaveWorkout}
                onSaveRestDay={() => {}}
                onUpdateWorkoutStatus={handleUpdateWorkoutStatus}
                onSelectedDateChange={setSelectedDate}
                isTrainer={true}
                availableExercises={exercises}
              />
            </div>

            {/* Exercise Library Sidebar */}
            <div className={`${sidebarOpen ? "lg:col-span-2" : "lg:col-span-1"}`}>
              <ExerciseLibrarySidebar
                exercises={exercises}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onAddExercise={handleAddExercise}
                selectedDate={selectedDate}
                onRefreshExercises={loadExercises}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={saveProgram}
              disabled={saving}
              size="lg"
              className="shadow-lg"
            >
              {saving ? (
                "Запазва..."
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Запази програмата
                </>
              )}
            </Button>
          </div>
        </div>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onSave={() => {
          saveProgram();
          setShowUnsavedDialog(false);
        }}
        onDiscard={() => {
          setHasUnsavedChanges(false);
          setShowUnsavedDialog(false);
          router.push('/protected/clients');
        }}
        onCancel={() => setShowUnsavedDialog(false)}
      />
    </div>
  );
}