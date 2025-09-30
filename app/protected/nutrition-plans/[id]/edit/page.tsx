"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createSupabaseClient } from "@/utils/supabase/client";
import { dateToLocalDateString } from "@/utils/date-utils";
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
          onClose={() => {
            setShowDayModal(false);
            fetchMeals();
          }}
          supabase={supabase}
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
        ${day.isToday ? "bg-green-50 border-green-300" : ""}
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
                className="text-xs p-1 bg-blue-50 rounded truncate"
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
  onClose,
  supabase,
}: {
  isOpen: boolean;
  selectedDate: Date;
  meals: MealPlan[];
  clientId: string;
  onClose: () => void;
  supabase: any;
}) {
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSaveMeal = async (meal: MealPlan) => {
    try {
      if (meal.id) {
        // Update existing meal
        const { error } = await supabase
          .from("daily_meals")
          .update({
            meal_name: meal.meal_name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
            notes: meal.notes,
          })
          .eq("id", meal.id);

        if (error) throw error;
      } else {
        // Create new meal
        const { error } = await supabase.from("daily_meals").insert({
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
        });

        if (error) throw error;
      }

      setEditingMeal(null);
      setIsCreating(false);
      onClose(); // This will trigger fetchMeals
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Грешка при запазване на ястието");
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете това ястие?")) return;

    try {
      const { error } = await supabase
        .from("daily_meals")
        .delete()
        .eq("id", mealId);

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error("Error deleting meal:", error);
      alert("Грешка при изтриване на ястието");
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center">
              <Apple className="h-6 w-6 mr-2 text-green-600" />
              Хранене за {formatDate(selectedDate)}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setIsCreating(true);
                  setEditingMeal({
                    meal_type: "breakfast",
                    meal_name: "",
                    scheduled_date: dateToLocalDateString(selectedDate),
                    client_id: clientId,
                    status: "planned",
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добави ястие
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Meal Form */}
          {(editingMeal || isCreating) && (
            <Card className="p-4 mb-4 bg-green-50">
              <MealForm
                meal={editingMeal!}
                onSave={handleSaveMeal}
                onCancel={() => {
                  setEditingMeal(null);
                  setIsCreating(false);
                }}
              />
            </Card>
          )}

          {/* Meals by type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MEAL_TYPES.map((mealType) => {
              const typeMeals = meals.filter(
                (m) => m.meal_type === mealType.value
              );

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
                  </div>

                  <div className="space-y-2">
                    {typeMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="text-sm p-3 rounded border bg-white"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium">{meal.meal_name}</span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setEditingMeal(meal)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive"
                              onClick={() => handleDeleteMeal(meal.id!)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {(meal.calories || meal.protein) && (
                          <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                            {meal.calories && meal.calories > 0 && (
                              <span>{meal.calories} кал</span>
                            )}
                            {meal.protein && meal.protein > 0 && (
                              <span>{meal.protein}г П</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {typeMeals.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-4 border-2 border-dashed rounded">
                        Няма планирани храни
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

function MealForm({
  meal,
  onSave,
  onCancel,
}: {
  meal: MealPlan;
  onSave: (meal: MealPlan) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(meal);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Тип ястие</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            value={formData.meal_type}
            onChange={(e) =>
              setFormData({ ...formData, meal_type: e.target.value as any })
            }
          >
            {MEAL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Име на ястието</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded"
            value={formData.meal_name}
            onChange={(e) =>
              setFormData({ ...formData, meal_name: e.target.value })
            }
            placeholder="напр. Овесена каша с плодове"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium">Калории</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border rounded"
            value={formData.calories || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                calories: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium">Протеин (г)</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border rounded"
            value={formData.protein || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                protein: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium">Въглехидрати (г)</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border rounded"
            value={formData.carbs || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                carbs: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium">Мазнини (г)</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border rounded"
            value={formData.fats || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                fats: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Бележки</label>
        <textarea
          className="w-full mt-1 p-2 border rounded"
          rows={2}
          value={formData.notes || ""}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          placeholder="Допълнителна информация..."
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onSave(formData)} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Запази
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Откажи
        </Button>
      </div>
    </div>
  );
}