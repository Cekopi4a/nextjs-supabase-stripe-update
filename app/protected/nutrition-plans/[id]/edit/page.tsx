"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseClient } from "@/utils/supabase/client";
import { dateToLocalDateString } from "@/utils/date-utils";
import FoodSearch from "@/components/ui/food-search";
import RecipeSearch from "@/components/ui/recipe-search";
import { notifyNutritionPlanUpdated } from "@/utils/notifications/create-notification-client";
import {
  ArrowLeft,
  Apple,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Coffee,
  UtensilsCrossed,
  Sunset,
  CheckCircle2,
  ChefHat,
} from "lucide-react";
import Link from "next/link";

interface MealPlan {
  id?: string;
  meal_type: "breakfast" | "morning_snack" | "lunch" | "afternoon_snack" | "dinner" | "evening_snack";
  meal_name: string;
  scheduled_date: string;
  client_id: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  notes?: string;
  status: "planned" | "completed" | "skipped";
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
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  meals: MealPlan[];
}

const MEAL_TYPES = [
  {
    value: "breakfast",
    label: "Закуска",
    icon: Coffee,
    color: "bg-orange-100 text-orange-800",
    time: "08:00",
  },
  {
    value: "morning_snack",
    label: "Сутрешен снакс",
    icon: Apple,
    color: "bg-green-100 text-green-800",
    time: "10:00",
  },
  {
    value: "lunch",
    label: "Обяд",
    icon: UtensilsCrossed,
    color: "bg-blue-100 text-blue-800",
    time: "13:00",
  },
  {
    value: "afternoon_snack",
    label: "Следобеден снакс",
    icon: Apple,
    color: "bg-yellow-100 text-yellow-800",
    time: "16:00",
  },
  {
    value: "dinner",
    label: "Вечеря",
    icon: Sunset,
    color: "bg-purple-100 text-purple-800",
    time: "19:00",
  },
  {
    value: "evening_snack",
    label: "Вечерен снакс",
    icon: Apple,
    color: "bg-pink-100 text-pink-800",
    time: "21:00",
  },
];

const BULGARIAN_MONTHS = [
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември",
];

const BULGARIAN_DAYS = ["Нед", "Пон", "Вто", "Сря", "Чет", "Пет", "Съб"];

