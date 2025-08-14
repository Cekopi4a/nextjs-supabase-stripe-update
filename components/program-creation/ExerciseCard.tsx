"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Dumbbell } from "lucide-react";
import { Exercise } from "@/app/protected/programs/create/step2/page";

interface ExerciseCardProps {
  exercise: Exercise;
  onAdd?: () => void;
  disabled?: boolean;
}

const muscleGroupsTranslations = {
  chest: "Гърди",
  back: "Гръб", 
  shoulders: "Рамене",
  biceps: "Бицепс",
  triceps: "Трицепс",
  quadriceps: "Квадрицепс",
  hamstrings: "Задна част на бедрото",
  glutes: "Седалищни мускули",
  calves: "Прасци",
  core: "Корпус",
  cardio: "Кардио"
};

const difficultyTranslations = {
  beginner: "Начинаещ",
  intermediate: "Средно ниво", 
  advanced: "Напреднал"
};

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800"
};

export function ExerciseCard({ exercise, onAdd, disabled }: ExerciseCardProps) {
  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAdd) {
      onAdd();
    }
  };

  return (
    <div className="relative">
      <Card className="transition-all hover:shadow-md hover:bg-accent/50">
        <div className="p-3 pr-12">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2 flex-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <Dumbbell className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm leading-tight">
                      {exercise.name}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {exercise.muscle_groups.map((group) => (
            <Badge key={group} variant="secondary" className="text-xs">
              {muscleGroupsTranslations[group as keyof typeof muscleGroupsTranslations] || group}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`text-xs ${difficultyColors[exercise.difficulty as keyof typeof difficultyColors]}`}
          >
            {difficultyTranslations[exercise.difficulty as keyof typeof difficultyTranslations] || exercise.difficulty}
          </Badge>
          
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {exercise.equipment.join(", ")}
            </div>
          )}
        </div>
      </div>
    </Card>
    
    {/* Button positioned absolutely outside the card */}
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handleAddClick}
      disabled={false}
      className="absolute top-2 right-2 h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500 z-20 cursor-pointer shadow-lg"
      title={disabled ? "Изберете ден от календара първо" : "Добави упражнение"}
    >
      <Plus className="h-4 w-4" />
    </Button>
  </div>
  );
}