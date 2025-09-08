"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Exercise } from "@/lib/types/exercises";
import { ExerciseSelector } from "@/components/exercises/ExerciseSelector";

interface ExerciseLibrarySidebarProps {
  exercises: Exercise[];
  isOpen: boolean;
  onToggle: () => void;
  onAddExercise?: (exercise: Exercise) => void;
  selectedDate?: Date | null;
}

export function ExerciseLibrarySidebar({ 
  isOpen, 
  onToggle, 
  onAddExercise,
  selectedDate
}: ExerciseLibrarySidebarProps) {

  const handleAddExercise = (exercise: Exercise) => {
    if (!selectedDate) {
      alert("Моля първо изберете ден от календара!");
      return;
    }
    
    if (onAddExercise) {
      onAddExercise(exercise);
    }
  };

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
    <Card className="h-fit lg:sticky lg:top-6">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Библиотека упражнения</h3>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="lg:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Selected Date Info */}
        {selectedDate && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
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
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <span className="text-yellow-800">
              Изберете ден от календара за да добавяте упражнения
            </span>
          </div>
        )}
      </div>

      {/* Exercise Selector */}
      <div className="p-4">
        <ExerciseSelector
          onExerciseSelect={handleAddExercise}
          selectedExercises={[]}
          filters={{
            limit: 20 // Ограничаваме за по-добра производителност в sidebar
          }}
        />
      </div>
    </Card>
  );
}