"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Dumbbell,
  Search,
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Target,
  Clock,
  TrendingUp,
  Save
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  force?: string;
  level: string;
  mechanic?: string;
  equipment: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  instructions: string[];
  category: string;
  images: string[];
  video_urls?: string[];
  custom_images?: string[];
  trainer_id?: string;
}

interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  weight: string;
  rest_time: number;
  notes: string;
  order: number;
}

interface Workout {
  id?: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  muscle_groups: string[];
  difficulty_level: string;
  estimated_duration_minutes: number;
  equipment_needed: string[];
  workout_type: string;
  tags: string[];
}

const MUSCLE_GROUPS = [
  "abdominals", "hamstrings", "adductors", "quadriceps", "biceps", "shoulders",
  "chest", "middle back", "calves", "glutes", "lower back", "lats", "triceps",
  "traps", "forearms", "neck", "abductors"
];

const WORKOUT_TYPES = [
  { value: "strength", label: "Силова" },
  { value: "cardio", label: "Кардио" },
  { value: "flexibility", label: "Гъвкавост" },
  { value: "mixed", label: "Смесена" },
  { value: "sport", label: "Спорт" },
  { value: "powerlifting", label: "Пауърлифтинг" },
  { value: "olympic_weightlifting", label: "Олимпийски щанги" },
  { value: "strongman", label: "Стронгмен" },
  { value: "plyometrics", label: "Плиометрия" },
  { value: "stretching", label: "Стречинг" }
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Начинаещ" },
  { value: "intermediate", label: "Средно" },
  { value: "advanced", label: "Напреднал" }
];

