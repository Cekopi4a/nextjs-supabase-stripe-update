"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Apple, Edit, Trash2, Search, Upload, X, ImageIcon } from "lucide-react";

interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  sodium_per_100g?: number;
  category: string;
  allergens?: string[];
  is_verified?: boolean;
  created_by?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface FoodsPageClientProps {
  initialFoods: Food[];
  userRole: "trainer" | "client";
  userId: string;
}

const FOOD_CATEGORIES = [
  { value: "protein", label: "Протеини" },
  { value: "carbs", label: "Въглехидрати" },
  { value: "fats", label: "Мазнини" },
  { value: "vegetables", label: "Зеленчуци" },
  { value: "fruits", label: "Плодове" },
  { value: "dairy", label: "Млечни продукти" },
  { value: "beverages", label: "Напитки" },
  { value: "snacks", label: "Закуски" },
  { value: "grains", label: "Зърнени храни" },
  { value: "legumes", label: "Бобови растения" }
];

const COMMON_ALLERGENS = [
  "Глутен", "Лактоза", "Яйца", "Риба", "Ракообразни", "Ядки", "Арахис", "Соя", "Целина", "Синап", "Сусам", "Сулфити"
];

export default function FoodsPageClient({
  initialFoods,
  userRole,
  userId
}: FoodsPageClientProps) {
  // Използваме един и същ Collator като на сървъра, за да избегнем hydration разминавания
  const collator = useMemo(() => new Intl.Collator("bg", {
    sensitivity: "base",
    usage: "sort",
    numeric: true,
    ignorePunctuation: true,
  }), []);
  const [foods, setFoods] = useState<Food[]>(initialFoods);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedGrams, setSelectedGrams] = useState(100);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    barcode: "",
    calories_per_100g: 0,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fat_per_100g: 0,
    fiber_per_100g: 0,
    sugar_per_100g: 0,
    sodium_per_100g: 0,
    category: "protein",
    allergens: [] as string[],
    image_url: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isEditing = editingFood !== null;
      let imageUrl = formData.image_url;

      // Upload image if a new file is selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload/food-image', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Грешка при качване на снимката');
        }

        const { url } = await uploadResponse.json();
        imageUrl = url;
      }

      const url = isEditing ? `/api/foods/${editingFood.id}` : "/api/foods";
      const method = isEditing ? "PUT" : "POST";

      // Ensure numeric fields are valid numbers
      const sanitizedData = {
        ...formData,
        calories_per_100g: Number(formData.calories_per_100g) || 0,
        protein_per_100g: Number(formData.protein_per_100g) || 0,
        carbs_per_100g: Number(formData.carbs_per_100g) || 0,
        fat_per_100g: Number(formData.fat_per_100g) || 0,
        fiber_per_100g: Number(formData.fiber_per_100g) || 0,
        sugar_per_100g: Number(formData.sugar_per_100g) || 0,
        sodium_per_100g: Number(formData.sodium_per_100g) || 0,
        image_url: imageUrl,
      };

      console.log('Sending data:', sanitizedData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || (isEditing ? "Грешка при редактиране на храната" : "Грешка при създаване на храната"));
      }

      const updatedFood = await response.json();

      if (isEditing) {
        setFoods(foods.map(food => food.id === editingFood.id ? updatedFood : food));
        setIsEditDialogOpen(false);
        setEditingFood(null);
      } else {
        setFoods([updatedFood, ...foods]);
        setIsCreateDialogOpen(false);
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error saving food:", error);
      alert(editingFood ? "Грешка при редактиране на храната" : "Грешка при създаване на храната");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      barcode: "",
      calories_per_100g: 0,
      protein_per_100g: 0,
      carbs_per_100g: 0,
      fat_per_100g: 0,
      fiber_per_100g: 0,
      sugar_per_100g: 0,
      sodium_per_100g: 0,
      category: "protein",
      allergens: [],
      image_url: ""
    });
    setImageFile(null);
    setImagePreview("");
  };

  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      brand: food.brand || "",
      barcode: food.barcode || "",
      calories_per_100g: food.calories_per_100g,
      protein_per_100g: food.protein_per_100g,
      carbs_per_100g: food.carbs_per_100g,
      fat_per_100g: food.fat_per_100g,
      fiber_per_100g: food.fiber_per_100g || 0,
      sugar_per_100g: food.sugar_per_100g || 0,
      sodium_per_100g: food.sodium_per_100g || 0,
      category: food.category,
      allergens: food.allergens || [],
      image_url: food.image_url || ""
    });
    setImagePreview(food.image_url || "");
    setImageFile(null);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (foodId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази храна?")) {
      return;
    }

    try {
      const response = await fetch(`/api/foods/${foodId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Грешка при изтриване на храната");
      }

      setFoods(foods.filter(food => food.id !== foodId));
    } catch (error) {
      console.error("Error deleting food:", error);
      alert("Грешка при изтриване на храната");
    }
  };

  const canEdit = (food: Food) => {
    return userRole === "trainer" && food.created_by === userId;
  };

  const handleFoodClick = (food: Food) => {
    setSelectedFood(food);
    setSelectedGrams(100); // Reset to 100g when opening dialog
    setIsDetailDialogOpen(true);
  };

  // Calculate macros based on selected grams
  const calculateMacros = (food: Food, grams: number) => {
    const multiplier = grams / 100;
    return {
      calories: Math.round(food.calories_per_100g * multiplier),
      protein: +(food.protein_per_100g * multiplier).toFixed(1),
      carbs: +(food.carbs_per_100g * multiplier).toFixed(1),
      fat: +(food.fat_per_100g * multiplier).toFixed(1),
      fiber: food.fiber_per_100g ? +(food.fiber_per_100g * multiplier).toFixed(1) : 0,
      sugar: food.sugar_per_100g ? +(food.sugar_per_100g * multiplier).toFixed(1) : 0,
      sodium: food.sodium_per_100g ? Math.round(food.sodium_per_100g * multiplier) : 0,
    };
  };

  // Filter and sort foods with useMemo for stable rendering
  const filteredAndSortedFoods = useMemo(() => {
    let filtered = foods;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = foods.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (food.brand && food.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort: own foods first (for trainers), then alphabetically
    if (userRole === "trainer") {
      return [...filtered].sort((a, b) => {
        // First, sort by ownership (own foods first)
        if (a.created_by === userId && b.created_by !== userId) return -1;
        if (a.created_by !== userId && b.created_by === userId) return 1;

        // Then sort alphabetically
        return collator.compare(a.name, b.name);
      });
    }

    // For clients, just sort alphabetically
    return [...filtered].sort((a, b) => collator.compare(a.name, b.name));
  }, [foods, searchTerm, userRole, userId, collator]);

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Upload */}
      <div>
        <Label>Снимка на храната</Label>
        <div className="mt-2">
          {imagePreview ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 border-muted-foreground/20"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Кликнете за качване</span> или влачете и пуснете
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG или WEBP (MAX. 5MB)</p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="name">Име на храната *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Например: Пилешко филе"
          required
        />
      </div>

      {/* Brand */}
      <div>
        <Label htmlFor="brand">Марка</Label>
        <Input
          id="brand"
          value={formData.brand}
          onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
          placeholder="Например: Дико"
        />
      </div>

      {/* Barcode */}
      <div>
        <Label htmlFor="barcode">Баркод</Label>
        <Input
          id="barcode"
          value={formData.barcode}
          onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
          placeholder="Например: 1234567890123"
        />
      </div>

      {/* Macros per 100g */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="calories">Калории на 100г *</Label>
          <Input
            id="calories"
            type="number"
            min="0"
            value={formData.calories_per_100g}
            onChange={(e) => setFormData(prev => ({ ...prev, calories_per_100g: Number(e.target.value) }))}
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
            value={formData.protein_per_100g}
            onChange={(e) => setFormData(prev => ({ ...prev, protein_per_100g: Number(e.target.value) }))}
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
            value={formData.carbs_per_100g}
            onChange={(e) => setFormData(prev => ({ ...prev, carbs_per_100g: Number(e.target.value) }))}
          />
        </div>
        <div>
          <Label htmlFor="fat">Мазнини (г)</Label>
          <Input
            id="fat"
            type="number"
            min="0"
            step="0.1"
            value={formData.fat_per_100g}
            onChange={(e) => setFormData(prev => ({ ...prev, fat_per_100g: Number(e.target.value) }))}
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
            value={formData.fiber_per_100g}
            onChange={(e) => setFormData(prev => ({ ...prev, fiber_per_100g: Number(e.target.value) }))}
          />
        </div>
        <div>
          <Label htmlFor="sugar">Захари (г)</Label>
          <Input
            id="sugar"
            type="number"
            min="0"
            step="0.1"
            value={formData.sugar_per_100g}
            onChange={(e) => setFormData(prev => ({ ...prev, sugar_per_100g: Number(e.target.value) }))}
          />
        </div>
        <div>
          <Label htmlFor="sodium">Натрий (мг)</Label>
          <Input
            id="sodium"
            type="number"
            min="0"
            step="0.1"
            value={formData.sodium_per_100g}
            onChange={(e) => setFormData(prev => ({ ...prev, sodium_per_100g: Number(e.target.value) }))}
          />
        </div>
      </div>

      {/* Category */}
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
            {FOOD_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Allergens */}
      <div>
        <Label>Алергени</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {COMMON_ALLERGENS.map((allergen) => (
            <button
              key={allergen}
              type="button"
              onClick={() => handleAllergenToggle(allergen)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                formData.allergens.includes(allergen)
                  ? "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {allergen}
            </button>
          ))}
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
            setEditingFood(null);
            resetForm();
          }}
        >
          Отказ
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? (editingFood ? "Запазване..." : "Създаване...")
            : (editingFood ? "Запази промените" : "Създай храна")
          }
        </Button>
      </div>
    </form>
  );

  if (userRole !== "trainer") {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Foods List for clients */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Храни</h1>
          <p className="text-muted-foreground">Храни от вашия треньор</p>
        </div>

        {/* Search Field for clients */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Търсене по име или марка..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedFoods.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Apple className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Няма храни</h3>
                  <p className="text-muted-foreground text-center">
                    Вашият треньор още не е добавил храни.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredAndSortedFoods.map((food) => (
              <Card
                key={food.id}
                className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => handleFoodClick(food)}
              >
                {/* Food Image */}
                {food.image_url ? (
                  <div className="w-full h-48 overflow-hidden bg-muted">
                    <img
                      src={food.image_url}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{food.name}</CardTitle>
                      {food.brand && (
                        <p className="text-sm text-muted-foreground truncate">{food.brand}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {FOOD_CATEGORIES.find(c => c.value === food.category)?.label}
                        </Badge>
                        {food.is_verified && (
                          <Badge variant="default" className="text-xs">
                            Проверена
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">{food.calories_per_100g} kcal</span>
                      <span className="text-muted-foreground"> на 100г</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                        <div className="font-medium text-blue-700 dark:text-blue-400">{food.protein_per_100g}г</div>
                        <div className="text-blue-600 dark:text-blue-300">Протеин</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded">
                        <div className="font-medium text-green-700 dark:text-green-400">{food.carbs_per_100g}г</div>
                        <div className="text-green-600 dark:text-green-300">Въглехидрати</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded">
                        <div className="font-medium text-yellow-700 dark:text-yellow-400">{food.fat_per_100g}г</div>
                        <div className="text-yellow-600 dark:text-yellow-300">Мазнини</div>
                      </div>
                    </div>

                    {food.allergens && food.allergens.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Алергени:</p>
                        <div className="flex flex-wrap gap-1">
                          {food.allergens.slice(0, 3).map((allergen, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {allergen}
                            </Badge>
                          ))}
                          {food.allergens.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{food.allergens.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
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
          <h1 className="text-2xl font-bold text-foreground">Храни</h1>
          <p className="text-muted-foreground">Създавайте и управлявайте вашите храни</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Нова храна
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Създаване на нова храна</DialogTitle>
            </DialogHeader>

            {renderForm()}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактиране на храна</DialogTitle>
            </DialogHeader>

            {renderForm()}
          </DialogContent>
        </Dialog>

        {/* Food Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl h-[85vh] overflow-hidden p-0 bg-background flex flex-col">
            <DialogTitle className="sr-only">
              {selectedFood?.name} - Детайли за храната
            </DialogTitle>
            {selectedFood && (
              <>
                {/* Food Image Header - Fixed */}
                {selectedFood.image_url ? (
                  <div className="w-full h-48 overflow-hidden relative flex-shrink-0">
                    <img
                      src={selectedFood.image_url}
                      alt={selectedFood.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6">
                      <h2 className="text-2xl font-bold text-foreground mb-1">{selectedFood.name}</h2>
                      {selectedFood.brand && (
                        <p className="text-sm text-muted-foreground">{selectedFood.brand}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 dark:from-blue-600 dark:via-cyan-600 dark:to-blue-700 flex items-center justify-center relative flex-shrink-0">
                    <Apple className="h-20 w-20 text-white/30" />
                    <div className="absolute bottom-4 left-6 right-6">
                      <h2 className="text-2xl font-bold text-white mb-1">{selectedFood.name}</h2>
                      {selectedFood.brand && (
                        <p className="text-sm text-white/90">{selectedFood.brand}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Content - Scrollable */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                  {/* Portion Size Selector */}
                  <div className="flex items-center justify-center gap-2">
                    {[50, 100, 150, 200].map((grams) => (
                      <button
                        key={grams}
                        onClick={() => setSelectedGrams(grams)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedGrams === grams
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {grams}г
                      </button>
                    ))}
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="9999"
                        value={selectedGrams}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 100;
                          setSelectedGrams(Math.max(1, Math.min(9999, value)));
                        }}
                        className="w-24 text-center font-medium"
                      />
                    </div>
                  </div>

                  {/* Calories Highlight */}
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-100 dark:border-blue-900">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {calculateMacros(selectedFood, selectedGrams).calories}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">калории на {selectedGrams}г</div>
                  </div>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 transition-all hover:scale-105">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {calculateMacros(selectedFood, selectedGrams).protein}г
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 font-medium">Протеини</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {Math.round((calculateMacros(selectedFood, selectedGrams).protein * 4 / calculateMacros(selectedFood, selectedGrams).calories) * 100)}%
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 transition-all hover:scale-105">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {calculateMacros(selectedFood, selectedGrams).carbs}г
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300 mt-1 font-medium">Въглехидрати</div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {Math.round((calculateMacros(selectedFood, selectedGrams).carbs * 4 / calculateMacros(selectedFood, selectedGrams).calories) * 100)}%
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-100 dark:border-yellow-900 transition-all hover:scale-105">
                      <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                        {calculateMacros(selectedFood, selectedGrams).fat}г
                      </div>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 font-medium">Мазнини</div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        {Math.round((calculateMacros(selectedFood, selectedGrams).fat * 9 / calculateMacros(selectedFood, selectedGrams).calories) * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Additional Nutrients */}
                  {(selectedFood.fiber_per_100g || selectedFood.sugar_per_100g || selectedFood.sodium_per_100g) && (
                    <div className="grid grid-cols-3 gap-3">
                      {selectedFood.fiber_per_100g !== null && selectedFood.fiber_per_100g > 0 && (
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-xl font-semibold text-foreground">{calculateMacros(selectedFood, selectedGrams).fiber}г</div>
                          <div className="text-xs text-muted-foreground mt-1">Фибри</div>
                        </div>
                      )}
                      {selectedFood.sugar_per_100g !== null && selectedFood.sugar_per_100g > 0 && (
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-xl font-semibold text-foreground">{calculateMacros(selectedFood, selectedGrams).sugar}г</div>
                          <div className="text-xs text-muted-foreground mt-1">Захари</div>
                        </div>
                      )}
                      {selectedFood.sodium_per_100g !== null && selectedFood.sodium_per_100g > 0 && (
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-xl font-semibold text-foreground">{calculateMacros(selectedFood, selectedGrams).sodium}мг</div>
                          <div className="text-xs text-muted-foreground mt-1">Натрий</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info Section */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Категория</span>
                      <Badge variant="secondary" className="font-medium">
                        {FOOD_CATEGORIES.find(c => c.value === selectedFood.category)?.label}
                      </Badge>
                    </div>
                    {selectedFood.barcode && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Баркод</span>
                        <span className="text-sm font-mono text-foreground">{selectedFood.barcode}</span>
                      </div>
                    )}
                    {selectedFood.created_by && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Тип</span>
                        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Собствена храна</Badge>
                      </div>
                    )}
                    {selectedFood.is_verified && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Статус</span>
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Проверена</Badge>
                      </div>
                    )}
                  </div>

                  {/* Allergens */}
                  {selectedFood.allergens && selectedFood.allergens.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="text-red-600">⚠</span>
                        Алергени
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFood.allergens.map((allergen, index) => (
                          <Badge key={index} variant="destructive" className="px-3 py-1">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions for trainers */}
                  {canEdit(selectedFood) && (
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          handleEdit(selectedFood);
                          setIsDetailDialogOpen(false);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Редактирай
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleDelete(selectedFood.id);
                          setIsDetailDialogOpen(false);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Изтрий
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Field for trainers */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Търсене по име или марка..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Foods Sections */}
      {filteredAndSortedFoods.length === 0 ? (
        <div className="col-span-full">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Apple className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? "Няма намерени храни" : "Няма храни"}
              </h3>
              <p className="text-muted-foreground text-center">
                {searchTerm
                  ? "Опитайте с друго търсене."
                  : "Създайте първата си храна, за да започнете да изграждате библиотека."
                }
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Own Foods Section */}
          {filteredAndSortedFoods.some(food => food.created_by === userId) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Apple className="h-5 w-5 mr-2" />
                Моите храни
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedFoods
                  .filter(food => food.created_by === userId)
                  .map((food) => (
            <Card
              key={food.id}
              className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              onClick={() => handleFoodClick(food)}
            >
              {/* Food Image */}
              {food.image_url ? (
                <div className="w-full h-48 overflow-hidden bg-muted">
                  <img
                    src={food.image_url}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{food.name}</CardTitle>
                    {food.brand && (
                      <p className="text-sm text-muted-foreground truncate">{food.brand}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {FOOD_CATEGORIES.find(c => c.value === food.category)?.label}
                      </Badge>
                      {food.created_by && (
                        <Badge variant="default" className="text-xs">
                          Собствена
                        </Badge>
                      )}
                      {food.is_verified && (
                        <Badge variant="default" className="text-xs">
                          Проверена
                        </Badge>
                      )}
                    </div>
                  </div>

                  {canEdit(food) && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(food);
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
                          handleDelete(food.id);
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
                  <div className="text-sm">
                    <span className="font-medium">{food.calories_per_100g} kcal</span>
                    <span className="text-muted-foreground"> на 100г</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                      <div className="font-medium text-blue-700 dark:text-blue-400">{food.protein_per_100g}г</div>
                      <div className="text-blue-600 dark:text-blue-300">Протеин</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded">
                      <div className="font-medium text-green-700 dark:text-green-400">{food.carbs_per_100g}г</div>
                      <div className="text-green-600 dark:text-green-300">Въглехидрати</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded">
                      <div className="font-medium text-yellow-700 dark:text-yellow-400">{food.fat_per_100g}г</div>
                      <div className="text-yellow-600 dark:text-yellow-300">Мазнини</div>
                    </div>
                  </div>

                  {food.allergens && food.allergens.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Алергени:</p>
                      <div className="flex flex-wrap gap-1">
                        {food.allergens.slice(0, 3).map((allergen, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                        {food.allergens.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{food.allergens.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Global Foods Section */}
          {filteredAndSortedFoods.some(food => !food.created_by) && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Apple className="h-5 w-5 mr-2" />
                Общи храни
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedFoods
                  .filter(food => !food.created_by)
                  .map((food) => (
            <Card
              key={food.id}
              className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              onClick={() => handleFoodClick(food)}
            >
              {/* Food Image */}
              {food.image_url ? (
                <div className="w-full h-48 overflow-hidden bg-muted">
                  <img
                    src={food.image_url}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{food.name}</CardTitle>
                    {food.brand && (
                      <p className="text-sm text-muted-foreground truncate">{food.brand}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {FOOD_CATEGORIES.find(c => c.value === food.category)?.label}
                      </Badge>
                      {food.is_verified && (
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
                  <div className="text-sm">
                    <span className="font-medium">{food.calories_per_100g} kcal</span>
                    <span className="text-muted-foreground"> на 100г</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                      <div className="font-medium text-blue-700 dark:text-blue-400">{food.protein_per_100g}г</div>
                      <div className="text-blue-600 dark:text-blue-300">Протеин</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded">
                      <div className="font-medium text-green-700 dark:text-green-400">{food.carbs_per_100g}г</div>
                      <div className="text-green-600 dark:text-green-300">Въглехидрати</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded">
                      <div className="font-medium text-yellow-700 dark:text-yellow-400">{food.fat_per_100g}г</div>
                      <div className="text-yellow-600 dark:text-yellow-300">Мазнини</div>
                    </div>
                  </div>

                  {food.allergens && food.allergens.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Алергени:</p>
                      <div className="flex flex-wrap gap-1">
                        {food.allergens.slice(0, 3).map((allergen, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                        {food.allergens.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{food.allergens.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
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