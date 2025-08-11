"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Dumbbell } from "lucide-react";
import { Exercise } from "@/app/protected/programs/create/step2/page";

interface ExerciseCardProps {
  exercise: Exercise;
  onAdd: () => void;
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

export function ExerciseCard({ exercise, onAdd }: ExerciseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: exercise.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`transition-all cursor-grab active:cursor-grabbing ${
        isDragging 
          ? "opacity-50 shadow-lg scale-105 rotate-2" 
          : "hover:shadow-md hover:bg-accent/50"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2 flex-1">
            <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
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
          <Button 
            size="sm" 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="flex-shrink-0 h-7 w-7 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Muscle Groups */}
        <div className="flex flex-wrap gap-1 mb-2">
          {exercise.muscle_groups.slice(0, 2).map((group) => (
            <Badge key={group} variant="secondary" className="text-xs px-1.5 py-0.5">
              {muscleGroupsTranslations[group as keyof typeof muscleGroupsTranslations] || group}
            </Badge>
          ))}
          {exercise.muscle_groups.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              +{exercise.muscle_groups.length - 2}
            </Badge>
          )}
        </div>

        {/* Difficulty and Equipment */}
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            difficultyColors[exercise.difficulty as keyof typeof difficultyColors] || 
            "bg-gray-100 text-gray-800"
          }`}>
            {difficultyTranslations[exercise.difficulty as keyof typeof difficultyTranslations] || exercise.difficulty}
          </span>
          
          <span className="text-muted-foreground">
            {exercise.equipment.includes("none") ? "Без оборудване" : 
             exercise.equipment.slice(0, 1).join(", ") + 
             (exercise.equipment.length > 1 ? ` +${exercise.equipment.length - 1}` : "")
            }
          </span>
        </div>

        {/* Drag hint */}
        <div className="mt-2 text-xs text-muted-foreground/60 text-center">
          Влачете към ден или използвайте +
        </div>
      </div>
    </Card>
  );
}