"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Dumbbell, Edit, Trash2, Play, Image, X, Search } from "lucide-react";

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
  created_at: string;
  updated_at: string;
}

interface ExercisesPageClientProps {
  initialExercises: Exercise[];
  userRole: "trainer" | "client";
  userId: string;
}

const MUSCLE_GROUPS = [
  "abdominals", "hamstrings", "adductors", "quadriceps", "biceps", "shoulders", "chest", "middle back", "calves", "glutes",
  "lower back", "lats", "triceps", "traps", "forearms", "neck", "abductors"
];

const EQUIPMENT_OPTIONS = [
  "body only", "machine", "other", "foam roll", "kettlebells", "dumbbell", "cable", "barbell", "bands", "medicine ball", "exercise ball", "e-z curl bar"
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Начинаещ" },
  { value: "intermediate", label: "Средно" },
  { value: "expert", label: "Експерт" }
];

const CATEGORIES = [
  { value: "strength", label: "Силови" },
  { value: "stretching", label: "Стречинг" },
  { value: "plyometrics", label: "Плиометрия" },
  { value: "strongman", label: "Стронгмен" },
  { value: "powerlifting", label: "Пауърлифтинг" },
  { value: "cardio", label: "Кардио" },
  { value: "olympic weightlifting", label: "Олимпийско вдигане" }
];

