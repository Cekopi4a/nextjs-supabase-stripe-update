"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ChefHat, Edit, Trash2, Search, Clock, Users, Star, X, Camera } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { createSupabaseClient } from "@/utils/supabase/client";

interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: { name: string; amount: number; unit: string }[];
  instructions: string[];
  servings: number;
  serving_size_grams?: number;
  serving_size_unit: string;
  total_grams?: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  fiber_per_serving?: number;
  sugar_per_serving?: number;
  sodium_per_serving?: number;
  images?: string[];
  videos?: string[];
  category: string;
  cuisine_type?: string;
  difficulty_level?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes?: number;
  tags?: string[];
  allergens?: string[];
  dietary_preferences?: string[];
  created_by?: string;
  is_verified?: boolean;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

interface RecipesPageClientProps {
  initialRecipes: Recipe[];
  userRole: "trainer" | "client";
  userId: string;
}

const RECIPE_CATEGORIES = [
  { value: "appetizer", label: "Предястия" },
  { value: "main_course", label: "Основни ястия" },
  { value: "dessert", label: "Десерти" },
  { value: "snack", label: "Закуски" },
  { value: "drink", label: "Напитки" },
  { value: "sauce", label: "Сосове" },
  { value: "salad", label: "Салати" },
  { value: "soup", label: "Супи" },
  { value: "other", label: "Други" }
];

const FILTER_CATEGORIES = [
  { value: "all", label: "Всички", icon: "🍽️" },
  { value: "appetizer", label: "Предястия", icon: "🥗" },
  { value: "main_course", label: "Основни", icon: "🍖" },
  { value: "dessert", label: "Десерти", icon: "🍰" },
  { value: "snack", label: "Закуски", icon: "🥨" },
  { value: "drink", label: "Напитки", icon: "🥤" },
  { value: "salad", label: "Салати", icon: "🥬" },
  { value: "soup", label: "Супи", icon: "🍲" },
  { value: "other", label: "Други", icon: "🍴" }
];

const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Лесно" },
  { value: "medium", label: "Средно" },
  { value: "hard", label: "Трудно" }
];

const SERVING_UNITS = [
  { value: "порция", label: "Порция" },
  { value: "гр", label: "Грамове" },
  { value: "чаша", label: "Чаша" },
  { value: "парче", label: "Парче" },
  { value: "резен", label: "Резен" }
];

const COMMON_ALLERGENS = [
  "Глутен", "Лактоза", "Яйца", "Риба", "Ракообразни", "Ядки", "Арахис", "Соя", "Целина", "Синап", "Сусам", "Сулфити"
];

const DIETARY_PREFERENCES = [
  "Вегетарианско", "Веганско", "Безглутенско", "Без лактоза", "Кето", "Нискосолно", "Диабетично"
];

