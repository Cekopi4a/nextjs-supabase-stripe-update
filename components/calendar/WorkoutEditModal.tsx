"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Save, X, Dumbbell } from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { formatScheduledDate } from "@/utils/date-utils";
import { Exercise } from "@/lib/types/exercises";
import { ExerciseSelector } from "@/components/exercises/ExerciseSelector";
import { notifyWorkoutUpdated } from "@/utils/notifications/create-notification-client";

interface WorkoutSession {
  id: string;
  name: string;
  scheduled_date: string;
  status: 'planned' | 'completed' | 'skipped';
  program_id?: string;
  client_id: string;
  exercises?: any[];
  workout_programs?: {
    name: string;
  };
}


interface WorkoutExercise {
  exercise_id: string;
  exercise?: Exercise;
  planned_sets: number;
  planned_reps: string;
  planned_weight?: string;
  rest_time: number;
  notes?: string;
  order: number;
}

interface WorkoutEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutSession | null;
  onSave: () => void;
}

export function WorkoutEditModal({
  isOpen,
  onClose,
  workout,
  onSave
}: WorkoutEditModalProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (workout && isOpen) {
      setWorkoutName(workout.name);
      loadExercises(workout.exercises || []);
    }
  }, [workout, isOpen]);

  const loadExercises = async (workoutExercises: any[]) => {
    try {
      const response = await fetch('/api/exercises/search?limit=200');
      const result = await response.json();

      if (result.success) {
        setAvailableExercises(result.data);

        // Enrich workout exercises with full exercise data
        const enrichedExercises = workoutExercises.map(ex => {
          const fullExercise = result.data.find((e: Exercise) => e.id === ex.exercise_id);
          return {
            ...ex,
            exercise: fullExercise || ex.exercise
          };
        });

        setExercises(enrichedExercises);
      } else {
        console.error('Failed to load exercises:', result.error);
        setExercises(workoutExercises);
      }
    } catch (error) {
      console.error("Error loading exercises:", error);
      setExercises(workoutExercises);
    }
  };

  const addExercise = () => {
    setShowExerciseSelector(true);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      exercise_id: exercise.id,
      exercise: exercise,
      planned_sets: 3,
      planned_reps: "8-12",
      planned_weight: "",
      rest_time: 60,
      notes: "",
      order: exercises.length
    };

    setExercises([...exercises, newWorkoutExercise]);
    setShowExerciseSelector(false);
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    const updatedExercises = [...exercises];
    
    if (field === 'exercise_id') {
      const selectedExercise = availableExercises.find(ex => ex.id === value);
      updatedExercises[index] = {
        ...updatedExercises[index],
        exercise_id: value,
        exercise: selectedExercise
      };
    } else {
      updatedExercises[index] = {
        ...updatedExercises[index],
        [field]: value
      };
    }
    
    setExercises(updatedExercises);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };


  const saveWorkout = async () => {
    if (!workout) return;

    setSaving(true);
    try {
      // Filter out exercises without selected exercise_id
      const validExercises = exercises.filter(ex => ex.exercise_id && ex.exercise_id.trim() !== "");

      const { error } = await supabase
        .from("workout_sessions")
        .update({
          name: workoutName,
          exercises: validExercises.map(ex => ({
            exercise_id: ex.exercise_id,
            planned_sets: ex.planned_sets,
            planned_reps: ex.planned_reps,
            planned_weight: ex.planned_weight || null,
            rest_time: ex.rest_time,
            notes: ex.notes || null,
            order: ex.order
          }))
        })
        .eq("id", workout.id);

      if (error) throw error;

      // Send notification to client about workout update
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && workout.client_id) {
          const { data: trainerProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          const trainerName = trainerProfile?.full_name || "Вашият треньор";

          await notifyWorkoutUpdated(
            workout.client_id,
            workoutName,
            workout.id,
            trainerName
          );
        }
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
        // Don't fail the workout save if notification fails
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Грешка при запазване на тренировката");
    } finally {
      setSaving(false);
    }
  };

  if (!workout) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Редактиране на тренировка</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Workout Name */}
            <div className="space-y-2">
              <Label htmlFor="workout-name">Име на тренировката</Label>
              <Input
                id="workout-name"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Въведете име на тренировката..."
              />
            </div>

            {/* Workout Info */}
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground">
                <p><strong className="text-foreground">Дата:</strong> {formatScheduledDate(workout.scheduled_date)}</p>
                <p><strong className="text-foreground">Статус:</strong> {
                  workout.status === 'planned' ? 'Планирана' :
                  workout.status === 'completed' ? 'Завършена' : 'Прескочена'
                }</p>
                {workout.workout_programs && (
                  <p><strong className="text-foreground">Програма:</strong> {workout.workout_programs.name}</p>
                )}
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Упражнения</h3>
                <div className="flex gap-2">
                  <Button onClick={addExercise} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Добави упражнение
                  </Button>
                </div>
              </div>

              {exercises.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Няма добавени упражнения</p>
                  <Button onClick={addExercise} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Добави първото упражнение
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        {/* Exercise Layout with Image */}
                        <div className="flex gap-4">
                          {/* Exercise Image */}
                          <div className="flex-shrink-0">
                            {exercise.exercise?.images?.[0] || exercise.exercise?.custom_images?.[0] ? (
                              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden bg-muted border-2 border-border shadow-sm">
                                <img
                                  src={exercise.exercise.images?.[0] || exercise.exercise.custom_images?.[0]}
                                  alt={exercise.exercise.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg bg-muted border-2 border-border flex items-center justify-center">
                                <Dumbbell className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Exercise Info and Parameters */}
                          <div className="flex-1 space-y-4">
                            {/* Exercise Name and Delete Button */}
                            <div className="flex items-start justify-between">
                              <div>
                                <Label>Упражнение</Label>
                                <h4 className="text-lg font-semibold text-foreground mt-1">
                                  {exercise.exercise?.name || 'Неизвестно упражнение'}
                                </h4>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeExercise(index)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Exercise Parameters */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <Label>Серии</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={exercise.planned_sets || 1}
                                  onChange={(e) => updateExercise(index, 'planned_sets', parseInt(e.target.value) || 1)}
                                />
                              </div>
                              <div>
                                <Label>Повторения</Label>
                                <Input
                                  value={exercise.planned_reps || ""}
                                  onChange={(e) => updateExercise(index, 'planned_reps', e.target.value)}
                                  placeholder="8-12"
                                />
                              </div>
                              <div>
                                <Label>Тежест (кг)</Label>
                                <Input
                                  value={exercise.planned_weight || ""}
                                  onChange={(e) => updateExercise(index, 'planned_weight', e.target.value)}
                                  placeholder="20"
                                />
                              </div>
                              <div>
                                <Label>Почивка (сек)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={exercise.rest_time || 60}
                                  onChange={(e) => updateExercise(index, 'rest_time', parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </div>

                            {/* Notes */}
                            <div>
                              <Label>Бележки</Label>
                              <Input
                                value={exercise.notes || ""}
                                onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                                placeholder="Бележки за упражнението..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Отказ
              </Button>
              <Button onClick={saveWorkout} disabled={saving}>
                {saving ? (
                  <>Запазване...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Запази промените
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Selector Modal */}
      <Dialog open={showExerciseSelector} onOpenChange={setShowExerciseSelector}>
        <DialogContent className="max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Избери упражнение</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <ExerciseSelector
              onExerciseSelect={handleExerciseSelect}
              selectedExercises={[]}
              filters={{
                limit: 50
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}