export default function ExercisesPageClient({
  initialExercises,
  userRole,
  userId
}: ExercisesPageClientProps) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    instructions: [] as string[],
    primary_muscles: [] as string[],
    secondary_muscles: [] as string[],
    level: "beginner",
    category: "strength",
    equipment: "body only",
    video_urls: [] as string[],
    custom_images: [] as string[],
    instruction_text: ""
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
          name: formData.name,
          instructions: formData.instruction_text.split('\n').filter(i => i.trim()),
          primary_muscles: formData.primary_muscles,
          secondary_muscles: formData.secondary_muscles,
          level: formData.level,
          category: formData.category,
          equipment: formData.equipment,
          video_urls: formData.video_urls.filter(v => v.trim()),
          custom_images: formData.custom_images.filter(i => i.trim()),
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
      resetForm();
    } catch (error) {
      console.error("Error saving exercise:", error);
      alert(editingExercise ? "Грешка при редактиране на упражнението" : "Грешка при създаване на упражнението");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      instructions: [],
      primary_muscles: [],
      secondary_muscles: [],
      level: "beginner",
      category: "strength",
      equipment: "body only",
      video_urls: [],
      custom_images: [],
      instruction_text: ""
    });
  };

  const handlePrimaryMuscleToggle = (muscle: string) => {
    setFormData(prev => ({
      ...prev,
      primary_muscles: prev.primary_muscles.includes(muscle)
        ? prev.primary_muscles.filter(m => m !== muscle)
        : [...prev.primary_muscles, muscle]
    }));
  };

  const handleSecondaryMuscleToggle = (muscle: string) => {
    setFormData(prev => ({
      ...prev,
      secondary_muscles: prev.secondary_muscles.includes(muscle)
        ? prev.secondary_muscles.filter(m => m !== muscle)
        : [...prev.secondary_muscles, muscle]
    }));
  };

  const handleVideoUrlAdd = () => {
    setFormData(prev => ({
      ...prev,
      video_urls: [...prev.video_urls, ""]
    }));
  };

  const handleVideoUrlChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      video_urls: prev.video_urls.map((url, i) => i === index ? value : url)
    }));
  };

  const handleVideoUrlRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      video_urls: prev.video_urls.filter((_, i) => i !== index)
    }));
  };

  const handleImageUrlAdd = () => {
    setFormData(prev => ({
      ...prev,
      custom_images: [...prev.custom_images, ""]
    }));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      custom_images: prev.custom_images.map((url, i) => i === index ? value : url)
    }));
  };

  const handleImageUrlRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      custom_images: prev.custom_images.filter((_, i) => i !== index)
    }));
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      instructions: exercise.instructions || [],
      primary_muscles: exercise.primary_muscles || [],
      secondary_muscles: exercise.secondary_muscles || [],
      level: exercise.level,
      category: exercise.category,
      equipment: exercise.equipment || "body only",
      video_urls: exercise.video_urls || [],
      custom_images: exercise.custom_images || [],
      instruction_text: (exercise.instructions || []).join('\n')
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

  const canEdit = (exercise: Exercise) => {
    return userRole === "trainer" && exercise.trainer_id === userId;
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDetailDialogOpen(true);
  };

  // Filter and sort exercises
  const filteredAndSortedExercises = () => {
    let filtered = exercises;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort: own exercises first (for trainers), then alphabetically
    if (userRole === "trainer") {
      return filtered.sort((a, b) => {
        // First, sort by ownership (own exercises first)
        if (a.trainer_id === userId && b.trainer_id !== userId) return -1;
        if (a.trainer_id !== userId && b.trainer_id === userId) return 1;

        // Then sort alphabetically
        return a.name.localeCompare(b.name);
      });
    }

    // For clients, just sort alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
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

      {/* Instructions */}
      <div>
        <Label htmlFor="instructions">Инструкции за изпълнение</Label>
        <Textarea
          id="instructions"
          value={formData.instruction_text}
          onChange={(e) => setFormData(prev => ({ ...prev, instruction_text: e.target.value }))}
          placeholder="Напишете инструкциите, всяка на нов ред..."
          rows={4}
        />
      </div>

      {/* Primary Muscles */}
      <div>
        <Label>Основни мускулни групи *</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {MUSCLE_GROUPS.map((muscle) => (
            <button
              key={muscle}
              type="button"
              onClick={() => handlePrimaryMuscleToggle(muscle)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                formData.primary_muscles.includes(muscle)
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Muscles */}
      <div>
        <Label>Второстепенни мускулни групи</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {MUSCLE_GROUPS.map((muscle) => (
            <button
              key={muscle}
              type="button"
              onClick={() => handleSecondaryMuscleToggle(muscle)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                formData.secondary_muscles.includes(muscle)
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div>
        <Label htmlFor="equipment">Оборудване</Label>
        <Select
          value={formData.equipment}
          onValueChange={(value) => setFormData(prev => ({ ...prev, equipment: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <SelectItem key={equipment} value={equipment}>
                {equipment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level and Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="level">Ниво на трудност</Label>
          <Select
            value={formData.level}
            onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
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
          <Label htmlFor="category">Категория</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Video URLs */}
      <div>
        <Label>Видео линкове</Label>
        <div className="space-y-2 mt-2">
          {formData.video_urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleVideoUrlRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleVideoUrlAdd}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добави видео
          </Button>
        </div>
      </div>

      {/* Image URLs */}
      <div>
        <Label>Снимки</Label>
        <div className="space-y-2 mt-2">
          {formData.custom_images.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleImageUrlRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImageUrlAdd}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добави снимка
          </Button>
        </div>
      </div>

      {/* Submit buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingExercise(null);
            resetForm();
          }}
        >
          Отказ
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? (editingExercise ? "Запазване..." : "Създаване...")
            : (editingExercise ? "Запази промените" : "Създай упражнение")
          }
        </Button>
      </div>
    </form>
  );

  if (userRole !== "trainer") {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Exercises List for clients */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Упражнения</h1>
          <p className="text-gray-600">Упражнения от вашия треньор</p>
        </div>

        {/* Search Field for clients */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Търсене по име на упражнение..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedExercises().length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Dumbbell className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Няма упражнения</h3>
                  <p className="text-gray-600 text-center">
                    Вашият треньор още не е добавил упражнения.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredAndSortedExercises().map((exercise) => (
              <Card
                key={exercise.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleExerciseClick(exercise)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="capitalize">
                          {DIFFICULTY_LEVELS.find(d => d.value === exercise.level)?.label}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {CATEGORIES.find(t => t.value === exercise.category)?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Exercise Images */}
                  {(
                    (exercise.images && exercise.images.length > 0) ||
                    (exercise.custom_images && exercise.custom_images.length > 0)
                  ) && (
                    <div className="mb-3">
                      <div className="grid grid-cols-2 gap-2">
                        {exercise.custom_images?.slice(0, 2).map((url, index) => (
                          url && (
                            <div key={`custom-${index}`} className="aspect-video relative overflow-hidden rounded-md bg-gray-100">
                              <img
                                src={url}
                                alt={`${exercise.name} - снимка ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(url, '_blank');
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )
                        ))}
                        {exercise.images?.slice(0, 2 - (exercise.custom_images?.filter(Boolean).length || 0)).map((url, index) => (
                          url && (
                            <div key={`default-${index}`} className="aspect-video relative overflow-hidden rounded-md bg-gray-100">
                              <img
                                src={url}
                                alt={`${exercise.name} - снимка ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(url, '_blank');
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {exercise.instructions && exercise.instructions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Инструкции:</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        {exercise.instructions.slice(0, 2).map((instruction, index) => (
                          <p key={index} className="line-clamp-1">{instruction}</p>
                        ))}
                        {exercise.instructions.length > 2 && (
                          <p className="text-gray-400">+ още {exercise.instructions.length - 2} инструкции</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Primary Muscles */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Основни мускули:</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.primary_muscles.map((muscle, index) => (
                        <Badge key={index} variant="default" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Muscles */}
                  {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Второстепенни мускули:</p>
                      <div className="flex flex-wrap gap-1">
                        {exercise.secondary_muscles.map((muscle, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Оборудване:</p>
                    <Badge variant="secondary" className="text-xs">
                      {exercise.equipment}
                    </Badge>
                  </div>

                  {/* Media Links */}
                  <div className="flex gap-2 mt-3">
                    {exercise.video_urls && exercise.video_urls.map((url, index) => (
                      url && (
                        <Button key={index} variant="outline" size="sm" className="h-8 text-xs" asChild>
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <Play className="h-3 w-3 mr-1" />
                            Видео {exercise.video_urls!.length > 1 ? index + 1 : ''}
                          </a>
                        </Button>
                      )
                    ))}
                    {((exercise.custom_images && exercise.custom_images.filter(Boolean).length > 2) ||
                      (exercise.images && exercise.images.filter(Boolean).length > 2) ||
                      ((exercise.custom_images?.filter(Boolean).length || 0) + (exercise.images?.filter(Boolean).length || 0) > 2)) && (
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={(e) => {
                        e.stopPropagation();
                        handleExerciseClick(exercise);
                      }}>
                        <Image className="h-3 w-3 mr-1" />
                        Още снимки
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

            {renderForm()}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактиране на упражнение</DialogTitle>
            </DialogHeader>

            {renderForm()}
          </DialogContent>
        </Dialog>

        {/* Exercise Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                {selectedExercise?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedExercise && (
              <div className="space-y-6">
                {/* Exercise Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Информация</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Ниво:</span>
                        <Badge variant="secondary">
                          {DIFFICULTY_LEVELS.find(d => d.value === selectedExercise.level)?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Категория:</span>
                        <Badge variant="outline">
                          {CATEGORIES.find(c => c.value === selectedExercise.category)?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Оборудване:</span>
                        <Badge variant="secondary">{selectedExercise.equipment}</Badge>
                      </div>
                      {selectedExercise.trainer_id && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Тип:</span>
                          <Badge variant="default">Собствено упражнение</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Muscle Groups */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Мускулни групи</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Основни мускули:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedExercise.primary_muscles.map((muscle, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {selectedExercise.secondary_muscles && selectedExercise.secondary_muscles.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Второстепенни мускули:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedExercise.secondary_muscles.map((muscle, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Exercise Images */}
                {((selectedExercise.custom_images && selectedExercise.custom_images.length > 0) ||
                  (selectedExercise.images && selectedExercise.images.length > 0)) && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">Снимки на упражнението</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedExercise.custom_images?.map((url, index) => (
                        url && (
                          <div key={`custom-${index}`} className="aspect-video relative overflow-hidden rounded-lg bg-gray-100 shadow-sm border">
                            <img
                              src={url}
                              alt={`${selectedExercise.name} - снимка ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(url, '_blank')}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )
                      ))}
                      {selectedExercise.images?.map((url, index) => (
                        url && (
                          <div key={`default-${index}`} className="aspect-video relative overflow-hidden rounded-lg bg-gray-100 shadow-sm border">
                            <img
                              src={url}
                              alt={`${selectedExercise.name} - снимка ${index + 1 + (selectedExercise.custom_images?.filter(Boolean).length || 0)}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(url, '_blank')}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Инструкции за изпълнение</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ol className="list-decimal list-inside space-y-2">
                        {selectedExercise.instructions.map((instruction, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            {instruction}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {/* Media */}
                {selectedExercise.video_urls && selectedExercise.video_urls.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">Видео материали</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedExercise.video_urls.map((url, index) => (
                        url && (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            asChild
                          >
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <Play className="h-4 w-4 mr-2" />
                              Видео {selectedExercise.video_urls!.length > 1 ? index + 1 : ''}
                            </a>
                          </Button>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions for trainers */}
                {canEdit(selectedExercise) && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="default"
                      onClick={() => {
                        handleEdit(selectedExercise);
                        setIsDetailDialogOpen(false);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Редактирай
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDelete(selectedExercise.id);
                        setIsDetailDialogOpen(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Изтрий
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Field for trainers */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Търсене по име на упражнение..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Exercises Sections */}
      {filteredAndSortedExercises().length === 0 ? (
        <div className="col-span-full">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? "Няма намерени упражнения" : "Няма упражнения"}
              </h3>
              <p className="text-gray-600 text-center">
                {searchTerm
                  ? "Опитайте с друго търсене."
                  : "Създайте първото си упражнение, за да започнете да изграждате библиотека."
                }
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Own Exercises Section */}
          {filteredAndSortedExercises().some(ex => ex.trainer_id === userId) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Dumbbell className="h-5 w-5 mr-2" />
                Моите упражнения
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedExercises()
                  .filter(exercise => exercise.trainer_id === userId)
                  .map((exercise) => (
            <Card
              key={exercise.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleExerciseClick(exercise)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {DIFFICULTY_LEVELS.find(d => d.value === exercise.level)?.label}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {CATEGORIES.find(t => t.value === exercise.category)?.label}
                      </Badge>
                      {exercise.trainer_id && (
                        <Badge variant="default" className="text-xs">
                          Собствено
                        </Badge>
                      )}
                    </div>
                  </div>

                  {canEdit(exercise) && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(exercise);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(exercise.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {/* Exercise Images */}
                {(
                  (exercise.images && exercise.images.length > 0) ||
                  (exercise.custom_images && exercise.custom_images.length > 0)
                ) && (
                  <div className="mb-3">
                    <div className="grid grid-cols-2 gap-2">
                      {exercise.custom_images?.slice(0, 2).map((url, index) => (
                        url && (
                          <div key={`custom-${index}`} className="aspect-video relative overflow-hidden rounded-md bg-gray-100">
                            <img
                              src={url}
                              alt={`${exercise.name} - снимка ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(url, '_blank');
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )
                      ))}
                      {exercise.images?.slice(0, 2 - (exercise.custom_images?.filter(Boolean).length || 0)).map((url, index) => (
                        url && (
                          <div key={`default-${index}`} className="aspect-video relative overflow-hidden rounded-md bg-gray-100">
                            <img
                              src={url}
                              alt={`${exercise.name} - снимка ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(url, '_blank');
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {exercise.instructions && exercise.instructions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Инструкции:</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      {exercise.instructions.slice(0, 2).map((instruction, index) => (
                        <p key={index} className="line-clamp-1">{instruction}</p>
                      ))}
                      {exercise.instructions.length > 2 && (
                        <p className="text-gray-400">+ още {exercise.instructions.length - 2} инструкции</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Primary Muscles */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Основни мускули:</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.primary_muscles.map((muscle, index) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Secondary Muscles */}
                {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Второстепенни мускули:</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.secondary_muscles.map((muscle, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipment */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Оборудване:</p>
                  <Badge variant="secondary" className="text-xs">
                    {exercise.equipment}
                  </Badge>
                </div>

                {/* Media Links */}
                <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  {exercise.video_urls && exercise.video_urls.map((url, index) => (
                    url && (
                      <Button key={index} variant="outline" size="sm" className="h-8 text-xs" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <Play className="h-3 w-3 mr-1" />
                          Видео {exercise.video_urls!.length > 1 ? index + 1 : ''}
                        </a>
                      </Button>
                    )
                  ))}
                  {((exercise.custom_images && exercise.custom_images.filter(Boolean).length > 2) ||
                    (exercise.images && exercise.images.filter(Boolean).length > 2) ||
                    ((exercise.custom_images?.filter(Boolean).length || 0) + (exercise.images?.filter(Boolean).length || 0) > 2)) && (
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={(e) => {
                      e.stopPropagation();
                      handleExerciseClick(exercise);
                    }}>
                      <Image className="h-3 w-3 mr-1" />
                      Още снимки
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Global Exercises Section */}
          {filteredAndSortedExercises().some(ex => !ex.trainer_id) && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Dumbbell className="h-5 w-5 mr-2" />
                Общи упражнения
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedExercises()
                  .filter(exercise => !exercise.trainer_id)
                  .map((exercise) => (
            <Card
              key={exercise.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleExerciseClick(exercise)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {DIFFICULTY_LEVELS.find(d => d.value === exercise.level)?.label}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {CATEGORIES.find(t => t.value === exercise.category)?.label}
                      </Badge>
                      {exercise.trainer_id && (
                        <Badge variant="default" className="text-xs">
                          Собствено
                        </Badge>
                      )}
                    </div>
                  </div>

                  {canEdit(exercise) && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(exercise);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(exercise.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {/* Exercise Images */}
                {(
                  (exercise.images && exercise.images.length > 0) ||
                  (exercise.custom_images && exercise.custom_images.length > 0)
                ) && (
                  <div className="mb-3">
                    <div className="grid grid-cols-2 gap-2">
                      {exercise.custom_images?.slice(0, 2).map((url, index) => (
                        url && (
                          <div key={`custom-${index}`} className="aspect-video relative overflow-hidden rounded-md bg-gray-100">
                            <img
                              src={url}
                              alt={`${exercise.name} - снимка ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(url, '_blank');
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )
                      ))}
                      {exercise.images?.slice(0, 2 - (exercise.custom_images?.filter(Boolean).length || 0)).map((url, index) => (
                        url && (
                          <div key={`default-${index}`} className="aspect-video relative overflow-hidden rounded-md bg-gray-100">
                            <img
                              src={url}
                              alt={`${exercise.name} - снимка ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(url, '_blank');
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {exercise.instructions && exercise.instructions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Инструкции:</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      {exercise.instructions.slice(0, 2).map((instruction, index) => (
                        <p key={index} className="line-clamp-1">{instruction}</p>
                      ))}
                      {exercise.instructions.length > 2 && (
                        <p className="text-gray-400">+ още {exercise.instructions.length - 2} инструкции</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Primary Muscles */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Основни мускули:</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.primary_muscles.map((muscle, index) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Secondary Muscles */}
                {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Второстепенни мускули:</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.secondary_muscles.map((muscle, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipment */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Оборудване:</p>
                  <Badge variant="secondary" className="text-xs">
                    {exercise.equipment}
                  </Badge>
                </div>

                {/* Media Links */}
                <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  {exercise.video_urls && exercise.video_urls.map((url, index) => (
                    url && (
                      <Button key={index} variant="outline" size="sm" className="h-8 text-xs" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <Play className="h-3 w-3 mr-1" />
                          Видео {exercise.video_urls!.length > 1 ? index + 1 : ''}
                        </a>
                      </Button>
                    )
                  ))}
                  {((exercise.custom_images && exercise.custom_images.filter(Boolean).length > 2) ||
                    (exercise.images && exercise.images.filter(Boolean).length > 2) ||
                    ((exercise.custom_images?.filter(Boolean).length || 0) + (exercise.images?.filter(Boolean).length || 0) > 2)) && (
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={(e) => {
                      e.stopPropagation();
                      handleExerciseClick(exercise);
                    }}>
                      <Image className="h-3 w-3 mr-1" />
                      Още снимки
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}