export default function WorkoutBuilderPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Workout>({
    name: "",
    description: "",
    exercises: [],
    muscle_groups: [],
    difficulty_level: "intermediate",
    estimated_duration_minutes: 60,
    equipment_needed: [],
    workout_type: "mixed",
    tags: []
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isNewWorkoutDialogOpen, setIsNewWorkoutDialogOpen] = useState(false);
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createSupabaseClient();
  const sensors = useSensors(useSensor(PointerSensor));

  const fetchExercises = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на упражненията",
        variant: "destructive"
      });
    }
  }, [supabase]);

  const fetchWorkouts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на тренировките",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const filterExercises = useCallback(() => {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.primary_muscles.some(muscle =>
          muscle.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedMuscleFilter !== "all") {
      filtered = filtered.filter(exercise =>
        exercise.primary_muscles.includes(selectedMuscleFilter) ||
        exercise.secondary_muscles.includes(selectedMuscleFilter)
      );
    }

    setFilteredExercises(filtered);
  }, [exercises, searchTerm, selectedMuscleFilter]);

  const resetCurrentWorkout = useCallback(() => {
    setCurrentWorkout({
      name: "",
      description: "",
      exercises: [],
      muscle_groups: [],
      difficulty_level: "intermediate",
      estimated_duration_minutes: 60,
      equipment_needed: [],
      workout_type: "mixed",
      tags: []
    });
  }, []);

  useEffect(() => {
    fetchExercises();
    fetchWorkouts();
  }, [fetchExercises, fetchWorkouts]);

  useEffect(() => {
    filterExercises();
  }, [filterExercises]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      const activeIndex = currentWorkout.exercises.findIndex(ex => ex.id === active.id);
      const overIndex = currentWorkout.exercises.findIndex(ex => ex.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        const newExercises = arrayMove(currentWorkout.exercises, activeIndex, overIndex);
        setCurrentWorkout(prev => ({
          ...prev,
          exercises: newExercises.map((ex, index) => ({ ...ex, order: index }))
        }));
      }
    }
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    const workoutExercise: WorkoutExercise = {
      id: `workout_ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${currentWorkout.exercises.length}`,
      exercise,
      sets: 3,
      reps: "10",
      weight: "",
      rest_time: 60,
      notes: "",
      order: currentWorkout.exercises.length
    };

    setCurrentWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, workoutExercise],
      muscle_groups: Array.from(new Set([
        ...prev.muscle_groups,
        ...exercise.primary_muscles,
        ...exercise.secondary_muscles
      ])),
      equipment_needed: Array.from(new Set([
        ...prev.equipment_needed,
        exercise.equipment
      ]))
    }));
  };

  const removeExerciseFromWorkout = (exerciseId: string) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises
        .filter(ex => ex.id !== exerciseId)
        .map((ex, index) => ({ ...ex, order: index }))
    }));
  };

  const updateWorkoutExercise = (exerciseId: string, updates: Partial<WorkoutExercise>) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      )
    }));
  };

  const saveWorkout = async () => {
    if (!currentWorkout.name.trim()) {
      toast({
        title: "Грешка",
        description: "Моля въведете име на тренировката",
        variant: "destructive"
      });
      return;
    }

    if (currentWorkout.exercises.length === 0) {
      toast({
        title: "Грешка",
        description: "Моля добавете поне едно упражнение",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const workoutData = {
        trainer_id: user.id,
        name: currentWorkout.name,
        description: currentWorkout.description,
        exercises: currentWorkout.exercises.map(ex => ({
          exercise_id: ex.exercise.id,
          exercise_name: ex.exercise.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          rest_time: ex.rest_time,
          notes: ex.notes,
          order: ex.order
        })),
        muscle_groups: currentWorkout.muscle_groups,
        difficulty_level: currentWorkout.difficulty_level,
        estimated_duration_minutes: currentWorkout.estimated_duration_minutes,
        equipment_needed: currentWorkout.equipment_needed,
        workout_type: currentWorkout.workout_type,
        tags: currentWorkout.tags
      };

      if (currentWorkout.id) {
        const { error } = await supabase
          .from("workouts")
          .update(workoutData)
          .eq("id", currentWorkout.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("workouts")
          .insert(workoutData);
        if (error) throw error;
      }

      toast({
        title: "Успех",
        description: "Тренировката е запазена успешно"
      });

      setIsNewWorkoutDialogOpen(false);
      fetchWorkouts();
    } catch (error) {
      console.error("Error saving workout:", error);
      toast({
        title: "Грешка",
        description: "Неуспешно запазване на тренировката",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const loadWorkout = useCallback(async (workout: Workout) => {
    try {
      console.log("Loading workout for editing:", workout);

      // Convert database format back to component format
      const convertedWorkout: Workout = {
        ...workout,
        exercises: []
      };

      // If workout has exercises, we need to convert them back to the proper format
      if (workout.exercises && Array.isArray(workout.exercises)) {
        // Get exercise details for each exercise_id
        const exerciseIds = workout.exercises
          .map((ex: { exercise_id?: string }) => ex.exercise_id)
          .filter(Boolean);

        if (exerciseIds.length > 0) {
          const { data: exerciseData, error } = await supabase
            .from("exercises")
            .select("*")
            .in("id", exerciseIds);

          if (error) throw error;

          // Create a map of exercise data
          const exerciseMap = new Map();
          exerciseData?.forEach(ex => exerciseMap.set(ex.id, ex));

          // Convert each workout exercise
          convertedWorkout.exercises = workout.exercises.map((ex: {
            exercise_id?: string;
            exercise_name?: string;
            sets?: number;
            reps?: string;
            weight?: string;
            rest_time?: number;
            notes?: string;
            order?: number;
          }, index: number) => {
            const exerciseDetails = exerciseMap.get(ex.exercise_id);
            return {
              id: `workout_ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`,
              exercise: exerciseDetails || {
                id: ex.exercise_id,
                name: ex.exercise_name || 'Unknown Exercise',
                primary_muscles: [],
                secondary_muscles: [],
                equipment: '',
                level: 'intermediate',
                category: 'strength',
                instructions: [],
                images: []
              },
              sets: ex.sets || 3,
              reps: ex.reps || "10",
              weight: ex.weight || "",
              rest_time: ex.rest_time || 60,
              notes: ex.notes || "",
              order: ex.order || index
            };
          });
        }
      }

      console.log("Converted workout:", convertedWorkout);
      setCurrentWorkout(convertedWorkout);
      setIsNewWorkoutDialogOpen(true);
    } catch (error) {
      console.error("Error loading workout:", error);
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на тренировката за редактиране",
        variant: "destructive"
      });
    }
  }, [supabase]);

  const deleteWorkout = async (workoutId: string) => {
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Тренировката е изтрита"
      });

      fetchWorkouts();
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Грешка",
        description: "Неуспешно изтриване на тренировката",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Dumbbell className="h-6 w-6 mr-2" />
            Създаване на тренировки
          </h1>
          <p className="text-muted-foreground">
            Създавайте персонализирани тренировки с drag & drop функционалност
          </p>
        </div>

        <Dialog
          open={isNewWorkoutDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              resetCurrentWorkout();
            }
            setIsNewWorkoutDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetCurrentWorkout();
              setIsNewWorkoutDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Нова тренировка
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentWorkout.id ? "Редактиране на тренировка" : "Създаване на нова тренировка"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - Exercise Library */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Библиотека с упражнения</h3>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Търсене на упражнения..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedMuscleFilter} onValueChange={setSelectedMuscleFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Мускули" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всички мускули</SelectItem>
                        {MUSCLE_GROUPS.map((muscle) => (
                          <SelectItem key={muscle} value={muscle}>
                            {muscle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredExercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onAdd={() => addExerciseToWorkout(exercise)}
                    />
                  ))}
                </div>
              </div>

              {/* Right Panel - Workout Builder */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Конструктор на тренировка</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workout-name">
                        Име на тренировката <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="workout-name"
                        value={currentWorkout.name}
                        onChange={(e) => setCurrentWorkout(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Например: Тренировка за гръб"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="workout-type">Тип тренировка</Label>
                      <Select
                        value={currentWorkout.workout_type}
                        onValueChange={(value) => setCurrentWorkout(prev => ({ ...prev, workout_type: value }))}
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
                  </div>

                  <div>
                    <Label htmlFor="workout-description">Описание</Label>
                    <Textarea
                      id="workout-description"
                      value={currentWorkout.description}
                      onChange={(e) => setCurrentWorkout(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Описание на тренировката..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="difficulty">Ниво на сложност</Label>
                      <Select
                        value={currentWorkout.difficulty_level}
                        onValueChange={(value) => setCurrentWorkout(prev => ({ ...prev, difficulty_level: value }))}
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
                      <Label htmlFor="duration">Продължителност (мин)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={currentWorkout.estimated_duration_minutes}
                        onChange={(e) => setCurrentWorkout(prev => ({
                          ...prev,
                          estimated_duration_minutes: parseInt(e.target.value) || 60
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Упражнения в тренировката</h4>
                  <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={currentWorkout.exercises.map(ex => ex.id).filter(Boolean)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {currentWorkout.exercises.map((workoutExercise, index) => (
                          <SortableWorkoutExercise
                            key={workoutExercise.id || `fallback-${index}`}
                            workoutExercise={workoutExercise}
                            onRemove={() => removeExerciseFromWorkout(workoutExercise.id)}
                            onUpdate={(updates) => updateWorkoutExercise(workoutExercise.id, updates)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeId ? (
                        <div className="bg-white border rounded-lg p-2 shadow-lg">
                          {currentWorkout.exercises.find(ex => ex.id === activeId)?.exercise.name}
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>

                  {currentWorkout.exercises.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Добавете упражнения от библиотеката вляво
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={saveWorkout}
                    disabled={saving || !currentWorkout.name.trim() || currentWorkout.exercises.length === 0}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Запазване..." : "Запази тренировката"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsNewWorkoutDialogOpen(false)}
                    className="flex-1"
                  >
                    Отказ
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Saved Workouts */}
      <Card>
        <CardHeader>
          <CardTitle>Запазени тренировки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onEdit={() => loadWorkout(workout)}
                onDelete={() => workout.id && deleteWorkout(workout.id)}
              />
            ))}
          </div>

          {workouts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Все още няmate създадени тренировки
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ExerciseCard({ exercise, onAdd }: { exercise: Exercise; onAdd: () => void }) {
  const [imageError, setImageError] = React.useState(false);
  const firstImage = exercise.images?.[0];

  return (
    <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-center gap-3">
        {/* Exercise Image */}
        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
          {firstImage && !imageError ? (
            <img
              src={firstImage}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
              💪
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{exercise.name}</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {exercise.primary_muscles.slice(0, 2).map((muscle) => (
              <Badge key={muscle} variant="secondary" className="text-xs">
                {muscle}
              </Badge>
            ))}
            {exercise.primary_muscles.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{exercise.primary_muscles.length - 2}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {exercise.equipment} • {exercise.level}
          </p>
        </div>
        <Button
          size="sm"
          onClick={onAdd}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}

function SortableWorkoutExercise({
  workoutExercise,
  onRemove,
  onUpdate
}: {
  workoutExercise: WorkoutExercise;
  onRemove: () => void;
  onUpdate: (updates: Partial<WorkoutExercise>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workoutExercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-3">
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-sm">{workoutExercise.exercise.name}</h5>
          <div className="grid grid-cols-4 gap-2 mt-2">
            <div>
              <Label className="text-xs">Серии</Label>
              <Input
                type="number"
                value={workoutExercise.sets}
                onChange={(e) => onUpdate({ sets: parseInt(e.target.value) || 0 })}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Повторения</Label>
              <Input
                value={workoutExercise.reps}
                onChange={(e) => onUpdate({ reps: e.target.value })}
                className="h-7 text-xs"
                placeholder="8-12"
              />
            </div>
            <div>
              <Label className="text-xs">Тежест</Label>
              <Input
                value={workoutExercise.weight}
                onChange={(e) => onUpdate({ weight: e.target.value })}
                className="h-7 text-xs"
                placeholder="кг"
              />
            </div>
            <div>
              <Label className="text-xs">Почивка</Label>
              <Input
                type="number"
                value={workoutExercise.rest_time}
                onChange={(e) => onUpdate({ rest_time: parseInt(e.target.value) || 0 })}
                className="h-7 text-xs"
                placeholder="сек"
              />
            </div>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}

function WorkoutCard({
  workout,
  onEdit,
  onDelete
}: {
  workout: Workout;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workout.name}</CardTitle>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-500">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {workout.estimated_duration_minutes} мин
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-3 w-3" />
            {workout.exercises.length} упражнения
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            {DIFFICULTY_LEVELS.find(d => d.value === workout.difficulty_level)?.label}
          </div>

          {workout.muscle_groups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {workout.muscle_groups.slice(0, 3).map((muscle) => (
                <Badge key={muscle} variant="secondary" className="text-xs">
                  {muscle}
                </Badge>
              ))}
              {workout.muscle_groups.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{workout.muscle_groups.length - 3}
                </Badge>
              )}
            </div>
          )}

          {workout.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {workout.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}