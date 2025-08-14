"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Dumbbell, Moon, Calendar, Save } from "lucide-react";
import { DayType } from "@/components/program-creation/DayOptionsModal";
import { WorkoutExercise } from "@/app/protected/programs/create/step2/page";

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

interface DayEditorSectionProps {
  selectedDate: Date | null;
  dayType?: DayType;
  workout?: WorkoutDay;
  restDay?: RestDay;
  isTrainer: boolean;
  availableExercises?: any[];
  onDayTypeChange: (date: Date, type: DayType) => void;
  onSaveWorkout: (date: Date, workout: WorkoutDay) => void;
  onSaveRestDay: (date: Date, restDay: RestDay) => void;
}

export function DayEditorSection({
  selectedDate,
  dayType,
  workout,
  restDay,
  isTrainer,
  availableExercises,
  onDayTypeChange,
  onSaveWorkout,
  onSaveRestDay
}: DayEditorSectionProps) {
  const safeAvailableExercises = availableExercises || [];
  const [localDayType, setLocalDayType] = useState<DayType | undefined>(dayType);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutDay | null>(null);
  const [editingRestDay, setEditingRestDay] = useState<RestDay | null>(null);

  // Reset state when selectedDate changes
  useEffect(() => {
    setLocalDayType(dayType);
    setEditingWorkout(workout || null);
    setEditingRestDay(restDay || null);
  }, [selectedDate, dayType, workout, restDay]);

  // Update editing workout when workout prop changes (from external additions)
  useEffect(() => {
    if (workout && localDayType === 'workout') {
      setEditingWorkout(workout);
    }
  }, [workout, localDayType]);

  if (!selectedDate) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Изберете ден от календара</h3>
          <p className="text-sm">Кликнете върху ден в календара за да го редактирате</p>
        </div>
      </Card>
    );
  }

  const dateStr = selectedDate.toLocaleDateString('bg-BG', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const handleDayTypeChange = (newType: DayType) => {
    setLocalDayType(newType);
    onDayTypeChange(selectedDate, newType);
    
    // Initialize editing state based on type
    if (newType === 'workout') {
      setEditingWorkout(workout || {
        day_of_week: selectedDate.getDay(),
        name: `Тренировка за ${selectedDate.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}`,
        exercises: [],
        estimated_duration: 60,
        workout_type: 'strength',
        status: 'assigned'
      });
      setEditingRestDay(null);
    } else if (newType === 'rest') {
      setEditingRestDay(restDay || {
        name: `Почивка за ${selectedDate.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}`,
        description: ''
      });
      setEditingWorkout(null);
    } else {
      setEditingWorkout(null);
      setEditingRestDay(null);
    }
  };

  const handleSaveWorkout = () => {
    if (editingWorkout) {
      onSaveWorkout(selectedDate, editingWorkout);
      setEditingWorkout(null);
    }
  };

  const handleSaveRestDay = () => {
    if (editingRestDay) {
      onSaveRestDay(selectedDate, editingRestDay);
      setEditingRestDay(null);
    }
  };



  const handleRemoveExercise = (index: number) => {
    setEditingWorkout(prev => prev ? ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }) : null);
  };

  const handleUpdateExercise = (index: number, field: string, value: any) => {
    setEditingWorkout(prev => prev ? ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }) : null);
  };

  const dayTypeOptions = [
    {
      value: 'workout',
      label: 'Тренировъчен ден',
      icon: Dumbbell,
      color: 'text-green-600'
    },
    {
      value: 'rest',
      label: 'Почивен ден',
      icon: Moon,
      color: 'text-purple-600'
    },
    {
      value: 'free',
      label: 'Свободен ден',
      icon: Calendar,
      color: 'text-gray-600'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Редактиране за {dateStr}</h2>
      </div>

      {/* Day Type Selector */}
      <div className="mb-6">
        <Label className="text-base font-medium mb-3 block">Тип на деня</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dayTypeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = localDayType === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleDayTypeChange(option.value as DayType)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20' 
                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${option.color}`} />
                  <span className="font-medium">{option.label}</span>
                  {isSelected && (
                    <div className="ml-auto w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workout Editor */}
      {localDayType === 'workout' && (
        <div className="space-y-6">
          {/* Workout Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Име на тренировката</Label>
              <Input
                value={editingWorkout?.name || ''}
                onChange={(e) => setEditingWorkout(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                placeholder="Име на тренировката"
              />
            </div>
            <div>
              <Label>Очаквано време (мин)</Label>
              <Input
                type="number"
                value={editingWorkout?.estimated_duration || 60}
                onChange={(e) => setEditingWorkout(prev => prev ? ({ ...prev, estimated_duration: Number(e.target.value) }) : null)}
                min="15"
                max="180"
              />
            </div>
            <div>
              <Label>Тип тренировка</Label>
              <Select
                value={editingWorkout?.workout_type || 'strength'}
                onValueChange={(value) => setEditingWorkout(prev => prev ? ({ ...prev, workout_type: value }) : null)}
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
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Упражнения</Label>
            </div>
            
            {(!editingWorkout?.exercises || editingWorkout.exercises.length === 0) && (
              <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                💡 <strong>Добавяне на упражнения:</strong> Използвайте библиотеката в дясно - кликнете върху упражнението за да го добавите.
              </div>
            )}

            <div className="space-y-4">
              {editingWorkout?.exercises.map((exercise, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 mr-3">
                      <div className="mb-2">
                        <Select
                          value={exercise.exercise_id}
                          onValueChange={(value) => {
                            const newExercise = safeAvailableExercises.find(ex => ex.id === value);
                            if (newExercise) {
                              handleUpdateExercise(index, "exercise_id", value);
                              handleUpdateExercise(index, "exercise", newExercise);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {safeAvailableExercises.map((ex) => (
                              <SelectItem key={ex.id} value={ex.id}>
                                {ex.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-gray-600">
                        {exercise.exercise.muscle_groups?.join(", ")} • {exercise.exercise.difficulty}
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
              )) || []}
              
              {(!editingWorkout?.exercises || editingWorkout.exercises.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Няма добавени упражнения</p>
                  <p className="text-sm">Натиснете "Добави упражнение" за да започнете</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveWorkout} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Запази тренировката
            </Button>
          </div>
        </div>
      )}

      {/* Rest Day Editor */}
      {localDayType === 'rest' && (
        <div className="space-y-4">
          <div>
            <Label>Име на почивката</Label>
            <Input
              value={editingRestDay?.name || ''}
              onChange={(e) => setEditingRestDay(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
              placeholder="Име на почивката"
            />
          </div>
          
          <div>
            <Label>Описание</Label>
            <Textarea
              value={editingRestDay?.description || ''}
              onChange={(e) => setEditingRestDay(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
              placeholder="Описание за почивния ден - напр. активна почивка, разходка, стречинг..."
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveRestDay} className="bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              Запази почивния ден
            </Button>
          </div>
        </div>
      )}

      {/* Free Day */}
      {localDayType === 'free' && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Свободен ден</h3>
          <p className="text-sm">Няма планирани дейности за този ден</p>
        </div>
      )}
    </Card>
  );
}