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
  const [programStartDate] = useState<Date>(new Date());

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
      description: searchParams.get("description") || ""
    };

    setProgramData(params);
    loadExercises();
    loadClient();
  }, [searchParams, clientId, loadExercises, loadClient]);

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


  const validateProgram = (): string[] => {
    const errors: string[] = [];
    
    const workoutDates = Object.keys(workoutsByDate).filter(dateKey => workoutsByDate[dateKey].exercises.length > 0);
    if (workoutDates.length === 0) {
      errors.push("Моля добавете поне една тренировка в календара");
    }

    return errors;
  };

  const saveProgram = async () => {
    const errors = validateProgram();
    if (errors.length > 0) {
      alert("Грешки при валидация:\n" + errors.join("\n"));
      return;
    }

    setSaving(true);

    try {
      const user = await supabase.auth.getUser();
      
      const { data: program, error: programError } = await supabase
        .from("workout_programs")
        .insert({
          trainer_id: user.data.user?.id,
          client_id: clientId,
          name: programData?.name,
          description: programData?.description,
          program_type: "workout_only",
          goals: { goals: [] },
          difficulty_level: programData?.difficulty,
          estimated_duration_weeks: programData?.durationWeeks,
          workouts_per_week: Object.keys(workoutsByDate).filter(k => workoutsByDate[k].exercises.length > 0).length,
          is_active: true
        })
        .select()
        .single();

      if (programError) throw programError;

      // Create workouts based on calendar data
      for (const [dateKey, workout] of Object.entries(workoutsByDate)) {
        if (workout.exercises.length === 0) continue;
        
        const date = new Date(dateKey);
        const { error: workoutError } = await supabase
          .from("workouts")
          .insert({
            program_id: program.id,
            name: workout.name,
            day_of_week: date.getDay(),
            week_number: 1,
            workout_type: workout.workout_type,
            estimated_duration: workout.estimated_duration,
            exercises: workout.exercises.map(ex => ({
              exercise_id: ex.exercise_id,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              rest_time: ex.rest_time,
              notes: ex.notes,
              order: ex.order || 0
            }))
          });

        if (workoutError) throw workoutError;
      }

      // Create workout sessions based on calendar data
      for (const [dateKey, workout] of Object.entries(workoutsByDate)) {
        if (workout.exercises.length === 0) continue;
        
        await supabase
          .from("workout_sessions")
          .insert({
            program_id: program.id,
            client_id: clientId,
            scheduled_date: dateKey,
            name: workout.name,
            description: `Планирана тренировка за ${new Date(dateKey).toLocaleDateString('bg-BG')}`,
            planned_duration_minutes: workout.estimated_duration,
            exercises: workout.exercises.map(ex => ({
              exercise_id: ex.exercise_id,
              planned_sets: ex.sets,
              planned_reps: ex.reps,
              planned_weight: ex.weight,
              rest_time: ex.rest_time,
              notes: ex.notes,
              order: ex.order || 0,
              actual_sets: 0,
              actual_reps: "",
              actual_weight: "",
              completed: false
            })),
            status: "planned"
          });
      }

      setHasUnsavedChanges(false);
      router.push(`/protected/clients/${clientId}?program_created=true`);
    } catch (error) {
      console.error("Грешка при запазване на програмата:", error);
      alert("Грешка при запазване на програмата. Моля опитайте отново.");
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
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
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
                onSaveWorkout={handleSaveWorkout}
                onUpdateWorkoutStatus={handleUpdateWorkoutStatus}
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