"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { WorkoutCalendarWithEditor } from "@/components/program-creation/WorkoutCalendarWithEditor";
import { ExerciseLibrarySidebar } from "@/components/program-creation/ExerciseLibrarySidebar";
import { DayType } from "@/components/program-creation/DayOptionsModal";
import { UnsavedChangesDialog } from "@/components/program-creation/UnsavedChangesDialog";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/utils/supabase/client";
import { ChevronLeft, Check } from "lucide-react";
import { Exercise } from '@/lib/types/exercises';
import { toast } from "sonner";

interface WorkoutExercise {
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

interface RestDay {
  name: string;
  description: string;
}

interface ProgramData {
  id: string;
  name: string;
  difficulty_level: string;
  estimated_duration_weeks: number;
  description: string;
  client_id: string;
}

export default function EditCalendarPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;
  const supabase = createSupabaseClient();

  const [programData, setProgramData] = useState<ProgramData | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [workoutsByDate, setWorkoutsByDate] = useState<{[dateKey: string]: WorkoutDay}>({});
  const [restDaysByDate, setRestDaysByDate] = useState<{[dateKey: string]: RestDay}>({});
  const [dayTypes, setDayTypes] = useState<{[dateKey: string]: DayType}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [programStartDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // Helper function to get local date key without timezone conversion
  const getLocalDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadExercises = useCallback(async () => {
    try {
      const response = await fetch('/api/exercises/search?limit=100');
      const result = await response.json();

      if (result.success) {
        setExercises(result.data);
      } else {
        console.error('Failed to load exercises:', result.error);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }, []);

  const loadProgramData = useCallback(async () => {
    try {
      setLoading(true);

      // Load program details
      const { data: program, error: programError } = await supabase
        .from("workout_programs")
        .select("*")
        .eq("id", programId)
        .single();

      if (programError || !program) {
        toast.error("Програмата не е намерена");
        router.push("/protected/programs");
        return;
      }

      setProgramData(program);

      // Load existing workout sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("workout_sessions")
        .select(`
          *,
          exercises
        `)
        .eq("program_id", programId)
        .order("scheduled_date", { ascending: true });

      if (sessionsError) {
        console.error("Error loading sessions:", sessionsError);
        return;
      }

      // Convert sessions to calendar format
      const workoutsMap: {[dateKey: string]: WorkoutDay} = {};
      const restDaysMap: {[dateKey: string]: RestDay} = {};
      const dayTypesMap: {[dateKey: string]: DayType} = {};

      if (sessions) {
        for (const session of sessions) {
          const dateKey = session.scheduled_date;

          // Check if it's a rest day
          if (session.workout_type === 'rest') {
            restDaysMap[dateKey] = {
              name: session.name,
              description: session.description || session.instructions || ''
            };
            dayTypesMap[dateKey] = 'rest';
            continue;
          }

          // Fetch exercise details for each exercise in session
          const exercisesWithDetails: WorkoutExercise[] = [];

          if (session.exercises && Array.isArray(session.exercises)) {
            for (const ex of session.exercises) {
              const { data: exerciseData } = await supabase
                .from("exercises")
                .select("*")
                .eq("id", ex.exercise_id)
                .single();

              if (exerciseData) {
                exercisesWithDetails.push({
                  exercise_id: ex.exercise_id,
                  exercise: exerciseData,
                  sets: ex.planned_sets || 3,
                  reps: ex.planned_reps || "8-12",
                  rest_time: ex.rest_time || 60,
                  weight: ex.planned_weight || "",
                  notes: ex.notes || "",
                  order: ex.order
                });
              }
            }
          }

          workoutsMap[dateKey] = {
            day_of_week: new Date(dateKey).getDay(),
            name: session.name,
            exercises: exercisesWithDetails,
            estimated_duration: session.planned_duration_minutes || 60,
            workout_type: session.workout_type || 'strength',
            status: session.status as 'assigned' | 'completed' | 'skipped'
          };

          dayTypesMap[dateKey] = 'workout';
        }
      }

      setWorkoutsByDate(workoutsMap);
      setRestDaysByDate(restDaysMap);
      setDayTypes(dayTypesMap);

    } catch (error) {
      console.error("Error loading program data:", error);
      toast.error("Грешка при зареждане на програмата");
    } finally {
      setLoading(false);
    }
  }, [programId, supabase, router]);

  useEffect(() => {
    loadExercises();
    loadProgramData();
  }, [loadExercises, loadProgramData]);

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

  const handleSaveWorkout = (date: Date, workout: WorkoutDay) => {
    const dateKey = getLocalDateKey(date);
    setWorkoutsByDate(prev => ({ ...prev, [dateKey]: workout }));
    setDayTypes(prev => ({ ...prev, [dateKey]: 'workout' }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateWorkoutStatus = (date: Date, status: 'assigned' | 'completed' | 'skipped') => {
    const dateKey = getLocalDateKey(date);
    setWorkoutsByDate(prev => {
      if (!prev[dateKey]) return prev;
      return {
        ...prev,
        [dateKey]: { ...prev[dateKey], status }
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleSetDayType = (date: Date, type: DayType) => {
    const dateKey = getLocalDateKey(date);
    setDayTypes(prev => ({ ...prev, [dateKey]: type }));
    setHasUnsavedChanges(true);
  };

  const handleSaveRestDay = (date: Date, restDay: RestDay) => {
    const dateKey = getLocalDateKey(date);
    setRestDaysByDate(prev => ({ ...prev, [dateKey]: restDay }));
    setDayTypes(prev => ({ ...prev, [dateKey]: 'rest' }));
    setHasUnsavedChanges(true);
  };

  const [selectedDateForExercise, setSelectedDateForExercise] = useState<Date | null>(null);

  useEffect(() => {
    (window as any).addExerciseToWorkout = (exercise: any) => {
      if (!selectedDateForExercise) {
        alert("Моля изберете ден от календара преди да добавяте упражнения!");
        return;
      }

      const dateKey = getLocalDateKey(selectedDateForExercise);

      if (dayTypes[dateKey] !== 'workout') {
        setDayTypes(prev => ({ ...prev, [dateKey]: 'workout' }));
      }

      const newExercise = {
        exercise_id: exercise.id,
        exercise: exercise,
        sets: 3,
        reps: "8-12",
        rest_time: 60,
        weight: "",
        notes: ""
      };

      setWorkoutsByDate(prev => {
        const existingWorkout = prev[dateKey];
        if (existingWorkout) {
          return {
            ...prev,
            [dateKey]: {
              ...existingWorkout,
              exercises: [...existingWorkout.exercises, newExercise]
            }
          };
        } else {
          return {
            ...prev,
            [dateKey]: {
              day_of_week: selectedDateForExercise.getDay(),
              name: `Тренировка за ${selectedDateForExercise.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}`,
              exercises: [newExercise],
              estimated_duration: 60,
              workout_type: 'strength',
              status: 'assigned'
            }
          };
        }
      });
      setHasUnsavedChanges(true);

      toast.success(`Упражнението "${exercise.name}" е добавено`);
    };

    return () => {
      delete (window as any).addExerciseToWorkout;
    };
  }, [selectedDateForExercise, dayTypes, getLocalDateKey]);

  const handleAddExerciseFromLibrary = (exercise: any) => {
    const dateToUse = selectedDateForExercise;

    if (!dateToUse) {
      alert("Моля изберете ден от календара преди да добавяте упражнения!");
      return;
    }

    const dateKey = getLocalDateKey(dateToUse);

    if (dayTypes[dateKey] !== 'workout') {
      setDayTypes(prev => ({ ...prev, [dateKey]: 'workout' }));
    }

    const newExercise = {
      exercise_id: exercise.id,
      exercise: exercise,
      sets: 3,
      reps: "8-12",
      rest_time: 60,
      weight: "",
      notes: ""
    };

    setWorkoutsByDate(prev => {
      const existingWorkout = prev[dateKey];
      if (existingWorkout) {
        return {
          ...prev,
          [dateKey]: {
            ...existingWorkout,
            exercises: [...existingWorkout.exercises, newExercise]
          }
        };
      } else {
        return {
          ...prev,
          [dateKey]: {
            day_of_week: dateToUse.getDay(),
            name: `Тренировка за ${dateToUse.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}`,
            exercises: [newExercise],
            estimated_duration: 60,
            workout_type: 'strength',
            status: 'assigned'
          }
        };
      }
    });
    setHasUnsavedChanges(true);
  };

  const handleAddWorkoutFromLibrary = async (workout: any) => {
    const dateToUse = selectedDateForExercise;

    if (!dateToUse) {
      alert("Моля изберете ден от календара преди да добавяте тренировки!");
      return;
    }

    const dateKey = getLocalDateKey(dateToUse);

    if (dayTypes[dateKey] !== 'workout') {
      setDayTypes(prev => ({ ...prev, [dateKey]: 'workout' }));
    }

    const workoutExercises: WorkoutExercise[] = [];

    for (const ex of workout.exercises) {
      const { data: exerciseData } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", ex.exercise_id)
        .single();

      if (exerciseData) {
        workoutExercises.push({
          exercise_id: ex.exercise_id,
          exercise: exerciseData,
          sets: ex.sets || 3,
          reps: ex.reps || "8-12",
          rest_time: ex.rest_time || 60,
          weight: ex.weight || "",
          notes: ex.notes || "",
          order: ex.order
        });
      }
    }

    setWorkoutsByDate(prev => {
      const existingWorkout = prev[dateKey];
      if (existingWorkout) {
        return {
          ...prev,
          [dateKey]: {
            ...existingWorkout,
            exercises: [...existingWorkout.exercises, ...workoutExercises]
          }
        };
      } else {
        return {
          ...prev,
          [dateKey]: {
            day_of_week: dateToUse.getDay(),
            name: workout.name,
            exercises: workoutExercises,
            estimated_duration: workout.estimated_duration_minutes || 60,
            workout_type: workout.workout_type || 'strength',
            status: 'assigned'
          }
        };
      }
    });

    setHasUnsavedChanges(true);
    toast.success(`Тренировката "${workout.name}" е добавена`);
  };

  const saveProgram = async () => {
    if (!programData) return;

    setSaving(true);

    try {
      // Delete all existing workout sessions for this program
      const { error: deleteError } = await supabase
        .from("workout_sessions")
        .delete()
        .eq("program_id", programId);

      if (deleteError) {
        console.error("Error deleting old sessions:", deleteError);
        throw deleteError;
      }

      // Create new workout sessions
      for (const [dateKey, workoutDay] of Object.entries(workoutsByDate)) {
        if (workoutDay.exercises.length === 0) continue;

        const { error: sessionError } = await supabase
          .from("workout_sessions")
          .insert({
            program_id: programId,
            client_id: programData.client_id,
            scheduled_date: dateKey,
            name: workoutDay.name || `Тренировка ${new Date(dateKey).toLocaleDateString('bg-BG')}`,
            description: `Планирана тренировка за ${new Date(dateKey).toLocaleDateString('bg-BG')}`,
            planned_duration_minutes: workoutDay.estimated_duration || 60,
            workout_type: workoutDay.workout_type || 'strength',
            exercises: workoutDay.exercises.map((ex: WorkoutExercise) => ({
              exercise_id: ex.exercise_id,
              planned_sets: ex.sets,
              planned_reps: ex.reps,
              planned_weight: ex.weight,
              rest_time: ex.rest_time,
              notes: ex.notes,
              order: ex.order,
              actual_sets: 0,
              actual_reps: "",
              actual_weight: "",
              completed: false
            })),
            status: "planned"
          });

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
      }

      // Create rest day sessions
      for (const [dateKey, restDay] of Object.entries(restDaysByDate)) {
        const { error: restError } = await supabase
          .from("workout_sessions")
          .insert({
            program_id: programId,
            client_id: programData.client_id,
            scheduled_date: dateKey,
            name: restDay.name || 'Почивен ден',
            description: restDay.description || '',
            planned_duration_minutes: 0,
            workout_type: 'rest',
            exercises: [],
            status: "planned",
            instructions: restDay.description || null
          });

        if (restError) {
          console.error("Rest day error:", restError);
          throw restError;
        }
      }

      // Update program's workouts_per_week count
      const workoutCount = Object.keys(workoutsByDate).filter(k => workoutsByDate[k].exercises.length > 0).length;
      await supabase
        .from("workout_programs")
        .update({
          workouts_per_week: workoutCount,
          updated_at: new Date().toISOString()
        })
        .eq("id", programId);

      setHasUnsavedChanges(false);
      toast.success("Програмата е обновена успешно");
      router.push(`/protected/programs/${programId}`);
    } catch (error) {
      console.error("Грешка при запазване на програмата:", error);
      toast.error("Грешка при запазване на програмата");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !programData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Зареждане...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (hasUnsavedChanges) {
                  setShowUnsavedDialog(true);
                } else {
                  router.push(`/protected/programs/${programId}`);
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </Button>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{programData.name}</h1>
              <p className="text-muted-foreground">
                Редактиране на календара и упражненията
              </p>
            </div>
          </div>
        </div>

        {/* Layout: Calendar + Sidebar */}
        <div className="space-y-6">
          {/* Calendar - Full Width */}
          <div>
            <WorkoutCalendarWithEditor
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              view={calendarView}
              onViewChange={setCalendarView}
              programStartDate={programStartDate}
              programDurationWeeks={programData?.estimated_duration_weeks || 8}
              dayTypes={dayTypes}
              workoutsByDate={workoutsByDate}
              restDaysByDate={restDaysByDate}
              onSaveWorkout={handleSaveWorkout}
              onSaveRestDay={handleSaveRestDay}
              onUpdateWorkoutStatus={handleUpdateWorkoutStatus}
              onSetDayType={handleSetDayType}
              onSelectedDateChange={setSelectedDateForExercise}
              isTrainer={true}
              availableExercises={exercises}
              onRefreshExercises={loadExercises}
            />
          </div>

          {/* Exercise Library Sidebar - Full Width Below */}
          <div>
            <ExerciseLibrarySidebar
              exercises={exercises}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              onAddExercise={handleAddExerciseFromLibrary}
              onAddWorkout={handleAddWorkoutFromLibrary}
              selectedDate={selectedDateForExercise}
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
                Запази промените
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
          router.push(`/protected/programs/${programId}`);
        }}
        onCancel={() => setShowUnsavedDialog(false)}
      />
    </div>
  );
}