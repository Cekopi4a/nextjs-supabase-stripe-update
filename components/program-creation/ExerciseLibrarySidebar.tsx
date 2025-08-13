"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronRight, ChevronLeft, Filter, X } from "lucide-react";
import { Exercise } from "@/app/protected/programs/create/step2/page";
import { ExerciseCard } from "@/components/program-creation/ExerciseCard";

interface ExerciseLibrarySidebarProps {
  exercises: Exercise[];
  isOpen: boolean;
  onToggle: () => void;
  onAddExercise?: (exercise: Exercise) => void;
}

const muscleGroups = [
  "chest", "back", "shoulders", "biceps", "triceps", 
  "quadriceps", "hamstrings", "glutes", "calves", "core", "cardio"
];

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

export function ExerciseLibrarySidebar({ 
  exercises, 
  isOpen, 
  onToggle, 
  onAddExercise 
}: ExerciseLibrarySidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(exercises);

  // Get unique equipment from exercises
  const equipmentOptions = Array.from(
    new Set(exercises.flatMap(ex => ex.equipment))
  ).filter(Boolean);

  useEffect(() => {
    let filtered = exercises;
    
    if (searchTerm) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedMuscleGroup) {
      filtered = filtered.filter(ex => 
        ex.muscle_groups.includes(selectedMuscleGroup)
      );
    }
    
    if (selectedEquipment) {
      filtered = filtered.filter(ex => 
        ex.equipment.includes(selectedEquipment)
      );
    }
    
    if (selectedDifficulty) {
      filtered = filtered.filter(ex => 
        ex.difficulty === selectedDifficulty
      );
    }
    
    setFilteredExercises(filtered);
  }, [searchTerm, selectedMuscleGroup, selectedEquipment, selectedDifficulty, exercises]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMuscleGroup("");
    setSelectedEquipment("");
    setSelectedDifficulty("");
  };

  const hasActiveFilters = searchTerm || selectedMuscleGroup || selectedEquipment || selectedDifficulty;

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
        
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Търси упражнения..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-2">
            <Select value={selectedMuscleGroup} onValueChange={(v) => setSelectedMuscleGroup(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Мускулна група" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички групи</SelectItem>
                {muscleGroups.map(group => (
                  <SelectItem key={group} value={group}>
                    {muscleGroupsTranslations[group as keyof typeof muscleGroupsTranslations] || group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEquipment} onValueChange={(v) => setSelectedEquipment(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Оборудване" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички</SelectItem>
                {equipmentOptions.map(equipment => (
                  <SelectItem key={equipment} value={equipment}>
                    {equipment === "none" ? "Без оборудване" : equipment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Трудност" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички нива</SelectItem>
                <SelectItem value="beginner">Начинаещ</SelectItem>
                <SelectItem value="intermediate">Средно ниво</SelectItem>
                <SelectItem value="advanced">Напреднал</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <X className="h-3 w-3 mr-2" />
              Изчисти филтрите
            </Button>
          )}

          {/* Results count */}
          <div className="text-sm text-muted-foreground text-center">
            {filteredExercises.length} от {exercises.length} упражнения
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="p-4">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Няма упражнения, отговарящи на филтрите
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onAdd={onAddExercise ? () => onAddExercise(exercise) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}