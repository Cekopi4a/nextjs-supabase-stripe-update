"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Dumbbell, ListChecks } from "lucide-react";
import { Exercise } from "@/lib/types/exercises";
import { ExerciseSelector } from "@/components/exercises/ExerciseSelector";
import { createSupabaseClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface WorkoutExercise {
  exercise_id: string;
  exercise_name?: string;
  sets?: number;
  reps?: string;
  weight?: string;
  rest_time?: number;
  notes?: string;
  order?: number;
}

interface Workout {
  id: string;
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

interface ExerciseLibrarySidebarProps {
  exercises: Exercise[];
  isOpen: boolean;
  onToggle: () => void;
  onAddExercise?: (exercise: Exercise) => void;
  onAddWorkout?: (workout: Workout) => void;
  selectedDate?: Date | null;
}

export function ExerciseLibrarySidebar({
  isOpen,
  onToggle,
  onAddExercise,
  onAddWorkout,
  selectedDate
}: ExerciseLibrarySidebarProps) {
  const [activeTab, setActiveTab] = useState<'exercises' | 'workouts'>('exercises');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseClient();

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (activeTab === 'workouts') {
      fetchWorkouts();
    }
  }, [activeTab, fetchWorkouts]);

  const handleAddExercise = (exercise: Exercise) => {
    if (!selectedDate) {
      alert("Моля първо изберете ден от календара!");
      return;
    }

    if (onAddExercise) {
      onAddExercise(exercise);
    }
  };

  const handleAddWorkout = (workout: Workout) => {
    if (!selectedDate) {
      alert("Моля първо изберете ден от календара!");
      return;
    }

    if (onAddWorkout) {
      onAddWorkout(workout);
    }
  };

  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) {
    return (
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-10 lg:static lg:transform-none">
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="lg:hidden shadow-lg"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Отвори библиотеката</span>
        </Button>
      </div>
    );
  }

  return (
    <Card className="lg:sticky lg:top-6 flex flex-col max-h-[calc(100vh-8rem)]">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Библиотека</h3>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="lg:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'exercises' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('exercises')}
            className="flex-1"
          >
            <Dumbbell className="h-3 w-3 mr-1" />
            Упражнения
          </Button>
          <Button
            variant={activeTab === 'workouts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('workouts')}
            className="flex-1"
          >
            <ListChecks className="h-3 w-3 mr-1" />
            Тренировки
          </Button>
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <span className="text-blue-800 font-medium">
              Добавяне към: {selectedDate.toLocaleDateString('bg-BG', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
        )}

        {!selectedDate && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <span className="text-yellow-800">
              Изберете ден от календара
            </span>
          </div>
        )}
      </div>

      {/* Content with Scroll */}
      <div className="p-4 overflow-y-auto flex-1">
        {activeTab === 'exercises' ? (
          <ExerciseSelector
            onExerciseSelect={handleAddExercise}
            selectedExercises={[]}
            filters={{
              limit: 20
            }}
          />
        ) : (
          <div className="space-y-3">
            {/* Search for workouts */}
            <Input
              placeholder="Търси тренировка..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-3"
            />

            {loading && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Зареждане...
              </div>
            )}

            {!loading && filteredWorkouts.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                {searchTerm ? 'Няма намерени тренировки' : 'Няма създадени тренировки'}
              </div>
            )}

            {filteredWorkouts.map((workout) => (
              <Card key={workout.id} className="p-3 hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{workout.name}</h4>
                      {workout.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {workout.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {workout.exercises.length} упр.
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {workout.estimated_duration_minutes} мин
                    </Badge>
                    {workout.difficulty_level && (
                      <Badge variant="outline" className="text-xs">
                        {workout.difficulty_level === 'beginner' ? 'Начинаещ' :
                         workout.difficulty_level === 'intermediate' ? 'Среден' : 'Напреднал'}
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAddWorkout(workout)}
                    className="w-full"
                    disabled={!selectedDate}
                  >
                    Добави тренировката
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}