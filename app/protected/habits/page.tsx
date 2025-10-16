"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target,
  Plus,
  Flame,
  TrendingUp,
  Calendar,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { HABIT_TEMPLATES } from "@/utils/actions/habits-actions";

interface ClientHabit {
  id: string;
  client_id: string;
  habit_type: string;
  title: string;
  description?: string;
  target_value?: number;
  unit?: string;
  frequency: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  todayLog?: HabitLog;
}

interface HabitLog {
  id: string;
  habit_id: string;
  client_id: string;
  log_date: string;
  completed: boolean;
  actual_value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<ClientHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);

  const [habitForm, setHabitForm] = useState({
    habit_type: "custom",
    title: "",
    description: "",
    target_value: "",
    unit: "",
    icon: "",
    color: "blue",
    frequency: "daily"
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/habits");
      const data = await response.json();

      if (data.success) {
        setHabits(data.habits || []);
      } else {
        toast.error("Грешка при зареждане на навиците");
      }
    } catch (error) {
      console.error("Error fetching habits:", error);
      toast.error("Грешка при зареждане");
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async () => {
    if (!habitForm.title.trim()) {
      toast.error("Моля въведи заглавие");
      return;
    }

    try {
      const payload = {
        ...habitForm,
        target_value: habitForm.target_value ? Number(habitForm.target_value) : null,
      };

      console.log("Creating habit with payload:", payload);

      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        toast.success("Навикът е създаден");
        fetchHabits();
        setShowAddForm(false);
        setHabitForm({
          habit_type: "custom",
          title: "",
          description: "",
          target_value: "",
          unit: "",
          icon: "",
          color: "blue",
          frequency: "daily"
        });
      } else {
        console.error("API Error:", data);
        toast.error(data.error || "Грешка при създаване");
      }
    } catch (error) {
      console.error("Error creating habit:", error);
      toast.error("Грешка при създаване");
    }
  };

  const createFromTemplate = async (template: typeof HABIT_TEMPLATES[0]) => {
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...template,
          frequency: "daily"
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Навикът е добавен");
        fetchHabits();
        setShowTemplates(false);
      } else {
        console.error("API Error:", data);
        toast.error(data.error || "Грешка при добавяне");
      }
    } catch (error) {
      console.error("Error creating habit from template:", error);
      toast.error("Грешка при добавяне");
    }
  };

  const toggleHabitCompletion = async (habit: ClientHabit, completed: boolean, actualValue?: number) => {
    const today = new Date().toISOString().split("T")[0];

    try {
      const response = await fetch("/api/habit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit_id: habit.id,
          log_date: today,
          completed,
          actual_value: actualValue || habit.target_value,
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(completed ? "Отбелязано ✓" : "Премахнато");
        fetchHabits();
      } else {
        toast.error("Грешка");
      }
    } catch (error) {
      console.error("Error logging habit:", error);
      toast.error("Грешка");
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!confirm("Сигурен ли си, че искаш да изтриеш този навик?")) {
      return;
    }

    try {
      const response = await fetch(`/api/habits?id=${habitId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Навикът е изтрит");
        fetchHabits();
      } else {
        toast.error("Грешка при изтриване");
      }
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast.error("Грешка при изтриване");
    }
  };

  const getTodayCompletionRate = () => {
    if (habits.length === 0) return 0;
    const completed = habits.filter(h => h.todayLog?.completed).length;
    return Math.round((completed / habits.length) * 100);
  };

  const getColorClasses = (color?: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
      green: { bg: "bg-green-50 dark:bg-green-950", text: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
      purple: { bg: "bg-purple-50 dark:bg-purple-950", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
      red: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
      orange: { bg: "bg-orange-50 dark:bg-orange-950", text: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
      cyan: { bg: "bg-cyan-50 dark:bg-cyan-950", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-800" },
    };
    return colorMap[color || "blue"];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Моите навици</h1>
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </Card>
      </div>
    );
  }

  const completionRate = getTodayCompletionRate();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Моите навици
          </h1>
          <p className="text-muted-foreground text-sm">Изгради здравни навици и следи прогреса си</p>
        </div>
      </div>

      {/* Today's Progress Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Днес</h3>
            <p className="text-sm text-muted-foreground">
              {habits.filter(h => h.todayLog?.completed).length} / {habits.length} завършени
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{completionRate}%</div>
            {completionRate === 100 && habits.length > 0 && (
              <Badge className="mt-1" variant="default">
                <Flame className="h-3 w-3 mr-1" />
                Перфектен ден!
              </Badge>
            )}
          </div>
        </div>
        <Progress value={completionRate} className="h-2" />
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={() => setShowAddForm(!showAddForm)} variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Добави навик
        </Button>
        <Button onClick={() => setShowTemplates(!showTemplates)} variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Шаблони
        </Button>
      </div>

      {/* Templates */}
      {showTemplates && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Избери от шаблони</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {HABIT_TEMPLATES.map((template) => {
              const colors = getColorClasses(template.color);
              return (
                <div
                  key={template.habit_type}
                  className={`border-2 ${colors.border} ${colors.bg} rounded-lg p-4 cursor-pointer hover:shadow-md transition`}
                  onClick={() => createFromTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{template.icon}</span>
                        <h4 className="font-medium">{template.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Цел: {template.target_value} {template.unit}
                      </p>
                    </div>
                    <Plus className="h-5 w-5 opacity-50" />
                  </div>
                </div>
              );
            })}
          </div>
          <Button variant="ghost" className="w-full mt-4" onClick={() => setShowTemplates(false)}>
            Затвори
          </Button>
        </Card>
      )}

      {/* Add Habit Form */}
      {showAddForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Създай нов навик</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Заглавие *</Label>
              <Input
                value={habitForm.title}
                onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                placeholder="Напр. - Изпий 8 чаши вода"
              />
            </div>
            <div>
              <Label>Целева стойност</Label>
              <Input
                type="number"
                value={habitForm.target_value}
                onChange={(e) => setHabitForm({ ...habitForm, target_value: e.target.value })}
                placeholder="8"
              />
            </div>
            <div>
              <Label>Единица</Label>
              <Input
                value={habitForm.unit}
                onChange={(e) => setHabitForm({ ...habitForm, unit: e.target.value })}
                placeholder="чаши, часа, стъпки..."
              />
            </div>
            <div>
              <Label>Икона (emoji)</Label>
              <Input
                value={habitForm.icon}
                onChange={(e) => setHabitForm({ ...habitForm, icon: e.target.value })}
                placeholder="💧"
              />
            </div>
            <div>
              <Label>Цвят</Label>
              <Select value={habitForm.color} onValueChange={(value) => setHabitForm({ ...habitForm, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Син</SelectItem>
                  <SelectItem value="green">Зелен</SelectItem>
                  <SelectItem value="purple">Лилав</SelectItem>
                  <SelectItem value="red">Червен</SelectItem>
                  <SelectItem value="orange">Оранжев</SelectItem>
                  <SelectItem value="cyan">Циан</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Описание</Label>
              <Textarea
                value={habitForm.description}
                onChange={(e) => setHabitForm({ ...habitForm, description: e.target.value })}
                placeholder="Защо е важен този навик?"
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Откажи
            </Button>
            <Button onClick={createHabit}>
              Създай
            </Button>
          </div>
        </Card>
      )}

      {/* Habits List */}
      <div className="space-y-3">
        {habits.length > 0 ? (
          habits.map((habit) => {
            const colors = getColorClasses(habit.color);
            const isCompleted = habit.todayLog?.completed || false;
            const isExpanded = expandedHabit === habit.id;

            return (
              <Card key={habit.id} className={`p-4 ${isCompleted ? colors.bg : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Checkbox */}
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={(checked) => toggleHabitCompletion(habit, checked as boolean)}
                      className="h-6 w-6"
                    />

                    {/* Habit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {habit.icon && <span className="text-xl">{habit.icon}</span>}
                        <h4 className={`font-medium truncate ${isCompleted ? "line-through opacity-70" : ""}`}>
                          {habit.title}
                        </h4>
                      </div>
                      {habit.target_value && (
                        <p className="text-sm text-muted-foreground">
                          Цел: {habit.target_value} {habit.unit}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <CheckCircle2 className={`h-5 w-5 ${colors.text}`} />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedHabit(isExpanded ? null : habit.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteHabit(habit.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    {habit.description && (
                      <p className="text-sm text-muted-foreground">{habit.description}</p>
                    )}
                    {habit.todayLog && (
                      <div className="text-xs text-muted-foreground">
                        Завършено: {new Date(habit.todayLog.created_at).toLocaleTimeString("bg-BG", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">Все още няма добавени навици</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добави първия си навик
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