export default function RecipesPageClient({
  initialRecipes,
  userRole,
  userId
}: RecipesPageClientProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredients: [{ name: "", amount: 0, unit: "гр" }],
    instructions: [""],
    servings: 1,
    serving_size_grams: 100,
    serving_size_unit: "порция",
    total_grams: 100,
    calories_per_serving: 0,
    protein_per_serving: 0,
    carbs_per_serving: 0,
    fat_per_serving: 0,
    fiber_per_serving: 0,
    sugar_per_serving: 0,
    sodium_per_serving: 0,
    images: [] as string[],
    videos: [] as string[],
    category: "main_course",
    cuisine_type: "",
    difficulty_level: "easy",
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    total_time_minutes: 0,
    tags: [] as string[],
    allergens: [] as string[],
    dietary_preferences: [] as string[],
    is_public: true
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const supabase = createSupabaseClient();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Не сте влезли в системата");
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `recipes/${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { data, error } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(data.path);

      setSelectedImage(urlData.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Грешка при качване на снимката');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isEditing = editingRecipe !== null;
      const url = isEditing ? `/api/recipes/${editingRecipe.id}` : "/api/recipes";
      const method = isEditing ? "PUT" : "POST";

      // Prepare form data with selected image
      const submitData = {
        ...formData,
        images: selectedImage ? [selectedImage] : []
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(isEditing ? "Грешка при редактиране на рецептата" : "Грешка при създаване на рецептата");
      }

      const updatedRecipe = await response.json();

      if (isEditing) {
        setRecipes(recipes.map(recipe => recipe.id === editingRecipe.id ? updatedRecipe : recipe));
        setIsEditDialogOpen(false);
        setEditingRecipe(null);
      } else {
        setRecipes([updatedRecipe, ...recipes]);
        setIsCreateDialogOpen(false);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert(editingRecipe ? "Грешка при редактиране на рецептата" : "Грешка при създаване на рецептата");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      ingredients: [{ name: "", amount: 0, unit: "гр" }],
      instructions: [""],
      servings: 1,
      serving_size_grams: 100,
      serving_size_unit: "порция",
      total_grams: 100,
      calories_per_serving: 0,
      protein_per_serving: 0,
      carbs_per_serving: 0,
      fat_per_serving: 0,
      fiber_per_serving: 0,
      sugar_per_serving: 0,
      sodium_per_serving: 0,
      images: [],
      videos: [],
      category: "main_course",
      cuisine_type: "",
      difficulty_level: "easy",
      prep_time_minutes: 0,
      cook_time_minutes: 0,
      total_time_minutes: 0,
      tags: [],
      allergens: [],
      dietary_preferences: [],
      is_public: true
    });
    setSelectedImage(null);
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", amount: 0, unit: "гр" }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) =>
        i === index ? value : instruction
      )
    }));
  };

  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const handleDietaryToggle = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(preference)
        ? prev.dietary_preferences.filter(p => p !== preference)
        : [...prev.dietary_preferences, preference]
    }));
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setSelectedImage(recipe.images?.[0] || null);
    setFormData({
      name: recipe.name,
      description: recipe.description || "",
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      servings: recipe.servings,
      serving_size_grams: recipe.serving_size_grams || 100,
      serving_size_unit: recipe.serving_size_unit,
      total_grams: recipe.total_grams || 100,
      calories_per_serving: recipe.calories_per_serving,
      protein_per_serving: recipe.protein_per_serving,
      carbs_per_serving: recipe.carbs_per_serving,
      fat_per_serving: recipe.fat_per_serving,
      fiber_per_serving: recipe.fiber_per_serving || 0,
      sugar_per_serving: recipe.sugar_per_serving || 0,
      sodium_per_serving: recipe.sodium_per_serving || 0,
      images: recipe.images || [],
      videos: recipe.videos || [],
      category: recipe.category,
      cuisine_type: recipe.cuisine_type || "",
      difficulty_level: recipe.difficulty_level || "easy",
      prep_time_minutes: recipe.prep_time_minutes || 0,
      cook_time_minutes: recipe.cook_time_minutes || 0,
      total_time_minutes: recipe.total_time_minutes || 0,
      tags: recipe.tags || [],
      allergens: recipe.allergens || [],
      dietary_preferences: recipe.dietary_preferences || [],
      is_public: recipe.is_public !== false
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (recipeId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази рецепта?")) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Грешка при изтриване на рецептата");
      }

      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Грешка при изтриване на рецептата");
    }
  };

  const canEdit = (recipe: Recipe) => {
    return userRole === "trainer" && recipe.created_by === userId;
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailDialogOpen(true);
  };

  const filteredAndSortedRecipes = () => {
    let filtered = recipes;

    if (searchTerm.trim()) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    if (userRole === "trainer") {
      return filtered.sort((a, b) => {
        if (a.created_by === userId && b.created_by !== userId) return -1;
        if (a.created_by !== userId && b.created_by === userId) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Основна информация</h3>

        {/* Image Upload */}
        <div>
          <Label>Снимка на рецептата</Label>
          <div className="mt-2">
            {selectedImage ? (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Рецепта"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="recipe-image" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Качете снимка
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG до 10MB
                      </span>
                    </label>
                    <input
                      id="recipe-image"
                      name="recipe-image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            alert('Файлът е твърде голям. Максимум 10MB.');
                            return;
                          }
                          handleImageUpload(file);
                        }
                      }}
                      disabled={isUploadingImage}
                    />
                  </div>
                  {isUploadingImage && (
                    <div className="mt-2">
                      <div className="text-sm text-gray-600">Качване...</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="name">Име на рецептата *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Например: Пилешко къри с ориз"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Кратко описание на рецептата..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Категория *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECIPE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="difficulty">Сложност</Label>
            <Select
              value={formData.difficulty_level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: value }))}
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
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Съставки</h3>
          <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
            <Plus className="h-4 w-4 mr-1" />
            Добави съставка
          </Button>
        </div>

        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder="Съставка"
              value={ingredient.name}
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="Количество"
              value={ingredient.amount}
              onChange={(e) => updateIngredient(index, 'amount', Number(e.target.value))}
              className="w-24"
            />
            <Select
              value={ingredient.unit}
              onValueChange={(value) => updateIngredient(index, 'unit', value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVING_UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.ingredients.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(index)}
                className="p-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Стъпки за приготвяне</h3>
          <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
            <Plus className="h-4 w-4 mr-1" />
            Добави стъпка
          </Button>
        </div>

        {formData.instructions.map((instruction, index) => (
          <div key={index} className="flex gap-2 items-start">
            <span className="text-sm font-medium text-gray-500 mt-3 min-w-[2rem]">
              {index + 1}.
            </span>
            <Textarea
              placeholder="Опишете стъпката..."
              value={instruction}
              onChange={(e) => updateInstruction(index, e.target.value)}
              className="flex-1"
              rows={2}
            />
            {formData.instructions.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInstruction(index)}
                className="p-2 mt-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Serving Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Информация за порциите</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="servings">Брой порции</Label>
            <Input
              id="servings"
              type="number"
              min="1"
              value={formData.servings}
              onChange={(e) => setFormData(prev => ({ ...prev, servings: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="serving_size">Размер на порция</Label>
            <Input
              id="serving_size"
              type="number"
              min="1"
              value={formData.serving_size_grams}
              onChange={(e) => setFormData(prev => ({ ...prev, serving_size_grams: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="serving_unit">Мярка</Label>
            <Select
              value={formData.serving_size_unit}
              onValueChange={(value) => setFormData(prev => ({ ...prev, serving_size_unit: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVING_UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Nutrition per serving */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Хранителни стойности (на порция)</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calories">Калории *</Label>
            <Input
              id="calories"
              type="number"
              min="0"
              value={formData.calories_per_serving}
              onChange={(e) => setFormData(prev => ({ ...prev, calories_per_serving: Number(e.target.value) }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="protein">Протеини (г)</Label>
            <Input
              id="protein"
              type="number"
              min="0"
              step="0.1"
              value={formData.protein_per_serving}
              onChange={(e) => setFormData(prev => ({ ...prev, protein_per_serving: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="carbs">Въглехидрати (г)</Label>
            <Input
              id="carbs"
              type="number"
              min="0"
              step="0.1"
              value={formData.carbs_per_serving}
              onChange={(e) => setFormData(prev => ({ ...prev, carbs_per_serving: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="fat">Мазнини (г)</Label>
            <Input
              id="fat"
              type="number"
              min="0"
              step="0.1"
              value={formData.fat_per_serving}
              onChange={(e) => setFormData(prev => ({ ...prev, fat_per_serving: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="fiber">Фибри (г)</Label>
            <Input
              id="fiber"
              type="number"
              min="0"
              step="0.1"
              value={formData.fiber_per_serving}
              onChange={(e) => setFormData(prev => ({ ...prev, fiber_per_serving: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="sugar">Захари (г)</Label>
            <Input
              id="sugar"
              type="number"
              min="0"
              step="0.1"
              value={formData.sugar_per_serving}
              onChange={(e) => setFormData(prev => ({ ...prev, sugar_per_serving: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="sodium">Натрий (мг)</Label>
            <Input
              id="sodium"
              type="number"
              min="0"
              step="0.1"
              value={formData.sodium_per_serving}
              onChange={(e) => setFormData(prev => ({ ...prev, sodium_per_serving: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Време за приготвяне</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="prep_time">Подготовка (мин)</Label>
            <Input
              id="prep_time"
              type="number"
              min="0"
              value={formData.prep_time_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, prep_time_minutes: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="cook_time">Готвене (мин)</Label>
            <Input
              id="cook_time"
              type="number"
              min="0"
              value={formData.cook_time_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, cook_time_minutes: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="total_time">Общо време (мин)</Label>
            <Input
              id="total_time"
              type="number"
              min="0"
              value={formData.total_time_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, total_time_minutes: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      {/* Media Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Снимки и видео</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload
            label="Снимки"
            description="Качете снимки на рецептата (максимум 10MB на файл)"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple={true}
            currentFiles={formData.images}
            onFileChange={(files) => setFormData(prev => ({ ...prev, images: files }))}
          />

          <FileUpload
            label="Видео"
            description="Качете видео с приготвянето (максимум 50MB на файл)"
            accept="video/mp4,video/webm,video/quicktime"
            multiple={true}
            currentFiles={formData.videos}
            onFileChange={(files) => setFormData(prev => ({ ...prev, videos: files }))}
          />
        </div>
      </div>

      {/* Allergens */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Алергени</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGENS.map((allergen) => (
            <button
              key={allergen}
              type="button"
              onClick={() => handleAllergenToggle(allergen)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                formData.allergens.includes(allergen)
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {allergen}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Диетични предпочитания</h3>
        <div className="flex flex-wrap gap-2">
          {DIETARY_PREFERENCES.map((preference) => (
            <button
              key={preference}
              type="button"
              onClick={() => handleDietaryToggle(preference)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                formData.dietary_preferences.includes(preference)
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {preference}
            </button>
          ))}
        </div>
      </div>

      {/* Submit buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingRecipe(null);
            resetForm();
          }}
        >
          Отказ
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? (editingRecipe ? "Запазване..." : "Създаване...")
            : (editingRecipe ? "Запази промените" : "Създай рецепта")
          }
        </Button>
      </div>
    </form>
  );

  if (userRole !== "trainer") {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header for clients */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Рецепти</h1>
          <p className="text-gray-600">Рецепти от вашия треньор</p>
        </div>

        {/* Category Filters for clients */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap mb-4">
            {FILTER_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="text-base">{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Търсене по име..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedRecipes().length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ChefHat className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Няма рецепти</h3>
                  <p className="text-gray-600 text-center">
                    Вашият треньор още не е добавил рецепти.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredAndSortedRecipes().map((recipe) => (
              <Card
                key={recipe.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleRecipeClick(recipe)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{recipe.name}</CardTitle>
                      {recipe.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {RECIPE_CATEGORIES.find(c => c.value === recipe.category)?.label}
                        </Badge>
                        {recipe.difficulty_level && (
                          <Badge variant="outline">
                            {DIFFICULTY_LEVELS.find(d => d.value === recipe.difficulty_level)?.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {recipe.total_time_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{recipe.total_time_minutes} мин</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{recipe.servings} порции</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">{recipe.calories_per_serving} kcal</span>
                      <span className="text-gray-600"> на порция</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-medium text-blue-700">{recipe.protein_per_serving}г</div>
                        <div className="text-blue-600">Протеин</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-medium text-green-700">{recipe.carbs_per_serving}г</div>
                        <div className="text-green-600">Въглехидрати</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="font-medium text-yellow-700">{recipe.fat_per_serving}г</div>
                        <div className="text-yellow-600">Мазнини</div>
                      </div>
                    </div>
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
          <h1 className="text-2xl font-bold text-foreground">Рецепти</h1>
          <p className="text-gray-600">Създавайте и управлявайте вашите рецепти</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Нова рецепта
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Създаване на нова рецепта</DialogTitle>
            </DialogHeader>
            {renderForm()}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактиране на рецепта</DialogTitle>
            </DialogHeader>
            {renderForm()}
          </DialogContent>
        </Dialog>

        {/* Recipe Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                {selectedRecipe?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedRecipe && (
              <div className="space-y-6">
                {/* Media Gallery */}
                {(selectedRecipe.images?.length > 0 || selectedRecipe.videos?.length > 0) && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">Снимки и видео</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedRecipe.images?.map((imageUrl, index) => (
                        <div key={`image-${index}`} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`${selectedRecipe.name} - снимка ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                        </div>
                      ))}
                      {selectedRecipe.videos?.map((videoUrl, index) => (
                        <div key={`video-${index}`} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <video
                            src={videoUrl}
                            className="w-full h-full object-cover"
                            controls
                            preload="metadata"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nutrition cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedRecipe.calories_per_serving}</div>
                    <div className="text-sm text-gray-600">Calories</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{selectedRecipe.protein_per_serving}g</div>
                    <div className="text-sm text-blue-600">Protein</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{selectedRecipe.carbs_per_serving}g</div>
                    <div className="text-sm text-green-600">Carbs</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">{selectedRecipe.fat_per_serving}g</div>
                    <div className="text-sm text-yellow-600">Fat</div>
                  </div>
                </div>

                {/* Recipe Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">Основна информация</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Категория:</span>
                        <Badge variant="secondary">
                          {RECIPE_CATEGORIES.find(c => c.value === selectedRecipe.category)?.label}
                        </Badge>
                      </div>
                      {selectedRecipe.difficulty_level && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Сложност:</span>
                          <Badge variant="outline">
                            {DIFFICULTY_LEVELS.find(d => d.value === selectedRecipe.difficulty_level)?.label}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Порции:</span>
                        <span className="text-sm font-medium">{selectedRecipe.servings}</span>
                      </div>
                      {selectedRecipe.total_time_minutes && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Общо време:</span>
                          <span className="text-sm font-medium">{selectedRecipe.total_time_minutes} мин</span>
                        </div>
                      )}
                      {selectedRecipe.prep_time_minutes && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 ml-6">Подготовка:</span>
                          <span className="text-sm font-medium">{selectedRecipe.prep_time_minutes} мин</span>
                        </div>
                      )}
                      {selectedRecipe.cook_time_minutes && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 ml-6">Готвене:</span>
                          <span className="text-sm font-medium">{selectedRecipe.cook_time_minutes} мин</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nutrition details */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">Детайлна хранителна стойност</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-700">Калории:</span>
                        <span className="font-semibold">{selectedRecipe.calories_per_serving} kcal</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-700">Протеини:</span>
                        <span className="font-semibold text-blue-700">{selectedRecipe.protein_per_serving}г</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-700">Въглехидрати:</span>
                        <span className="font-semibold text-green-700">{selectedRecipe.carbs_per_serving}г</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-700">Мазнини:</span>
                        <span className="font-semibold text-yellow-700">{selectedRecipe.fat_per_serving}г</span>
                      </div>
                      {selectedRecipe.fiber_per_serving && selectedRecipe.fiber_per_serving > 0 && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-700">Фибри:</span>
                          <span className="font-semibold">{selectedRecipe.fiber_per_serving}г</span>
                        </div>
                      )}
                      {selectedRecipe.sodium_per_serving && selectedRecipe.sodium_per_serving > 0 && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-700">Натрий:</span>
                          <span className="font-semibold">{selectedRecipe.sodium_per_serving}мг</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedRecipe.description && (
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">Описание</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedRecipe.description}</p>
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-3">Съставки</h4>
                  <div className="grid gap-3">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-800 font-medium">{ingredient.name}</span>
                        <span className="text-gray-600 font-semibold">{ingredient.amount} {ingredient.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-3">Стъпки за приготвяне</h4>
                  <div className="space-y-4">
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed flex-1 pt-1">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergens & Dietary Preferences */}
                {(selectedRecipe.allergens?.length || selectedRecipe.dietary_preferences?.length) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedRecipe.allergens && selectedRecipe.allergens.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-lg text-gray-800 mb-3">Алергени</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecipe.allergens.map((allergen, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRecipe.dietary_preferences && selectedRecipe.dietary_preferences.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-lg text-gray-800 mb-3">Диетични предпочитания</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecipe.dietary_preferences.map((preference, index) => (
                            <Badge key={index} variant="default" className="text-xs bg-green-100 text-green-800">
                              {preference}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions for trainers */}
                {canEdit(selectedRecipe) && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="default"
                      onClick={() => {
                        handleEdit(selectedRecipe);
                        setIsDetailDialogOpen(false);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Редактирай
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDelete(selectedRecipe.id);
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

      {/* Category Filters */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap mb-4">
          {FILTER_CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.value
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="text-base">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Търсене по име..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredAndSortedRecipes().length === 0 ? (
        <div className="col-span-full">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ChefHat className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? "Няма намерени рецепти" : "Няма рецепти"}
              </h3>
              <p className="text-gray-600 text-center">
                {searchTerm
                  ? "Опитайте с друго търсене."
                  : "Създайте първата си рецепта, за да започнете да изграждате колекция."
                }
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Own Recipes Section */}
          {filteredAndSortedRecipes().some(recipe => recipe.created_by === userId) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <ChefHat className="h-5 w-5 mr-2" />
                Моите рецепти
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedRecipes()
                  .filter(recipe => recipe.created_by === userId)
                  .map((recipe) => (
                    <Card
                      key={recipe.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleRecipeClick(recipe)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{recipe.name}</CardTitle>
                            {recipe.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                {RECIPE_CATEGORIES.find(c => c.value === recipe.category)?.label}
                              </Badge>
                              <Badge variant="default" className="text-xs">
                                Собствена
                              </Badge>
                            </div>
                          </div>

                          {canEdit(recipe) && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(recipe);
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
                                  handleDelete(recipe.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {recipe.total_time_minutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{recipe.total_time_minutes} мин</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{recipe.servings} порции</span>
                            </div>
                          </div>

                          <div className="text-sm">
                            <span className="font-medium">{recipe.calories_per_serving} kcal</span>
                            <span className="text-gray-600"> на порция</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <div className="font-medium text-blue-700">{recipe.protein_per_serving}г</div>
                              <div className="text-blue-600">Протеин</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <div className="font-medium text-green-700">{recipe.carbs_per_serving}г</div>
                              <div className="text-green-600">Въглехидрати</div>
                            </div>
                            <div className="text-center p-2 bg-yellow-50 rounded">
                              <div className="font-medium text-yellow-700">{recipe.fat_per_serving}г</div>
                              <div className="text-yellow-600">Мазнини</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Public Recipes Section */}
          {filteredAndSortedRecipes().some(recipe => recipe.created_by !== userId) && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <ChefHat className="h-5 w-5 mr-2" />
                Общи рецепти
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedRecipes()
                  .filter(recipe => recipe.created_by !== userId)
                  .map((recipe) => (
                    <Card
                      key={recipe.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleRecipeClick(recipe)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{recipe.name}</CardTitle>
                            {recipe.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                {RECIPE_CATEGORIES.find(c => c.value === recipe.category)?.label}
                              </Badge>
                              {recipe.is_verified && (
                                <Badge variant="default" className="text-xs">
                                  Проверена
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {recipe.total_time_minutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{recipe.total_time_minutes} мин</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{recipe.servings} порции</span>
                            </div>
                          </div>

                          <div className="text-sm">
                            <span className="font-medium">{recipe.calories_per_serving} kcal</span>
                            <span className="text-gray-600"> на порция</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <div className="font-medium text-blue-700">{recipe.protein_per_serving}г</div>
                              <div className="text-blue-600">Протеин</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <div className="font-medium text-green-700">{recipe.carbs_per_serving}г</div>
                              <div className="text-green-600">Въглехидрати</div>
                            </div>
                            <div className="text-center p-2 bg-yellow-50 rounded">
                              <div className="font-medium text-yellow-700">{recipe.fat_per_serving}г</div>
                              <div className="text-yellow-600">Мазнини</div>
                            </div>
                          </div>
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