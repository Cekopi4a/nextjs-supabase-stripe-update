"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Dumbbell, Save, X, Edit3 } from "lucide-react";
import { WorkoutExercise } from "@/app/protected/programs/create/step2/page";

interface WorkoutDay {
  day_of_week: number;
  name: string;
  exercises: WorkoutExercise[];
  estimated_duration: number;
  workout_type: string;
  status?: 'assigned' | 'completed' | 'skipped';
}

interface DayWorkoutInlineEditorProps {
  date: Date;
  workout?: WorkoutDay;
  isTrainer: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (workout: WorkoutDay) => void;
  onCancel: () => void;
  onUpdateStatus?: (status: 'assigned' | 'completed' | 'skipped') => void;
  availableExercises?: any[];
}

export function DayWorkoutInlineEditor({
  date,
  workout,
  isTrainer,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onUpdateStatus,
  availableExercises = []
}: DayWorkoutInlineEditorProps) {
  const [editingWorkout, setEditingWorkout] = useState<WorkoutDay>(
    workout || {
      day_of_week: date.getDay(),
      name: `Тренировка за ${date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}`,
      exercises: [],
      estimated_duration: 60,
      workout_type: 'strength',
      status: 'assigned'
    }
  );

  const dateStr = date.toLocaleDateString('bg-BG', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const handleSave = () => {
    onSave(editingWorkout);
  };

  const handleAddExercise = () => {
    if (availableExercises.length === 0) return;
    
    const newExercise: WorkoutExercise = {
      exercise_id: availableExercises[0].id,
      exercise: availableExercises[0],
      sets: 3,
      reps: "8-12",
      rest_time: 60,
      weight: "",
      notes: ""
    };
    
    setEditingWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const handleRemoveExercise = (index: number) => {
    setEditingWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateExercise = (index: number, field: string, value: any) => {
    setEditingWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'skipped':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Изпълнено';
      case 'skipped':
        return 'Пропуснато';
      default:
        return 'Зададено';
    }
  };

  if (!isEditing && !workout) {
    return (
      <Card className="p-4 border-dashed">
        <div className="text-center py-8">
          <Dumbbell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Няма планирана тренировка
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {dateStr}
          </p>
          {isTrainer && (
            <Button onClick={onStartEdit} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Добави тренировка
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (!isEditing && workout) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              {workout.name}
            </h3>
            <p className="text-sm text-gray-600">{dateStr}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isTrainer && onUpdateStatus && (
              <Select 
                value={workout.status || 'assigned'} 
                onValueChange={onUpdateStatus}
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Зададено</SelectItem>
                  <SelectItem value="completed">Изпълнено</SelectItem>
                  <SelectItem value="skipped">Пропуснато</SelectItem>
                </SelectContent>
              </Select>
            )}
            {workout.status && (
              <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(workout.status)}`}>
                {getStatusText(workout.status)}
              </div>
            )}
            {isTrainer && (
              <Button onClick={onStartEdit} size="sm" variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Редактирай
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {workout.exercises.map((exercise, index) => (
            <Card key={index} className="p-3 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{exercise.exercise.name}</h4>
                <div className="text-xs text-gray-600">
                  {exercise.sets} серии × {exercise.reps}
                  {exercise.weight && ` × ${exercise.weight}`}
                </div>
              </div>
              <p className="text-xs text-gray-600">
                {exercise.exercise.muscle_groups.join(", ")} • Почивка: {exercise.rest_time}с
              </p>
              {exercise.notes && (
                <p className="text-xs text-gray-700 mt-2 italic">
                  {exercise.notes}
                </p>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t bg-gray-50 -mx-4 px-4 -mb-4 pb-4 rounded-b-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Упражнения:</span>
              <p className="font-medium">{workout.exercises.length}</p>
            </div>
            <div>
              <span className="text-gray-600">Време:</span>
              <p className="font-medium">{workout.estimated_duration} мин</p>
            </div>
            <div>
              <span className="text-gray-600">Тип:</span>
              <p className="font-medium capitalize">{workout.workout_type}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-purple-200 bg-purple-50/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Редактиране за {dateStr}
        </h3>
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Запази
          </Button>
          <Button onClick={onCancel} size="sm" variant="outline">
            <X className="h-4 w-4 mr-2" />
            Отказ
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Basic workout info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Име на тренировката</Label>
            <Input
              value={editingWorkout.name}
              onChange={(e) => setEditingWorkout(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Име на тренировката"
            />
          </div>
          <div>
            <Label>Очаквано време (мин)</Label>
            <Input
              type="number"
              value={editingWorkout.estimated_duration}
              onChange={(e) => setEditingWorkout(prev => ({ ...prev, estimated_duration: Number(e.target.value) }))}
              min="15"
              max="180"
            />
          </div>
          <div>
            <Label>Тип тренировка</Label>
            <Select
              value={editingWorkout.workout_type}
              onValueChange={(value) => setEditingWorkout(prev => ({ ...prev, workout_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Силова</SelectItem>
                <SelectItem value="cardio">Кардио</SelectItem>
                <SelectItem value="flexibility">Гъвкавост</SelectItem>
                <SelectItem value="hiit">HIIT</SelectItem>
                <SelectItem value="mixed">Смесена</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Упражнения</Label>
            <Button onClick={handleAddExercise} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Добави упражнение
            </Button>
          </div>

          <div className="space-y-3">
            {editingWorkout.exercises.map((exercise, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{exercise.exercise.name}</h4>
                    <p className="text-sm text-gray-600">
                      {exercise.exercise.muscle_groups.join(", ")} • {exercise.exercise.difficulty}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleRemoveExercise(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <Label className="text-xs">Серии</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={exercise.sets}
                      onChange={(e) => handleUpdateExercise(index, "sets", Number(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Повторения</Label>
                    <Input
                      placeholder="8-12"
                      value={exercise.reps}
                      onChange={(e) => handleUpdateExercise(index, "reps", e.target.value)}
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
                      value={exercise.rest_time}
                      onChange={(e) => handleUpdateExercise(index, "rest_time", Number(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Тежест</Label>
                    <Input
                      placeholder="20кг, телесно..."
                      value={exercise.weight || ""}
                      onChange={(e) => handleUpdateExercise(index, "weight", e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Бележки</Label>
                  <Textarea
                    placeholder="Допълнителни инструкции..."
                    value={exercise.notes || ""}
                    onChange={(e) => handleUpdateExercise(index, "notes", e.target.value)}
                    className="min-h-[60px] text-sm"
                    rows={2}
                  />
                </div>
              </Card>
            ))}
            
            {editingWorkout.exercises.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Няма добавени упражнения</p>
                <p className="text-sm">Натиснете "Добави упражнение" за да започнете</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}