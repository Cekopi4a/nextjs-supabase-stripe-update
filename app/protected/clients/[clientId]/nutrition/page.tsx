// app/protected/clients/[clientId]/nutrition/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  User,
  Target,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { dateToLocalDateString } from "@/utils/date-utils";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
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
    color: 'bg-orange-100 text-orange-800',
    time: '08:00'
  },
  { 
    value: 'morning_snack', 
    label: 'Сутрешен снакс', 
    icon: Apple,
    color: 'bg-green-100 text-green-800',
    time: '10:00'
  },
  { 
    value: 'lunch', 
    label: 'Обяд', 
    icon: UtensilsCrossed,
    color: 'bg-blue-100 text-blue-800',
    time: '13:00'
  },
  { 
    value: 'afternoon_snack', 
    label: 'Следобеден снакс', 
    icon: Apple,
    color: 'bg-yellow-100 text-yellow-800',
    time: '16:00'
  },
  { 
    value: 'dinner', 
    label: 'Вечеря', 
    icon: Sunset,
    color: 'bg-purple-100 text-purple-800',
    time: '19:00'
  },
  { 
    value: 'evening_snack', 
    label: 'Вечерен снакс', 
    icon: Apple,
    color: 'bg-pink-100 text-pink-800',
    time: '21:00'
  }
];

const BULGARIAN_MONTHS = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];

const BULGARIAN_DAYS = ["Нед", "Пон", "Вто", "Сря", "Чет", "Пет", "Съб"];

export default function ClientNutritionPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');

  // Form states
  const [mealForm, setMealForm] = useState({
    meal_name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    notes: ''
  });

  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  useEffect(() => {
    if (client) {
      fetchMeals();
    }
  }, [currentDate, client]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, meals]);

  const fetchClientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verify trainer has access to this client
      const { data: relationship } = await supabase
        .from("trainer_clients")
        .select("*")
        .eq("trainer_id", user.id)
        .eq("client_id", clientId)
        .single();

      if (!relationship) {
        router.push("/protected/clients");
        return;
      }

      // Get client data
      const { data: clientData, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      setClient(clientData);
    } catch (error) {
      console.error("Error fetching client:", error);
      router.push("/protected/clients");
    }
  };

  const fetchMeals = async () => {
    if (!client) return;
    
    setLoading(true);
    
    try {
      // Get start and end of month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = dateToLocalDateString(startOfMonth);
      const endDate = dateToLocalDateString(endOfMonth);

      // Get daily meals for this month
      const { data: dailyMeals, error: mealsError } = await supabase
        .from("daily_meals")
        .select("*")
        .eq("client_id", clientId)
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
    if (!selectedDate || !mealForm.meal_name.trim()) {
      alert("Моля въведете име на ястието");
      return;
    }

    try {
      const mealData = {
        meal_type: selectedMealType,
        meal_name: mealForm.meal_name,
        scheduled_date: dateToLocalDateString(selectedDate),
        client_id: clientId,
        calories: mealForm.calories || null,
        protein: mealForm.protein || null,
        carbs: mealForm.carbs || null,
        fats: mealForm.fats || null,
        notes: mealForm.notes || null,
        status: 'planned'
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

        const result = await response.json();
        
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

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/protected/clients">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Link>
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
              {client.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Apple className="h-6 w-6 mr-2 text-green-600" />
                Хранителен календар - {client.full_name}
              </h1>
              <p className="text-muted-foreground">{client.email}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/protected/clients/${clientId}/calendar`}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Тренировки
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/protected/clients/${clientId}/progress`}>
              <Target className="h-4 w-4 mr-2" />
              Прогрес
            </Link>
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-xl font-semibold">
              {BULGARIAN_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {MEAL_TYPES.map((type) => (
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
        min-h-[100px] p-2 border border-border transition-colors hover:bg-muted/30 cursor-pointer
        ${!day.isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''}
        ${day.isToday ? 'bg-green-50 border-green-300' : ''}
      `}
      onClick={() => day.isCurrentMonth && onDayClick(day.date)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${day.isToday ? 'text-green-600' : ''}`}>
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
          <div className="grid grid-cols-4 gap-1">
            {MEAL_TYPES.map((mealType) => {
              const hasMeal = day.meals.some(m => m.meal_type === mealType.value);
              const isCompleted = day.meals.some(m => m.meal_type === mealType.value && m.status === 'completed');
              
              return (
                <div
                  key={mealType.value}
                  className={`
                    h-4 rounded-sm flex items-center justify-center
                    ${hasMeal 
                      ? isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-200 text-blue-800'
                      : 'bg-gray-100'
                    }
                  `}
                >
                  <mealType.icon className="h-2 w-2" />
                </div>
              );
            })}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <h4 className="font-semibold">{mealType.label}</h4>
                        <p className="text-sm text-muted-foreground">{mealType.time}</p>
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
                    <div className="mb-3 p-2 bg-muted/30 rounded text-sm">
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
            <Card className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <h4 className="font-semibold mb-3 text-green-800">Общо за деня</h4>
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
        text-sm p-3 rounded border cursor-pointer transition-all hover:shadow-sm group
        ${isCompleted ? 'bg-green-50 border-green-200 text-green-800' : 
          isPlanned ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-muted text-muted-foreground'}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          ) : (
            <mealType.icon className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="font-medium truncate">{meal.meal_name}</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
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
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
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
        <div className="text-xs opacity-75 grid grid-cols-4 gap-2">
          {meal.calories && meal.calories > 0 && <span>{meal.calories} кал</span>}
          {meal.protein && meal.protein > 0 && <span>{meal.protein}г П</span>}
          {meal.carbs && meal.carbs > 0 && <span>{meal.carbs}г В</span>}
          {meal.fats && meal.fats > 0 && <span>{meal.fats}г М</span>}
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
  onSave, 
  onClose 
}: {
  isOpen: boolean;
  isEditing: boolean;
  selectedMealType: string;
  mealForm: any;
  setMealForm: (form: any) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const mealType = MEAL_TYPES.find(t => t.value === selectedMealType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {mealType && (
                <div className={`p-2 rounded-lg ${mealType.color}`}>
                  <mealType.icon className="h-4 w-4" />
                </div>
              )}
              <h3 className="text-lg font-semibold">
                {isEditing ? 'Редактирай ястие' : `Добави ${mealType?.label.toLowerCase()}`}
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="meal_name">Име на ястието *</Label>
              <Input
                id="meal_name"
                value={mealForm.meal_name || ''}
                onChange={(e) => setMealForm({...mealForm, meal_name: e.target.value})}
                placeholder="Напр: Овесена каша с боровинки"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">Калории</Label>
                <Input
                  id="calories"
                  type="number"
                  value={mealForm.calories || 0}
                  onChange={(e) => setMealForm({...mealForm, calories: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="protein">Протеини (г)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={mealForm.protein || 0}
                  onChange={(e) => setMealForm({...mealForm, protein: parseInt(e.target.value) || 0})}
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
                  value={mealForm.carbs || 0}
                  onChange={(e) => setMealForm({...mealForm, carbs: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="fats">Мазнини (г)</Label>
                <Input
                  id="fats"
                  type="number"
                  value={mealForm.fats || 0}
                  onChange={(e) => setMealForm({...mealForm, fats: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Бележки (опционално)</Label>
              <Textarea
                id="notes"
                value={mealForm.notes || ''}
                onChange={(e) => setMealForm({...mealForm, notes: e.target.value})}
                placeholder="Специални инструкции, рецепта..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отказ
            </Button>
            <Button onClick={onSave} className="flex-1 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Запази промените' : 'Добави ястие'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}