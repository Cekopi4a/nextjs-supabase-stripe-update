"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Apple, Edit, Trash2, Search } from "lucide-react";

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
    allergens: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isEditing = editingFood !== null;
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
      allergens: []
    });
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
      allergens: food.allergens || []
    });
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
    setIsDetailDialogOpen(true);
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
                  ? "bg-red-100 text-red-800 border border-red-200"
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
          <p className="text-gray-600">Храни от вашия треньор</p>
        </div>

        {/* Search Field for clients */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                  <Apple className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Няма храни</h3>
                  <p className="text-gray-600 text-center">
                    Вашият треньор още не е добавил храни.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredAndSortedFoods.map((food) => (
              <Card
                key={food.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleFoodClick(food)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{food.name}</CardTitle>
                      {food.brand && (
                        <p className="text-sm text-gray-600">{food.brand}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
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
                      <span className="text-gray-600"> на 100г</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-medium text-blue-700">{food.protein_per_100g}г</div>
                        <div className="text-blue-600">Протеин</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-medium text-green-700">{food.carbs_per_100g}г</div>
                        <div className="text-green-600">Въглехидрати</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="font-medium text-yellow-700">{food.fat_per_100g}г</div>
                        <div className="text-yellow-600">Мазнини</div>
                      </div>
                    </div>

                    {food.allergens && food.allergens.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Алергени:</p>
                        <div className="flex flex-wrap gap-1">
                          {food.allergens.map((allergen, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {allergen}
                            </Badge>
                          ))}
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
          <p className="text-gray-600">Създавайте и управлявайте вашите храни</p>
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                {selectedFood?.name}
                {selectedFood?.brand && <span className="text-gray-600">- {selectedFood.brand}</span>}
              </DialogTitle>
            </DialogHeader>

            {selectedFood && (
              <div className="space-y-6">
                {/* Food Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Информация</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Категория:</span>
                        <Badge variant="secondary">
                          {FOOD_CATEGORIES.find(c => c.value === selectedFood.category)?.label}
                        </Badge>
                      </div>
                      {selectedFood.barcode && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Баркод:</span>
                          <span className="text-sm font-mono">{selectedFood.barcode}</span>
                        </div>
                      )}
                      {selectedFood.created_by && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Тип:</span>
                          <Badge variant="default">Собствена храна</Badge>
                        </div>
                      )}
                      {selectedFood.is_verified && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Статус:</span>
                          <Badge variant="default">Проверена</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Macros */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Хранителни стойности (на 100г)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Калории:</span>
                        <span className="text-sm font-medium">{selectedFood.calories_per_100g} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Протеини:</span>
                        <span className="text-sm font-medium">{selectedFood.protein_per_100g}г</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Въглехидрати:</span>
                        <span className="text-sm font-medium">{selectedFood.carbs_per_100g}г</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Мазнини:</span>
                        <span className="text-sm font-medium">{selectedFood.fat_per_100g}г</span>
                      </div>
                      {selectedFood.fiber_per_100g !== null && selectedFood.fiber_per_100g > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Фибри:</span>
                          <span className="text-sm font-medium">{selectedFood.fiber_per_100g}г</span>
                        </div>
                      )}
                      {selectedFood.sugar_per_100g !== null && selectedFood.sugar_per_100g > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Захари:</span>
                          <span className="text-sm font-medium">{selectedFood.sugar_per_100g}г</span>
                        </div>
                      )}
                      {selectedFood.sodium_per_100g !== null && selectedFood.sodium_per_100g > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Натрий:</span>
                          <span className="text-sm font-medium">{selectedFood.sodium_per_100g}мг</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Allergens */}
                {selectedFood.allergens && selectedFood.allergens.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Алергени</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFood.allergens.map((allergen, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions for trainers */}
                {canEdit(selectedFood) && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="default"
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
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Field for trainers */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
              <Apple className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? "Няма намерени храни" : "Няма храни"}
              </h3>
              <p className="text-gray-600 text-center">
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
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFoodClick(food)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{food.name}</CardTitle>
                    {food.brand && (
                      <p className="text-sm text-gray-600">{food.brand}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
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
                    <div className="flex gap-1">
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
                    <span className="text-gray-600"> на 100г</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-medium text-blue-700">{food.protein_per_100g}г</div>
                      <div className="text-blue-600">Протеин</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-medium text-green-700">{food.carbs_per_100g}г</div>
                      <div className="text-green-600">Въглехидрати</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="font-medium text-yellow-700">{food.fat_per_100g}г</div>
                      <div className="text-yellow-600">Мазнини</div>
                    </div>
                  </div>

                  {food.allergens && food.allergens.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Алергени:</p>
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
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFoodClick(food)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{food.name}</CardTitle>
                    {food.brand && (
                      <p className="text-sm text-gray-600">{food.brand}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
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
                    <span className="text-gray-600"> на 100г</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-medium text-blue-700">{food.protein_per_100g}г</div>
                      <div className="text-blue-600">Протеин</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-medium text-green-700">{food.carbs_per_100g}г</div>
                      <div className="text-green-600">Въглехидрати</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="font-medium text-yellow-700">{food.fat_per_100g}г</div>
                      <div className="text-yellow-600">Мазнини</div>
                    </div>
                  </div>

                  {food.allergens && food.allergens.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Алергени:</p>
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