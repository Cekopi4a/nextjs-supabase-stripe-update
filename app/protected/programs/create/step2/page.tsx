"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkoutCalendarWithEditor } from "@/components/program-creation/WorkoutCalendarWithEditor";
import { ExerciseLibrarySidebar } from "@/components/program-creation/ExerciseLibrarySidebar";
import { DayType } from "@/components/program-creation/DayOptionsModal";
import { UnsavedChangesDialog } from "@/components/program-creation/UnsavedChangesDialog";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/utils/supabase/client";
import { ChevronLeft, Check } from "lucide-react";
import { notifyProgramCreated } from "@/utils/notifications/create-notification-client";

import { Exercise } from '@/lib/types/exercises';

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

interface RestDay {
  name: string;
  description: string;
}

export interface ProgramData {
  name: string;
  difficulty: string;
  durationWeeks: number;
  description: string;
  startDate: string;
}

export default function CreateProgramStep2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseClient();

  const [programData, setProgramData] = useState<ProgramData | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<{id: string; full_name: string; email: string}[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  // New calendar-based state
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [workoutsByDate, setWorkoutsByDate] = useState<{[dateKey: string]: WorkoutDay}>({});
  const [restDaysByDate, setRestDaysByDate] = useState<{[dateKey: string]: RestDay}>({});
  const [dayTypes, setDayTypes] = useState<{[dateKey: string]: DayType}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [programStartDate, setProgramStartDate] = useState<Date>(new Date());

  // Helper function to get local date key without timezone conversion
  const getLocalDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadExercises = React.useCallback(async () => {
    // Use the new exercises table and API
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

  const loadClients = React.useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("No user found");
        return;
      }

      // First get client IDs from trainer_clients
      const { data: trainerClients, error: trainerError } = await supabase
        .from("trainer_clients")
        .select("client_id")
        .eq("trainer_id", user.id)
        .eq("status", "active");

      if (trainerError) {
        console.error("Error loading trainer_clients:", trainerError);
        return;
      }

      if (!trainerClients || trainerClients.length === 0) {
        console.log("No active clients found");
        setClients([]);
        return;
      }

      const clientIds = trainerClients.map(tc => tc.client_id);

      // Then get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", clientIds);

      if (profilesError) {
        console.error("Error loading profiles:", profilesError);
        return;
      }

      console.log("Loaded clients:", profiles);
      setClients(profiles || []);
    } catch (error) {
      console.error("Exception loading clients:", error);
    }
  }, [supabase]);

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
    loadClients();
  }, [searchParams, loadExercises, loadClients]);

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

  // Create global function for adding exercises
  useEffect(() => {
    (window as any).addExerciseToWorkout = (exercise: any) => {
      if (!selectedDateForExercise) {
        alert("Моля изберете ден от календара преди да добавяте упражнения!");
        return;
      }

      const dateKey = getLocalDateKey(selectedDateForExercise);

      // If day is not a workout day, make it one
      if (dayTypes[dateKey] !== 'workout') {
        setDayTypes(prev => ({ ...prev, [dateKey]: 'workout' }));
      }

      // Create new exercise
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

      alert(`Упражнението "${exercise.name}" е добавено към ${selectedDateForExercise.toLocaleDateString('bg-BG')}!`);
    };

    // Cleanup
    return () => {
      delete (window as any).addExerciseToWorkout;
    };
  }, [selectedDateForExercise, dayTypes, setDayTypes, setWorkoutsByDate, setHasUnsavedChanges, getLocalDateKey]);

  const handleAddExerciseFromLibrary = (exercise: any) => {
    // First check if we have a selected date from the editor
    const dateToUse = selectedDateForExercise;

    if (!dateToUse) {
      alert("Моля изберете ден от календара преди да добавяте упражнения!");
      return;
    }

    const dateKey = getLocalDateKey(dateToUse);

    // If day is not a workout day, make it one
    if (dayTypes[dateKey] !== 'workout') {
      setDayTypes(prev => ({ ...prev, [dateKey]: 'workout' }));
    }

    // Create or update workout
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

    // If day is not a workout day, make it one
    if (dayTypes[dateKey] !== 'workout') {
      setDayTypes(prev => ({ ...prev, [dateKey]: 'workout' }));
    }

    // Convert workout exercises to the format we need
    const workoutExercises: WorkoutExercise[] = [];

    for (const ex of workout.exercises) {
      // Fetch full exercise details
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
        // Add to existing workout
        return {
          ...prev,
          [dateKey]: {
            ...existingWorkout,
            exercises: [...existingWorkout.exercises, ...workoutExercises]
          }
        };
      } else {
        // Create new workout for this day
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
    alert(`Тренировката "${workout.name}" (${workoutExercises.length} упражнения) е добавена към ${dateToUse.toLocaleDateString('bg-BG')}!`);
  };


  const validateProgram = (): string[] => {
    const errors: string[] = [];
    
    if (selectedClients.length === 0) {
      errors.push("Моля изберете поне един клиент");
    }

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

      // Get trainer profile for notifications
      const { data: trainerProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.data.user?.id)
        .single();

      const trainerName = trainerProfile?.full_name || "Вашият треньор";

      for (const clientId of selectedClients) {
        // Step 1: Deactivate all existing active programs for this client
        const { error: deactivateError } = await supabase
          .from("workout_programs")
          .update({ is_active: false })
          .eq("client_id", clientId)
          .eq("is_active", true);

        if (deactivateError) {
          console.error("Error deactivating old programs:", deactivateError);
          // Continue anyway - not critical
        } else {
          console.log("✅ Deactivated old programs for client");
        }

        // Step 2: Create new program
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
            start_date: programData?.startDate,
            is_active: true // Always create as active
          })
          .select()
          .single();

        if (programError) throw programError;

        // Step 2.5: Create notification for the client
        await notifyProgramCreated(
          clientId,
          programData?.name || "Нова програма",
          program.id,
          trainerName
        );

        // Create workout sessions based on calendar data
        for (const [dateKey, workoutDay] of Object.entries(workoutsByDate)) {
          if (workoutDay.exercises.length === 0) continue;

          const { error: sessionError } = await supabase
            .from("workout_sessions")
            .insert({
              program_id: program.id,
              client_id: clientId,
              scheduled_date: dateKey,
              name: workoutDay.name || `Тренировка ${new Date(dateKey).toLocaleDateString('bg-BG')}`,
              description: `Планирана тренировка за ${new Date(dateKey).toLocaleDateString('bg-BG')}`,
              planned_duration_minutes: workoutDay.estimated_duration || 60,
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
      }

      setHasUnsavedChanges(false);
      router.push("/protected/programs?created=true");
    } catch (error) {
      console.error("Грешка при запазване на програмата:", error);
      if (error && typeof error === 'object' && 'message' in error) {
        alert(`Грешка при запазване: ${(error as { message: string }).message}`);
      } else {
        alert("Грешка при запазване на програмата. Моля опитайте отново.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!programData) return <div>Зарежда...</div>;

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
                  router.back();
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </Button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{programData.name}</h1>
              <p className="text-muted-foreground">
                Стъпка 2 от 2: Календарен планер
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

          {/* Client Selection */}
          <div className="bg-card border rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Избери клиенти *</h3>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Няма активни клиенти. Моля, добавете клиент преди да създадете програма.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {clients.map((client) => (
                  <label key={client.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClients([...selectedClients, client.id]);
                        } else {
                          setSelectedClients(selectedClients.filter(id => id !== client.id));
                        }
                      }}
                    />
                    <span>{client.full_name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Layout: Calendar full width top, Editor + Sidebar below */}
        <div className="space-y-6">
          {/* Calendar in Grid with Sidebar */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar - Takes 2 columns */}
            <div className="lg:col-span-2">
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
                onSaveRestDay={handleSaveRestDay}
                onUpdateWorkoutStatus={handleUpdateWorkoutStatus}
                onSetDayType={handleSetDayType}
                onSelectedDateChange={setSelectedDateForExercise}
                isTrainer={true}
                availableExercises={exercises}
                onRefreshExercises={loadExercises}
              />
            </div>

            {/* Exercise Library Sidebar - Takes 1 column */}
            <div className="lg:col-span-1">
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
          router.back();
        }}
        onCancel={() => setShowUnsavedDialog(false)}
      />
    </div>
  );
}