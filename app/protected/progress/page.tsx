"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  CheckCircle2,
  Dumbbell,
  Calendar,
  Activity,
  Award,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProgressData {
  workoutStats: {
    total_scheduled: number;
    total_completed: number;
    completion_rate: number;
    current_streak: number;
    best_streak: number;
  };
  weightProgress: {
    current_weight: number | null;
    target_weight: number | null;
    start_weight: number | null;
    weight_change: number | null;
    progress_percentage: number;
    is_on_track: boolean;
    goal_type: string | null;
  };
  habitStats: {
    total_habits: number;
    total_logs: number;
    completed_logs: number;
    completion_rate: number;
    today_completion_rate: number;
  };
  workoutChartData: Array<{ date: string; scheduled: number; completed: number }>;
  habitChartData: Array<{ date: string; total: number; completed: number; completionRate: number }>;
  measurementTrends: Array<{
    measurement_date: string;
    weight_kg: number | null;
    waist_cm: number | null;
    chest_cm: number | null;
    hips_cm: number | null;
    body_fat_percentage: number | null;
  }>;
  activeGoals: any[];
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchProgressData();
  }, [timeRange]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/progress-stats?days=${timeRange}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error("Грешка при зареждане на данните");
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
      toast.error("Грешка при зареждане");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Напредък</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Напредък</h1>
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Няма налични данни</p>
        </Card>
      </div>
    );
  }

  const weightGoalIcon = data.weightProgress.goal_type === "weight_loss" ? (
    <TrendingDown className="h-4 w-4" />
  ) : data.weightProgress.goal_type === "weight_gain" ? (
    <TrendingUp className="h-4 w-4" />
  ) : null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Моят напредък
          </h1>
          <p className="text-muted-foreground">Проследи целите си и виж как се развиваш</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Последните 7 дни</SelectItem>
              <SelectItem value="30">Последните 30 дни</SelectItem>
              <SelectItem value="90">Последните 90 дни</SelectItem>
              <SelectItem value="180">Последните 6 месеца</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Workout Streak */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <Flame className="h-5 w-5" />
            </div>
            <Badge variant={data.workoutStats.current_streak >= 7 ? "default" : "secondary"}>
              {data.workoutStats.current_streak >= 7 ? "🔥 On fire!" : "Keep going"}
            </Badge>
          </div>
          <h3 className="text-2xl font-bold">{data.workoutStats.current_streak}</h3>
          <p className="text-sm text-muted-foreground">Дни поред тренировки</p>
          <div className="mt-2 text-xs text-muted-foreground">
            Рекорд: {data.workoutStats.best_streak} дни
          </div>
        </Card>

        {/* Workout Completion */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Dumbbell className="h-5 w-5" />
            </div>
            <Badge variant="secondary">
              {Math.round(data.workoutStats.completion_rate)}%
            </Badge>
          </div>
          <h3 className="text-2xl font-bold">
            {data.workoutStats.total_completed}/{data.workoutStats.total_scheduled}
          </h3>
          <p className="text-sm text-muted-foreground">Изпълнени тренировки</p>
          <Progress value={data.workoutStats.completion_rate} className="mt-2 h-2" />
        </Card>

        {/* Weight Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              {weightGoalIcon || <Target className="h-5 w-5" />}
            </div>
            {data.weightProgress.is_on_track && (
              <Badge variant="default" className="bg-green-600">
                On track
              </Badge>
            )}
          </div>
          <h3 className="text-2xl font-bold">
            {data.weightProgress.current_weight
              ? `${data.weightProgress.current_weight} кг`
              : "—"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Текущо тегло
            {data.weightProgress.target_weight && ` / ${data.weightProgress.target_weight} кг цел`}
          </p>
          {data.weightProgress.weight_change !== null && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {data.weightProgress.weight_change > 0 ? (
                <TrendingUp className="h-3 w-3 text-orange-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-600" />
              )}
              <span className={data.weightProgress.weight_change > 0 ? "text-orange-600" : "text-green-600"}>
                {Math.abs(data.weightProgress.weight_change).toFixed(1)} кг
              </span>
            </div>
          )}
        </Card>

        {/* Habit Completion */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <Badge variant="secondary">
              {Math.round(data.habitStats.today_completion_rate)}%
            </Badge>
          </div>
          <h3 className="text-2xl font-bold">
            {data.habitStats.completed_logs}/{data.habitStats.total_logs}
          </h3>
          <p className="text-sm text-muted-foreground">Изпълнени навици</p>
          <Progress value={data.habitStats.completion_rate} className="mt-2 h-2" />
        </Card>
      </div>

      {/* Weight Progress Chart */}
      {data.measurementTrends.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Прогрес с теглото
          </h3>

          {/* Progress towards goal */}
          {data.weightProgress.target_weight && data.weightProgress.start_weight && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Прогрес към целта</span>
                <span className="text-sm font-bold text-blue-600">
                  {Math.min(100, Math.max(0, data.weightProgress.progress_percentage)).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={Math.min(100, Math.max(0, data.weightProgress.progress_percentage))}
                className="h-3"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Начало: {data.weightProgress.start_weight} кг</span>
                <span>Цел: {data.weightProgress.target_weight} кг</span>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.measurementTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="measurement_date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString("bg-BG", { day: "numeric", month: "short" })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString("bg-BG")}
                formatter={(value: any) => [`${value?.toFixed(1) || "—"} кг`, "Тегло"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight_kg"
                stroke="#2563eb"
                strokeWidth={2}
                name="Тегло (кг)"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              {data.weightProgress.target_weight && (
                <Line
                  type="monotone"
                  dataKey={() => data.weightProgress.target_weight}
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Целево тегло"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Workout Completion Chart */}
      {data.workoutChartData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Изпълнени тренировки
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.workoutChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString("bg-BG", { day: "numeric", month: "short" })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString("bg-BG")}
              />
              <Legend />
              <Bar dataKey="completed" fill="#2563eb" name="Изпълнени" />
              <Bar dataKey="scheduled" fill="#94a3b8" name="Планирани" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Habits Completion Chart */}
      {data.habitChartData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Изпълнение на навиците
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.habitChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString("bg-BG", { day: "numeric", month: "short" })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString("bg-BG")}
                formatter={(value: any, name: string) => {
                  if (name === "completionRate") {
                    return [`${value?.toFixed(1) || 0}%`, "Процент изпълнение"];
                  }
                  return [value, name === "completed" ? "Изпълнени" : "Общо"];
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                name="% изпълнение"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Body Measurements Trends */}
      {data.measurementTrends.some(m => m.waist_cm || m.chest_cm || m.hips_cm) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Телесни измервания
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.measurementTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="measurement_date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString("bg-BG", { day: "numeric", month: "short" })}
              />
              <YAxis tick={{ fontSize: 12 }} label={{ value: "см", angle: -90, position: "insideLeft" }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString("bg-BG")}
                formatter={(value: any) => [`${value?.toFixed(1) || "—"} см`]}
              />
              <Legend />
              {data.measurementTrends.some(m => m.waist_cm) && (
                <Line type="monotone" dataKey="waist_cm" stroke="#f59e0b" name="Талия" strokeWidth={2} />
              )}
              {data.measurementTrends.some(m => m.chest_cm) && (
                <Line type="monotone" dataKey="chest_cm" stroke="#3b82f6" name="Гръдна обиколка" strokeWidth={2} />
              )}
              {data.measurementTrends.some(m => m.hips_cm) && (
                <Line type="monotone" dataKey="hips_cm" stroke="#8b5cf6" name="Ханш" strokeWidth={2} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Active Goals */}
      {data.activeGoals.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Активни цели
          </h3>
          <div className="space-y-4">
            {data.activeGoals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{goal.title}</h4>
                  {goal.target_date && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(goal.target_date).toLocaleDateString("bg-BG")}
                    </Badge>
                  )}
                </div>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                )}
                {goal.target_value && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>Цел: {goal.target_value} {goal.unit || ""}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
