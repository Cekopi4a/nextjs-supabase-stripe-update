"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Dumbbell, Edit, Trash2, Play, Image } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscle_groups: string[];
  difficulty: string;
  exercise_type: string;
  equipment?: string[];
  video_url?: string;
  image_url?: string;
  created_at: string;
}

interface ExercisesPageClientProps {
  initialExercises: Exercise[];
  userRole: "trainer" | "client";
  userId: string;
}

const MUSCLE_GROUPS = [
  "Гърди", "Гръб", "Раменете", "Ръце", "Корем", "Крака", "Глутеуси", "Икри"
];

const EQUIPMENT_OPTIONS = [
  "Щанга", "Дъмбели", "Кабел", "Тренажор", "Собствено тегло", "Еластици", "Топка"
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Начинаещ" },
  { value: "intermediate", label: "Средно" },
  { value: "advanced", label: "Напреднал" }
];

const EXERCISE_TYPES = [
  { value: "strength", label: "Силови" },
  { value: "cardio", label: "Кардио" },
  { value: "flexibility", label: "Гъвкавост" },
  { value: "balance", label: "Баланс" }
];

export default function ExercisesPageClient({ 
  initialExercises, 
  userRole, 
  userId 
}: ExercisesPageClientProps) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    muscle_groups: [] as string[],
    difficulty: "beginner",
    exercise_type: "strength",
    equipment: [] as string[],
    video_url: "",
    image_url: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isEditing = editingExercise !== null;
      const url = isEditing ? `/api/exercises/${editingExercise.id}` : "/api/exercises";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          trainer_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(isEditing ? "Грешка при редактиране на упражнението" : "Грешка при създаване на упражнението");
      }

      const updatedExercise = await response.json();
      
      if (isEditing) {
        setExercises(exercises.map(ex => ex.id === editingExercise.id ? updatedExercise : ex));
        setIsEditDialogOpen(false);
        setEditingExercise(null);
      } else {
        setExercises([updatedExercise, ...exercises]);
        setIsCreateDialogOpen(false);
      }
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        muscle_groups: [],
        difficulty: "beginner",
        exercise_type: "strength",
        equipment: [],
        video_url: "",
        image_url: ""
      });
    } catch (error) {
      console.error("Error saving exercise:", error);
      alert(editingExercise ? "Грешка при редактиране на упражнението" : "Грешка при създаване на упражнението");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMuscleGroupToggle = (muscleGroup: string) => {
    setFormData(prev => ({
      ...prev,
      muscle_groups: prev.muscle_groups.includes(muscleGroup)
        ? prev.muscle_groups.filter(mg => mg !== muscleGroup)
        : [...prev.muscle_groups, muscleGroup]
    }));
  };

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(eq => eq !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      description: exercise.description || "",
      muscle_groups: exercise.muscle_groups,
      difficulty: exercise.difficulty,
      exercise_type: exercise.exercise_type,
      equipment: exercise.equipment || [],
      video_url: exercise.video_url || "",
      image_url: exercise.image_url || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (exerciseId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете това упражнение?")) {
      return;
    }

    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Грешка при изтриване на упражнението");
      }

      setExercises(exercises.filter(ex => ex.id !== exerciseId));
    } catch (error) {
      console.error("Error deleting exercise:", error);
      alert("Грешка при изтриване на упражнението");
    }
  };

  if (userRole !== "trainer") {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Достъп отказан</CardTitle>
            <CardDescription>
              Само треньори имат достъп до създаване на упражнения.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Упражнения</h1>
          <p className="text-gray-600">Създавайте и управлявайте вашите упражнения</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Ново упражнение
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Създаване на ново упражнение</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Име */}
              <div>
                <Label htmlFor="name">Име на упражнението *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Например: Лицнци на лежанка"
                  required
                />
              </div>

              {/* Описание */}
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Опишете как се изпълнява упражнението..."
                  rows={3}
                />
              </div>

              {/* Мускулни групи */}
              <div>
                <Label>Мускулни групи *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {MUSCLE_GROUPS.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => handleMuscleGroupToggle(group)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        formData.muscle_groups.includes(group)
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Оборудване */}
              <div>
                <Label>Необходимо оборудване</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <button
                      key={equipment}
                      type="button"
                      onClick={() => handleEquipmentToggle(equipment)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        formData.equipment.includes(equipment)
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {equipment}
                    </button>
                  ))}
                </div>
              </div>

              {/* Трудност и Тип */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Трудност</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
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
                  <Label htmlFor="exercise_type">Тип упражнение</Label>
                  <Select 
                    value={formData.exercise_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, exercise_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXERCISE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Видео URL */}
              <div>
                <Label htmlFor="video_url">Видео URL</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* Снимка URL */}
              <div>
                <Label htmlFor="image_url">Снимка URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Submit buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Отказ
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Създаване..." : "Създай упражнение"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактиране на упражнение</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Име */}
              <div>
                <Label htmlFor="edit-name">Име на упражнението *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Например: Лицнци на лежанка"
                  required
                />
              </div>

              {/* Описание */}
              <div>
                <Label htmlFor="edit-description">Описание</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Опишете как се изпълнява упражнението..."
                  rows={3}
                />
              </div>

              {/* Мускулни групи */}
              <div>
                <Label>Мускулни групи *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {MUSCLE_GROUPS.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => handleMuscleGroupToggle(group)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        formData.muscle_groups.includes(group)
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Оборудване */}
              <div>
                <Label>Необходимо оборудване</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <button
                      key={equipment}
                      type="button"
                      onClick={() => handleEquipmentToggle(equipment)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        formData.equipment.includes(equipment)
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {equipment}
                    </button>
                  ))}
                </div>
              </div>

              {/* Трудност и Тип */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-difficulty">Трудност</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
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
                  <Label htmlFor="edit-exercise_type">Тип упражнение</Label>
                  <Select 
                    value={formData.exercise_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, exercise_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXERCISE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Видео URL */}
              <div>
                <Label htmlFor="edit-video_url">Видео URL</Label>
                <Input
                  id="edit-video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* Снимка URL */}
              <div>
                <Label htmlFor="edit-image_url">Снимка URL</Label>
                <Input
                  id="edit-image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Submit buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingExercise(null);
                    setFormData({
                      name: "",
                      description: "",
                      muscle_groups: [],
                      difficulty: "beginner",
                      exercise_type: "strength",
                      equipment: [],
                      video_url: "",
                      image_url: ""
                    });
                  }}
                >
                  Отказ
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Запазване..." : "Запази промените"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exercises List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exercises.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Няма упражнения</h3>
                <p className="text-gray-600 text-center">
                  Създайте първото си упражнение, за да започнете да изграждате библиотека.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          exercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {DIFFICULTY_LEVELS.find(d => d.value === exercise.difficulty)?.label}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {EXERCISE_TYPES.find(t => t.value === exercise.exercise_type)?.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(exercise)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(exercise.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {exercise.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {exercise.description}
                  </p>
                )}
                
                {/* Muscle Groups */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {exercise.muscle_groups.map((group, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                {exercise.equipment && exercise.equipment.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Оборудване:</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.equipment.map((eq, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Links */}
                <div className="flex gap-2 mt-3">
                  {exercise.video_url && (
                    <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                      <a href={exercise.video_url} target="_blank" rel="noopener noreferrer">
                        <Play className="h-3 w-3 mr-1" />
                        Видео
                      </a>
                    </Button>
                  )}
                  {exercise.image_url && (
                    <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                      <a href={exercise.image_url} target="_blank" rel="noopener noreferrer">
                        <Image className="h-3 w-3 mr-1" />
                        Снимка
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}