export default function EditNutritionPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const supabase = createSupabaseClient();
  const unwrappedParams = React.use(params);
  const planId = unwrappedParams.id;

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  useEffect(() => {
    if (plan) {
      fetchMeals();
    }
  }, [currentDate, plan]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, meals]);

  const fetchPlan = async () => {
    try {
      const { data, error } = await supabase
        .from("nutrition_plans")
        .select(
          `
          *,
          client:profiles!nutrition_plans_client_id_fkey(id, full_name, email)
        `
        )
        .eq("id", planId)
        .single();

      if (error) throw error;
      setPlan(data);
    } catch (error) {
      console.error("Error fetching plan:", error);
      alert("Грешка при зареждане на плана");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeals = async () => {
    if (!plan) return;

    try {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const startDate = dateToLocalDateString(startOfMonth);
      const endDate = dateToLocalDateString(endOfMonth);

      const { data, error } = await supabase
        .from("daily_meals")
        .select("*")
        .eq("client_id", plan.client_id)
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
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
      const dayMeals = meals.filter((m) => m.scheduled_date === dateStr);

      days.push({
        date: new Date(currentDateLoop),
        isCurrentMonth: currentDateLoop.getMonth() === month,
        isToday: currentDateLoop.toDateString() === today.toDateString(),
        meals: dayMeals,
      });

      currentDateLoop.setDate(currentDateLoop.getDate() + 1);
    }

    setCalendarDays(days);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const openDayModal = (date: Date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!plan) {
    return <div>План не е намерен</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/protected/nutrition-plans/${planId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center">
            <Apple className="h-8 w-8 mr-2 text-green-600" />
            Редактиране: {plan.name}
          </h1>
          <p className="text-muted-foreground">
            Клиент: {plan.client.full_name}
          </p>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="text-xl font-semibold">
              {BULGARIAN_MONTHS[currentDate.getMonth()]}{" "}
              {currentDate.getFullYear()}
            </h2>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {MEAL_TYPES.slice(0, 3).map((type) => (
              <Badge key={type.value} className={type.color}>
                <type.icon className="h-3 w-3 mr-1" />
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week headers */}
          {BULGARIAN_DAYS.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
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
          meals={meals.filter(
            (m) => m.scheduled_date === dateToLocalDateString(selectedDate)
          )}
          clientId={plan.client_id}
          plan={plan}
          planId={planId}
          onClose={() => {
            setShowDayModal(false);
            fetchMeals();
          }}
        />
      )}
    </div>
  );
}

function CalendarDayCell({
  day,
  onDayClick,
}: {
  day: CalendarDay;
  onDayClick: (date: Date) => void;
}) {
  const dayNumber = day.date.getDate();
  const totalMeals = day.meals.length;

  return (
    <div
      className={`
        min-h-[100px] p-2 border border-border transition-colors hover:bg-muted/30 cursor-pointer
        ${!day.isCurrentMonth ? "bg-muted/30 text-muted-foreground" : ""}
        ${day.isToday ? "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700" : ""}
      `}
      onClick={() => day.isCurrentMonth && onDayClick(day.date)}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-sm font-medium ${
            day.isToday ? "text-green-600" : ""
          }`}
        >
          {dayNumber}
        </span>
        {totalMeals > 0 && (
          <Badge variant="secondary" className="text-xs">
            {totalMeals}
          </Badge>
        )}
      </div>

      {totalMeals > 0 && (
        <div className="space-y-1">
          {day.meals.slice(0, 2).map((meal) => {
            const mealType = MEAL_TYPES.find((t) => t.value === meal.meal_type);
            return (
              <div
                key={meal.id}
                className="text-xs p-1 bg-blue-50 dark:bg-blue-950 rounded truncate"
              >
                {mealType?.label}: {meal.meal_name}
              </div>
            );
          })}
          {totalMeals > 2 && (
            <div className="text-xs text-muted-foreground text-center">
              +{totalMeals - 2} още
            </div>
          )}
        </div>
      )}

      {totalMeals === 0 && day.isCurrentMonth && (
        <div className="text-center text-xs text-muted-foreground mt-4">
          <Plus className="h-4 w-4 mx-auto mb-1 opacity-50" />
          Добави
        </div>
      )}
    </div>
  );
}

function DayMealsModal({
  isOpen,
  selectedDate,
  meals,
  clientId,
  plan,
  planId,
  onClose,
}: {
  isOpen: boolean;
  selectedDate: Date;
  meals: MealPlan[];
  clientId: string;
  plan: any;
  planId: string;
  onClose: () => void;
}) {
  const supabase = createSupabaseClient();
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');

  const handleSaveMeal = async (meal: MealPlan) => {
    try {
      // Validate meal data
      if (!meal.meal_name || !meal.meal_name.trim()) {
        alert("Моля въведете име на ястието");
        return;
      }

      if (meal.id) {
        // Update existing meal using API
        const response = await fetch('/api/daily-meals', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: meal.id,
            meal_name: meal.meal_name,
            calories: meal.calories || 0,
            protein: meal.protein || 0,
            carbs: meal.carbs || 0,
            fats: meal.fats || 0,
            notes: meal.notes || "",
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update meal');
        }
      } else {
        // Create new meal using API
        const mealData = {
          client_id: clientId,
          meal_type: meal.meal_type,
          meal_name: meal.meal_name,
          scheduled_date: dateToLocalDateString(selectedDate),
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fats: meal.fats || 0,
          notes: meal.notes || "",
          status: "planned",
        };

        console.log("Creating meal with data:", mealData);

        const response = await fetch('/api/daily-meals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mealData),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("API error response:", error);
          throw new Error(error.error || 'Failed to create meal');
        }

        const result = await response.json();
        console.log("Meal created successfully:", result);
      }

      // Send notification to client about nutrition plan update
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: trainerProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          const trainerName = trainerProfile?.full_name || "Вашият треньор";

          await notifyNutritionPlanUpdated(
            clientId,
            plan.name,
            planId,
            trainerName
          );
        }
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
        // Don't fail the meal save if notification fails
      }

      setEditingMeal(null);
      setIsCreating(false);
      setShowAddMealModal(false);
      onClose(); // This will trigger fetchMeals
    } catch (error) {
      console.error("Error saving meal:", error);
      alert(`Грешка при запазване на ястието: ${error instanceof Error ? error.message : 'Неизвестна грешка'}`);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете това ястие?")) return;

    try {
      const response = await fetch(`/api/daily-meals?id=${mealId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete meal');
      }

      onClose();
    } catch (error) {
      console.error("Error deleting meal:", error);
      alert("Грешка при изтриване на ястието");
    }
  };

  const openAddMealModal = (mealType: string) => {
    setSelectedMealType(mealType);
    setEditingMeal({
      meal_type: mealType as any,
      meal_name: "",
      scheduled_date: dateToLocalDateString(selectedDate),
      client_id: clientId,
      status: "planned",
    });
    setShowAddMealModal(true);
  };

  const openEditModal = (meal: MealPlan) => {
    setEditingMeal(meal);
    setSelectedMealType(meal.meal_type);
    setShowAddMealModal(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("bg-BG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center">
                <Apple className="h-6 w-6 mr-2 text-green-600" />
                Хранене за {formatDate(selectedDate)}
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Meals by type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MEAL_TYPES.map((mealType) => {
                const typeMeals = meals.filter(
                  (m) => m.meal_type === mealType.value
                );
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
                          <h4 className="font-semibold">{mealType.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {mealType.time}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAddMealModal(mealType.value)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Добави
                      </Button>
                    </div>

                    {typeMeals.length > 0 && (
                      <div className="mb-3 p-2 bg-muted/30 rounded text-sm">
                        <div className="flex justify-between">
                          <span>Общо: {totalCalories} кал</span>
                          <span>{totalProtein}г протеин</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {typeMeals.map((meal) => (
                        <div
                          key={meal.id}
                          className="text-sm p-3 rounded border bg-card hover:shadow-sm group transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {meal.status === 'completed' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <mealType.icon className="h-4 w-4 flex-shrink-0" />
                              )}
                              <span className="font-medium truncate">{meal.meal_name}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => openEditModal(meal)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteMeal(meal.id!)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {(meal.calories || meal.protein || meal.carbs || meal.fats) && (
                            <div className="text-xs opacity-75 grid grid-cols-4 gap-2">
                              {meal.calories && meal.calories > 0 && <span>{meal.calories} кал</span>}
                              {meal.protein && meal.protein > 0 && <span>{meal.protein}г П</span>}
                              {meal.carbs && meal.carbs > 0 && <span>{meal.carbs}г В</span>}
                              {meal.fats && meal.fats > 0 && <span>{meal.fats}г М</span>}
                            </div>
                          )}
                        </div>
                      ))}

                      {typeMeals.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-4 border-2 border-dashed rounded">
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
                <h4 className="font-semibold mb-3 text-green-800 dark:text-green-100">Общо за деня</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)}
                    </div>
                    <div className="text-muted-foreground">Калории</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {meals.reduce((sum, meal) => sum + (meal.protein || 0), 0)}г
                    </div>
                    <div className="text-muted-foreground">Протеини</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0)}г
                    </div>
                    <div className="text-muted-foreground">Въглехидрати</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {meals.reduce((sum, meal) => sum + (meal.fats || 0), 0)}г
                    </div>
                    <div className="text-muted-foreground">Мазнини</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </Card>
      </div>

      {/* Add/Edit Meal Modal */}
      {showAddMealModal && editingMeal && (
        <MealModal
          isOpen={showAddMealModal}
          isEditing={!!editingMeal.id}
          selectedMealType={selectedMealType}
          meal={editingMeal}
          onSave={handleSaveMeal}
          onClose={() => {
            setShowAddMealModal(false);
            setEditingMeal(null);
          }}
        />
      )}
    </>
  );
}

interface SelectedItem {
  id: string;
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  type: 'food' | 'recipe';
}

function MealModal({
  isOpen,
  isEditing,
  selectedMealType,
  meal,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  isEditing: boolean;
  selectedMealType: string;
  meal: MealPlan;
  onSave: (meal: MealPlan) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(meal);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [recipeServings, setRecipeServings] = useState(1);

  const mealType = MEAL_TYPES.find((t) => t.value === selectedMealType);

  // Calculate totals from selected items
  const calculateTotals = (items: SelectedItem[]) => {
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fats: acc.fats + item.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const handleAddFood = () => {
    if (!selectedFood) return;

    const newItem: SelectedItem = {
      id: `food-${selectedFood.id}-${Date.now()}`,
      name: selectedFood.name,
      quantity: quantity,
      calories: Math.round((selectedFood.calories_per_100g * quantity) / 100),
      protein: Math.round((selectedFood.protein_per_100g * quantity) / 100),
      carbs: Math.round((selectedFood.carbs_per_100g * quantity) / 100),
      fats: Math.round((selectedFood.fat_per_100g * quantity) / 100),
      type: 'food',
    };

    const newItems = [...selectedItems, newItem];
    setSelectedItems(newItems);

    // Update form data with totals and generate meal name
    const totals = calculateTotals(newItems);
    const generatedName = newItems.map(item => item.name).join(', ');
    setFormData({
      ...formData,
      meal_name: generatedName,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
    });

    // Reset selection
    setSelectedFood(null);
    setQuantity(100);
  };

  const handleAddRecipe = () => {
    if (!selectedRecipe) return;

    const newItem: SelectedItem = {
      id: `recipe-${selectedRecipe.id}-${Date.now()}`,
      name: selectedRecipe.name,
      quantity: recipeServings,
      calories: Math.round(selectedRecipe.calories_per_serving * recipeServings),
      protein: Math.round(selectedRecipe.protein_per_serving * recipeServings),
      carbs: Math.round(selectedRecipe.carbs_per_serving * recipeServings),
      fats: Math.round(selectedRecipe.fat_per_serving * recipeServings),
      type: 'recipe',
    };

    const newItems = [...selectedItems, newItem];
    setSelectedItems(newItems);

    // Update form data with totals and generate meal name
    const totals = calculateTotals(newItems);
    const generatedName = newItems.map(item => item.name).join(', ');
    setFormData({
      ...formData,
      meal_name: generatedName,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
    });

    // Reset selection
    setSelectedRecipe(null);
    setRecipeServings(1);
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(newItems);

    // Update form data with new totals and regenerate name
    const totals = calculateTotals(newItems);
    const generatedName = newItems.length > 0 ? newItems.map(item => item.name).join(', ') : '';
    setFormData({
      ...formData,
      meal_name: generatedName,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
    });
  };

  const handleFoodSelect = (food: Food) => {
    setSelectedFood(food);
    setQuantity(100);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setRecipeServings(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {mealType && (
                <div className={`p-2 rounded-lg ${mealType.color}`}>
                  <mealType.icon className="h-4 w-4" />
                </div>
              )}
              <h3 className="text-lg font-semibold">
                {isEditing ? "Редактирай ястие" : `Добави ${mealType?.label.toLowerCase()}`}
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Food Search Section */}
            <div>
              <Label htmlFor="food_search">Търсене на храна</Label>
              <FoodSearch
                onFoodSelect={handleFoodSelect}
                placeholder="Търсете храна от базата данни..."
              />
              {selectedFood && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Apple className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{selectedFood.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedFood.calories_per_100g} кал/100г
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <div>
                      <Label htmlFor="quantity">Количество (г)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 100)}
                        min="1"
                        max="2000"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        П: {Math.round((selectedFood.protein_per_100g * quantity) / 100)}г •
                        В: {Math.round((selectedFood.carbs_per_100g * quantity) / 100)}г •
                        М: {Math.round((selectedFood.fat_per_100g * quantity) / 100)}г
                      </div>
                      <div className="text-sm font-semibold">
                        {Math.round((selectedFood.calories_per_100g * quantity) / 100)} кал
                      </div>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        onClick={handleAddFood}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Добави
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recipe Search Section */}
            <div>
              <Label htmlFor="recipe_search">Търсене на рецепта</Label>
              <RecipeSearch
                onRecipeSelect={handleRecipeSelect}
                placeholder="Търсете рецепта от базата данни..."
              />
              {selectedRecipe && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{selectedRecipe.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedRecipe.calories_per_serving} кал/порция
                    </span>
                  </div>
                  {selectedRecipe.description && (
                    <p className="text-xs text-muted-foreground mb-2">{selectedRecipe.description}</p>
                  )}
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <div>
                      <Label htmlFor="recipe_servings">Брой порции</Label>
                      <Input
                        id="recipe_servings"
                        type="number"
                        value={recipeServings}
                        onChange={(e) => setRecipeServings(parseInt(e.target.value) || 1)}
                        min="1"
                        max="20"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        П: {Math.round(selectedRecipe.protein_per_serving * recipeServings)}г •
                        В: {Math.round(selectedRecipe.carbs_per_serving * recipeServings)}г •
                        М: {Math.round(selectedRecipe.fat_per_serving * recipeServings)}г
                      </div>
                      <div className="text-sm font-semibold">
                        {Math.round(selectedRecipe.calories_per_serving * recipeServings)} кал
                      </div>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        onClick={handleAddRecipe}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Добави
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Items List */}
            {selectedItems.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">Избрани храни/рецепти ({selectedItems.length})</h4>
                  <div className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                    Общо: {calculateTotals(selectedItems).calories} кал
                  </div>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-card rounded border border-purple-100 dark:border-purple-800"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {item.type === 'food' ? (
                          <Apple className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        ) : (
                          <ChefHat className="h-3 w-3 text-green-600 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">{item.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({item.quantity}{item.type === 'food' ? 'г' : ' порц'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {item.calories} кал
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{calculateTotals(selectedItems).calories}</div>
                      <div className="text-muted-foreground">Калории</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{calculateTotals(selectedItems).protein}г</div>
                      <div className="text-muted-foreground">Протеини</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">{calculateTotals(selectedItems).carbs}г</div>
                      <div className="text-muted-foreground">Въглехидр.</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">{calculateTotals(selectedItems).fats}г</div>
                      <div className="text-muted-foreground">Мазнини</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  или въведете ръчно
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="meal_name">Име на ястието *</Label>
              <Input
                id="meal_name"
                value={formData.meal_name || ""}
                onChange={(e) => setFormData({ ...formData, meal_name: e.target.value })}
                placeholder="Напр: Овесена каша с боровинки"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">Калории</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="protein">Протеини (г)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={formData.protein || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, protein: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carbs">Въглехидрати (г)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={formData.carbs || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, carbs: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="fats">Мазнини (г)</Label>
                <Input
                  id="fats"
                  type="number"
                  value={formData.fats || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, fats: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Бележки (опционално)</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Специални инструкции, рецепта..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отказ
            </Button>
            <Button onClick={() => onSave(formData)} className="flex-1 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Запази промените" : "Добави ястие"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}