"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, GripVertical, Dumbbell } from "lucide-react";
import { WorkoutExercise } from "@/app/protected/programs/create/step2/page";

interface WorkoutDay {
  day_of_week: number;
  name: string;
  exercises: WorkoutExercise[];
  estimated_duration: number;
  workout_type: string;
}

interface DayWorkoutEditorProps {
  day: WorkoutDay;
  onRemoveExercise: (exerciseIndex: number) => void;
  onUpdateExercise: (exerciseIndex: number, field: string, value: string | number) => void;
}

function WorkoutExerciseCard({ 
  workoutExercise, 
  onUpdate, 
  onRemove 
}: { 
  workoutExercise: WorkoutExercise;
  onUpdate: (field: string, value: string | number) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          <div className="flex-1">
            <h4 className="font-medium">{workoutExercise.exercise.name}</h4>
            <p className="text-sm text-muted-foreground">
              {workoutExercise.exercise.muscle_groups.join(", ")} • {workoutExercise.exercise.difficulty}
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">Серии</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={workoutExercise.sets}
            onChange={(e) => onUpdate("sets", Number(e.target.value))}
            className="h-8"
          />
        </div>
        
        <div>
          <Label className="text-xs">Повторения</Label>
          <Input
            placeholder="8-12"
            value={workoutExercise.reps}
            onChange={(e) => onUpdate("reps", e.target.value)}
            className="h-8"
          />
        </div>
        
        <div>
          <Label className="text-xs">Почивка (сек)</Label>
          <Input
            type="number"
            min="30"
            max="300"
            step="15"
            value={workoutExercise.rest_time}
            onChange={(e) => onUpdate("rest_time", Number(e.target.value))}
            className="h-8"
          />
        </div>
        
        <div>
          <Label className="text-xs">Тежест/Натоварване</Label>
          <Input
            placeholder="телесно тегло, 20кг..."
            value={workoutExercise.weight || ""}
            onChange={(e) => onUpdate("weight", e.target.value)}
            className="h-8"
          />
        </div>
      </div>

      {/* Notes section */}
      <div className="mt-3">
        <Label className="text-xs">Бележки</Label>
        <Textarea
          placeholder="Допълнителни инструкции или бележки..."
          value={workoutExercise.notes || ""}
          onChange={(e) => onUpdate("notes", e.target.value)}
          className="min-h-[60px] text-sm"
          rows={2}
        />
      </div>
    </Card>
  );
}

export function DayWorkoutEditor({ day, onRemoveExercise, onUpdateExercise }: DayWorkoutEditorProps) {
  if (!day) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell className="h-5 w-5" />
        <h2 className="text-lg font-semibold">
          Упражнения за {day.name}
        </h2>
        <span className="text-sm text-muted-foreground">
          ({day.exercises.length} упражнения)
        </span>
      </div>

      {day.exercises.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40">
            <Dumbbell className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-muted-foreground">
            Няма добавени упражнения
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Влачете упражнения от библиотеката в календара или използвайте бутона &quot;+ Добави&quot;
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {day.exercises.map((exercise, index) => (
            <WorkoutExerciseCard
              key={`${exercise.exercise_id}-${index}`}
              workoutExercise={exercise}
              onUpdate={(field, value) => onUpdateExercise(index, field, value)}
              onRemove={() => onRemoveExercise(index)}
            />
          ))}
          
          {/* Summary */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Резюме на тренировката</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Общо упражнения:</span>
                <p className="font-medium">{day.exercises.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Общо серии:</span>
                <p className="font-medium">
                  {day.exercises.reduce((sum, ex) => sum + ex.sets, 0)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Очаквано време:</span>
                <p className="font-medium">{day.estimated_duration} мин.</p>
              </div>
              <div>
                <span className="text-muted-foreground">Тип:</span>
                <p className="font-medium capitalize">{day.workout_type}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}