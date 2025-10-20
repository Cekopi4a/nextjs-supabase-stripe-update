// app/protected/nutrition/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FoodSearch from "@/components/ui/food-search";
import RecipeSearch from "@/components/ui/recipe-search";
import {
  ChevronLeft,
  ChevronRight,
  Apple,
  Coffee,
  UtensilsCrossed,
  Sunset,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle2,
  ChefHat,
  Users
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { dateToLocalDateString } from "@/utils/date-utils";

interface MealPlan {
  id: string;
  meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  meal_name: string;
  scheduled_date: string;
  client_id: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  notes?: string;
  status: 'planned' | 'completed' | 'skipped';
}

interface Food {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  category: string;
}

interface Recipe {
  id: string;
  name: string;
  description?: string;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  category: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes?: number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  meals: MealPlan[];
}

const MEAL_TYPES = [
  {
    value: 'breakfast',
    label: 'Закуска',
    icon: Coffee,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    time: '08:00'
  },
  {
    value: 'morning_snack',
    label: 'Сутрешен снакс',
    icon: Apple,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    time: '10:00'
  },
  {
    value: 'lunch',
    label: 'Обяд',
    icon: UtensilsCrossed,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    time: '13:00'
  },
  {
    value: 'afternoon_snack',
    label: 'Следобеден снакс',
    icon: Apple,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    time: '16:00'
  },
  {
    value: 'dinner',
    label: 'Вечеря',
    icon: Sunset,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    time: '19:00'
  },
  {
    value: 'evening_snack',
    label: 'Вечерен снакс',
    icon: Apple,
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    time: '21:00'
  }
];

const BULGARIAN_MONTHS = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];

const BULGARIAN_DAYS = ["Нед", "Пон", "Вто", "Сря", "Чет", "Пет", "Съб"];

export default function TrainerPersonalNutritionPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  const [userId, setUserId] = useState<string | null>(null);

  // Form states
  const [mealForm, setMealForm] = useState({
    meal_name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    notes: ''
  });
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [recipeServings, setRecipeServings] = useState(1);

  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMeals();
    }
  }, [currentDate, userId]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, meals]);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const fetchMeals = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      // Get start and end of month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const startDate = dateToLocalDateString(startOfMonth);
      const endDate = dateToLocalDateString(endOfMonth);

      // Get trainer's personal meals (where they are the client)
      const { data: dailyMeals, error: mealsError } = await supabase
        .from("daily_meals")
        .select("*")
        .eq("client_id", userId)
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate)
        .order("scheduled_date", { ascending: true });

      if (mealsError) throw mealsError;

      // Transform to match component format
      const transformedMeals: MealPlan[] = (dailyMeals || []).map(meal => ({
        id: meal.id,
        meal_type: meal.meal_type,
        meal_name: meal.meal_name,
        scheduled_date: meal.scheduled_date,
        client_id: meal.client_id,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        notes: meal.notes,
        status: meal.status
      }));

      setMeals(transformedMeals);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days: CalendarDay[] = [];
    const currentDateLoop = new Date(startDate);
    const today = new Date();

    while (currentDateLoop <= endDate) {
      const dateStr = dateToLocalDateString(currentDateLoop);
      const dayMeals = meals.filter(m => m.scheduled_date === dateStr);

      days.push({
        date: new Date(currentDateLoop),
        isCurrentMonth: currentDateLoop.getMonth() === month,
        isToday: currentDateLoop.toDateString() === today.toDateString(),
        meals: dayMeals
      });

      currentDateLoop.setDate(currentDateLoop.getDate() + 1);
    }

    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const openDayModal = (date: Date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  const openAddMealModal = (mealType: string) => {
    setSelectedMealType(mealType);
    setMealForm({
      meal_name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      notes: ''
    });
    setSelectedFood(null);
    setSelectedRecipe(null);
    setQuantity(100);
    setRecipeServings(1);
    setEditingMeal(null);
    setShowAddMealModal(true);
  };

  const openEditModal = (meal: MealPlan) => {
    setEditingMeal(meal);
    setSelectedMealType(meal.meal_type);
    setMealForm({
      meal_name: meal.meal_name,
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fats: meal.fats || 0,
      notes: meal.notes || ''
    });
    setShowAddMealModal(true);
  };

  const saveMeal = async () => {
    if (!selectedDate || !mealForm.meal_name.trim() || !userId) {
      alert("Моля въведете име на ястието");
      return;
    }

    try {
      const mealData = {
        meal_type: selectedMealType,
        meal_name: mealForm.meal_name,
        scheduled_date: dateToLocalDateString(selectedDate),
        client_id: userId,
        calories: mealForm.calories || null,
        protein: mealForm.protein || null,
        carbs: mealForm.carbs || null,
        fats: mealForm.fats || null,
        notes: mealForm.notes || null,
        status: 'planned' as const
      };

      if (editingMeal) {
        // Update existing meal
        const response = await fetch('/api/daily-meals', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingMeal.id,
            ...mealData
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update meal');
        }

        // Update local state
        setMeals(prev => prev.map(m => m.id === editingMeal.id ? {
          ...m,
          ...mealData
        } : m));
      } else {
        // Create new meal
        const response = await fetch('/api/daily-meals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mealData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create meal');
        }

        const result = await response.json();

        // Add to local state
        const newMeal: MealPlan = {
          id: result.meal.id,
          ...mealData
        };
        setMeals(prev => [...prev, newMeal]);
      }

      setShowAddMealModal(false);
      generateCalendarDays();
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Грешка при запазване на ястието");
    }
  };

  const deleteMeal = async (mealId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете това ястие?")) {
      return;
    }

    try {
      const response = await fetch(`/api/daily-meals?id=${mealId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete meal');
      }

      // Remove from local state
      setMeals(prev => prev.filter(m => m.id !== mealId));
      generateCalendarDays();
    } catch (error) {
      console.error("Error deleting meal:", error);
      alert("Грешка при изтриване на ястието");
    }
  };

  const handleFoodSelect = (food: Food) => {
    setSelectedFood(food);
    setMealForm({
      ...mealForm,
      meal_name: food.name,
      calories: Math.round((food.calories_per_100g * quantity) / 100),
      protein: Math.round((food.protein_per_100g * quantity) / 100),
      carbs: Math.round((food.carbs_per_100g * quantity) / 100),
      fats: Math.round((food.fat_per_100g * quantity) / 100)
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    if (selectedFood) {
      setMealForm({
        ...mealForm,
        calories: Math.round((selectedFood.calories_per_100g * newQuantity) / 100),
        protein: Math.round((selectedFood.protein_per_100g * newQuantity) / 100),
        carbs: Math.round((selectedFood.carbs_per_100g * newQuantity) / 100),
        fats: Math.round((selectedFood.fat_per_100g * newQuantity) / 100)
      });
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setSelectedFood(null); // Clear food selection
    const servings = recipeServings;
    setMealForm({
      ...mealForm,
      meal_name: recipe.name,
      calories: Math.round(recipe.calories_per_serving * servings),
      protein: Math.round(recipe.protein_per_serving * servings),
      carbs: Math.round(recipe.carbs_per_serving * servings),
      fats: Math.round(recipe.fat_per_serving * servings),
      notes: recipe.description || ''
    });
  };

  const handleRecipeServingsChange = (newServings: number) => {
    setRecipeServings(newServings);
    if (selectedRecipe) {
      setMealForm({
        ...mealForm,
        calories: Math.round(selectedRecipe.calories_per_serving * newServings),
        protein: Math.round(selectedRecipe.protein_per_serving * newServings),
        carbs: Math.round(selectedRecipe.carbs_per_serving * newServings),
        fats: Math.round(selectedRecipe.fat_per_serving * newServings)
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold flex items-center">
            <Apple className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600" />
            Моят хранителен календар
          </h1>
          <p className="text-muted-foreground text-sm">
            Планирайте и проследявайте личното си хранене
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Днес
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="default"
              onClick={() => navigateMonth('prev')}
              className="h-10 w-10 p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <h2 className="text-lg sm:text-xl font-bold min-w-[200px] text-center">
              {BULGARIAN_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <Button
              variant="outline"
              size="default"
              onClick={() => navigateMonth('next')}
              className="h-10 w-10 p-0"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
            {MEAL_TYPES.slice(0, 3).map((type) => (
              <Badge key={type.value} className={`${type.color} text-xs whitespace-nowrap px-2 py-1`}>
                <type.icon className="h-3 w-3 mr-1" />
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Week headers */}
          {BULGARIAN_DAYS.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <CalendarDayCell
              key={index}
              day={day}
              onDayClick={openDayModal}
            />
          ))}
        </div>
      </Card>

      {/* Day Modal */}
      {showDayModal && selectedDate && (
        <DayMealsModal
          isOpen={showDayModal}
          selectedDate={selectedDate}
          meals={meals.filter(m => m.scheduled_date === dateToLocalDateString(selectedDate))}
          onClose={() => setShowDayModal(false)}
          onAddMeal={openAddMealModal}
          onEditMeal={openEditModal}
          onDeleteMeal={deleteMeal}
        />
      )}

      {/* Add/Edit Meal Modal */}
      {showAddMealModal && (
        <MealModal
          isOpen={showAddMealModal}
          isEditing={!!editingMeal}
          selectedMealType={selectedMealType}
          mealForm={mealForm}
          setMealForm={setMealForm}
          selectedFood={selectedFood}
          selectedRecipe={selectedRecipe}
          quantity={quantity}
          recipeServings={recipeServings}
          onFoodSelect={handleFoodSelect}
          onRecipeSelect={handleRecipeSelect}
          onQuantityChange={handleQuantityChange}
          onRecipeServingsChange={handleRecipeServingsChange}
          onSave={saveMeal}
          onClose={() => setShowAddMealModal(false)}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )}
    </div>
  );
}

function CalendarDayCell({
  day,
  onDayClick
}: {
  day: CalendarDay;
  onDayClick: (date: Date) => void;
}) {
  const dayNumber = day.date.getDate();

  const totalMeals = day.meals.length;
  const completedMeals = day.meals.filter(m => m.status === 'completed').length;
  const completionRate = totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0;

  return (
    <div
      className={`
        min-h-[100px] sm:min-h-[120px] p-2 border border-border rounded-lg transition-colors hover:bg-muted/30 cursor-pointer
        ${!day.isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''}
        ${day.isToday ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700' : ''}
      `}
      onClick={() => day.isCurrentMonth && onDayClick(day.date)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm sm:text-base font-semibold ${day.isToday ? 'text-green-600 dark:text-green-400' : ''}`}>
          {dayNumber}
        </span>
        {totalMeals > 0 && (
          <div className="text-xs text-muted-foreground">
            {completedMeals}/{totalMeals}
          </div>
        )}
      </div>

      {/* Meal indicators */}
      {totalMeals > 0 && (
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-1">
            {MEAL_TYPES.slice(0, 6).map((mealType) => {
              const hasMeal = day.meals.some(m => m.meal_type === mealType.value);
              const isCompleted = day.meals.some(m => m.meal_type === mealType.value && m.status === 'completed');

              return (
                <div
                  key={mealType.value}
                  className={`
                    h-3 sm:h-4 rounded-sm flex items-center justify-center
                    ${hasMeal
                      ? isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 dark:bg-gray-800'
                    }
                  `}
                >
                  <mealType.icon className="h-1.5 w-1.5 sm:h-2 sm:w-2" />
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div
              className="bg-green-500 h-1 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      )}

      {totalMeals === 0 && day.isCurrentMonth && (
        <div className="text-center text-xs text-muted-foreground mt-4">
          Кликнете за добавяне
        </div>
      )}
    </div>
  );
}

function DayMealsModal({
  isOpen,
  selectedDate,
  meals,
  onClose,
  onAddMeal,
  onEditMeal,
  onDeleteMeal
}: {
  isOpen: boolean;
  selectedDate: Date;
  meals: MealPlan[];
  onClose: () => void;
  onAddMeal: (mealType: string) => void;
  onEditMeal: (meal: MealPlan) => void;
  onDeleteMeal: (mealId: string) => void;
}) {
  if (!isOpen) return null;

  const getMealsByType = (mealType: string) => {
    return meals.filter(meal => meal.meal_type === mealType);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('bg-BG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-semibold flex items-center">
              <Apple className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600" />
              Хранене за {formatDate(selectedDate)}
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {MEAL_TYPES.map((mealType) => {
              const typeMeals = getMealsByType(mealType.value);
              const totalCalories = typeMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
              const totalProtein = typeMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);

              return (
                <Card key={mealType.value} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${mealType.color}`}>
                        <mealType.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">{mealType.label}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{mealType.time}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddMeal(mealType.value)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Добави
                    </Button>
                  </div>

                  {typeMeals.length > 0 && (
                    <div className="mb-3 p-2 bg-muted/30 rounded text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span>Общо: {totalCalories} кал</span>
                        <span>{totalProtein}г протеин</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {typeMeals.map((meal) => (
                      <MealItem
                        key={meal.id}
                        meal={meal}
                        mealType={mealType}
                        onEdit={() => onEditMeal(meal)}
                        onDelete={() => onDeleteMeal(meal.id)}
                      />
                    ))}

                    {typeMeals.length === 0 && (
                      <div className="text-center text-muted-foreground text-xs sm:text-sm py-4 border-2 border-dashed rounded">
                        Няма добавени храни
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Daily totals */}
          {meals.length > 0 && (
            <Card className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <h4 className="font-semibold mb-3 text-green-800 dark:text-green-200">Общо за деня</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">Калории</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {meals.reduce((sum, meal) => sum + (meal.protein || 0), 0)}г
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">Протеини</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0)}г
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">Въглехидрати</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {meals.reduce((sum, meal) => sum + (meal.fats || 0), 0)}г
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">Мазнини</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}

function MealItem({
  meal,
  mealType,
  onEdit,
  onDelete
}: {
  meal: MealPlan;
  mealType: typeof MEAL_TYPES[0];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isCompleted = meal.status === 'completed';
  const isPlanned = meal.status === 'planned';

  return (
    <div
      className={`
        text-xs sm:text-sm p-2 sm:p-3 rounded border cursor-pointer transition-all hover:shadow-sm group
        ${isCompleted ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' :
          isPlanned ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' : 'bg-muted text-muted-foreground'}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {isCompleted ? (
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <mealType.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          )}
          <span className="font-medium truncate">{meal.meal_name}</span>
        </div>

        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {(meal.calories || meal.protein || meal.carbs || meal.fats) && (
        <div className="text-[10px] sm:text-xs opacity-75 grid grid-cols-4 gap-1 sm:gap-2">
          {meal.calories && meal.calories > 0 && <span>{meal.calories} кал</span>}
          {meal.protein && meal.protein > 0 && <span>{meal.protein}г П</span>}
          {meal.carbs && meal.carbs > 0 && <span>{meal.carbs}г В</span>}
          {meal.fats && meal.fats > 0 && <span>{meal.fats}г М</span>}
        </div>
      )}

      {meal.notes && (
        <div className="text-[10px] sm:text-xs mt-2 p-2 bg-muted/30 rounded">
          <strong>Бележки:</strong> {meal.notes}
        </div>
      )}
    </div>
  );
}

function MealModal({
  isOpen,
  isEditing,
  selectedMealType,
  mealForm,
  setMealForm,
  selectedFood,
  selectedRecipe,
  quantity,
  recipeServings,
  onFoodSelect,
  onRecipeSelect,
  onQuantityChange,
  onRecipeServingsChange,
  onSave,
  onClose
}: {
  isOpen: boolean;
  isEditing: boolean;
  selectedMealType: string;
  mealForm: any;
  setMealForm: (form: any) => void;
  selectedFood: Food | null;
  selectedRecipe: Recipe | null;
  quantity: number;
  recipeServings: number;
  onFoodSelect: (food: Food) => void;
  onRecipeSelect: (recipe: Recipe) => void;
  onQuantityChange: (quantity: number) => void;
  onRecipeServingsChange: (servings: number) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const mealType = MEAL_TYPES.find(t => t.value === selectedMealType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-lg my-8">
        <Card className="w-full">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-card z-10 pb-2">
              <div className="flex items-center gap-2">
                {mealType && (
                  <div className={`p-2 rounded-lg ${mealType.color}`}>
                    <mealType.icon className="h-4 w-4" />
                  </div>
                )}
                <h3 className="text-base sm:text-lg font-semibold">
                  {isEditing ? 'Редактирай ястие' : `Добави ${mealType?.label.toLowerCase()}`}
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
            {/* Recipe Search */}
            <div>
              <Label htmlFor="recipe_search">Търсене на рецепта</Label>
              <RecipeSearch
                onRecipeSelect={onRecipeSelect}
                placeholder="Търсете рецепта от базата данни..."
              />
              {selectedRecipe && (
                <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ChefHat className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm sm:text-base">{selectedRecipe.name}</span>
                  </div>
                  {selectedRecipe.description && (
                    <p className="text-xs text-muted-foreground mb-2">{selectedRecipe.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipe_servings" className="text-xs sm:text-sm flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Порции
                      </Label>
                      <Input
                        id="recipe_servings"
                        type="number"
                        value={recipeServings}
                        onChange={(e) => onRecipeServingsChange(parseInt(e.target.value) || 1)}
                        min="1"
                        max="20"
                        className="text-sm"
                      />
                    </div>
                    <div className="pt-6">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {Math.round(selectedRecipe.calories_per_serving * recipeServings)} кал общо
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    П: {Math.round(selectedRecipe.protein_per_serving * recipeServings)}г •
                    В: {Math.round(selectedRecipe.carbs_per_serving * recipeServings)}г •
                    М: {Math.round(selectedRecipe.fat_per_serving * recipeServings)}г
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="text-center text-xs text-muted-foreground py-1">или</div>

            {/* Food Search */}
            <div>
              <Label htmlFor="food_search">Търсене на храна</Label>
              <FoodSearch
                onFoodSelect={onFoodSelect}
                placeholder="Търсете храна от базата данни..."
              />
              {selectedFood && (
                <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm sm:text-base">{selectedFood.name}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {selectedFood.calories_per_100g} кал/100г
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity" className="text-xs sm:text-sm">Количество (г)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => onQuantityChange(parseInt(e.target.value) || 100)}
                        min="1"
                        max="2000"
                        className="text-sm"
                      />
                    </div>
                    <div className="pt-6">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        П: {Math.round((selectedFood.protein_per_100g * quantity) / 100)}г •
                        В: {Math.round((selectedFood.carbs_per_100g * quantity) / 100)}г •
                        М: {Math.round((selectedFood.fat_per_100g * quantity) / 100)}г
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="text-center text-xs text-muted-foreground py-1">или въведете ръчно</div>

            <div>
              <Label htmlFor="meal_name" className="text-xs sm:text-sm">Име на ястието *</Label>
              <Input
                id="meal_name"
                value={mealForm.meal_name || ''}
                onChange={(e) => setMealForm({...mealForm, meal_name: e.target.value})}
                placeholder="Напр: Овесена каша с боровинки"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories" className="text-xs sm:text-sm">Калории</Label>
                <Input
                  id="calories"
                  type="number"
                  value={mealForm.calories || 0}
                  onChange={(e) => setMealForm({...mealForm, calories: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="0"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="protein" className="text-xs sm:text-sm">Протеини (г)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={mealForm.protein || 0}
                  onChange={(e) => setMealForm({...mealForm, protein: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="0"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carbs" className="text-xs sm:text-sm">Въглехидрати (г)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={mealForm.carbs || 0}
                  onChange={(e) => setMealForm({...mealForm, carbs: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="0"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="fats" className="text-xs sm:text-sm">Мазнини (г)</Label>
                <Input
                  id="fats"
                  type="number"
                  value={mealForm.fats || 0}
                  onChange={(e) => setMealForm({...mealForm, fats: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="0"
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs sm:text-sm">Бележки (опционално)</Label>
              <Textarea
                id="notes"
                value={mealForm.notes || ''}
                onChange={(e) => setMealForm({...mealForm, notes: e.target.value})}
                placeholder="Специални инструкции, рецепта..."
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Buttons - Always visible */}
            <div className="flex gap-2 pt-3 sticky bottom-0 bg-card pb-1">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Отказ
              </Button>
              <Button onClick={onSave} className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Запази промените' : 'Добави ястие'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
