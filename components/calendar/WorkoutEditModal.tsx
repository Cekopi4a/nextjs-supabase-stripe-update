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
import { Trash2, Plus, Save, X } from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";

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

interface Exercise {
  id: string;
  name: string;
  muscle_groups: string[];
  difficulty: string;
  equipment: string[];
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
  
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (workout && isOpen) {
      setWorkoutName(workout.name);
      setExercises(workout.exercises || []);
      loadExercises();
    }
  }, [workout, isOpen]);

  const loadExercises = async () => {
    try {
      const { data } = await supabase
        .from("exercises")
        .select("*")
        .or("is_global.eq.true,trainer_id.eq." + (await supabase.auth.getUser()).data.user?.id)
        .order("name");
      
      if (data) {
        setAvailableExercises(data);
      }
    } catch (error) {
      console.error("Error loading exercises:", error);
    }
  };

  const addExercise = () => {
    if (availableExercises.length === 0) return;

    const newExercise: WorkoutExercise = {
      exercise_id: "", // Start with empty selection
      exercise: undefined, // No exercise selected initially
      planned_sets: 3,
      planned_reps: "10",
      planned_weight: "",
      rest_time: 60,
      notes: "",
      order: exercises.length
    };

    setExercises([...exercises, newExercise]);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              <p><strong>Дата:</strong> {new Date(workout.scheduled_date).toLocaleDateString('bg-BG')}</p>
              <p><strong>Статус:</strong> {
                workout.status === 'planned' ? 'Планирана' :
                workout.status === 'completed' ? 'Завършена' : 'Прескочена'
              }</p>
              {workout.workout_programs && (
                <p><strong>Програма:</strong> {workout.workout_programs.name}</p>
              )}
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Упражнения</h3>
              <Button onClick={addExercise} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добави упражнение
              </Button>
            </div>

            {exercises.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Няма добавени упражнения</p>
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
                      {/* Exercise Selection */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label>Упражнение</Label>
                          <Select
                            value={exercise.exercise_id}
                            onValueChange={(value) => updateExercise(index, 'exercise_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Избери упражнение..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableExercises.map((ex) => (
                                <SelectItem key={ex.id} value={ex.id}>
                                  {ex.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeExercise(index)}
                          className="ml-4 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Exercise Parameters */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Серии</Label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.planned_sets}
                            onChange={(e) => updateExercise(index, 'planned_sets', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label>Повторения</Label>
                          <Input
                            value={exercise.planned_reps}
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
                            value={exercise.rest_time}
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
  );
}