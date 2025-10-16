// components/fitness/client-dashboard.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatScheduledDate, parseScheduledDate, dateToLocalDateString } from "@/utils/date-utils";
import { 
  CalendarDays, 
  Target, 
  TrendingUp, 
  Dumbbell,
  Apple,
  Timer,
  Award,
  Plus,
  Play,
  Calendar,
  BarChart3,
  CheckCircle2,
  Clock,
  Flame,
  Activity,
  Utensils,
  Eye,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";
import Link from "next/link";
import DailyQuoteCard from "@/components/fitness/daily-quote-card";

interface ClientDashboardProps {
  user: any;
  profile: any;
}

interface DashboardData {
  todayWorkouts: any[];
  activeGoals: any[];
  latestMeasurements: any | null;
  weeklyProgress: any | null;
  upcomingWorkouts: any[];
  activePrograms: any[];
  todayNutrition: any | null;
  todayDailyMeals: any[];
  workoutStreak: number;
  totalWorkoutsCompleted: number;
  todayHabits: any[];
}

export default function ClientDashboard({ user, profile }: ClientDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const supabase = createSupabaseClient();
    
    try {
      const today = dateToLocalDateString(new Date());
      const sevenDaysAgo = dateToLocalDateString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      
      // Parallel queries for dashboard data
      const [
        { data: todayWorkouts, error: todayWorkoutsError },
        { data: activeGoals },
        { data: latestMeasurements },
        { data: upcomingWorkouts },
        { data: activePrograms },
        { data: workoutLogs },
        { data: nutritionPlan },
        { data: dailyMeals },
        { data: habits }
      ] = await Promise.all([
        // Today's scheduled workouts - try simple query first
        supabase
          .from("workout_sessions")
          .select("*")
          .eq("client_id", user.id)
          .eq("scheduled_date", today),

        // Active goals
        supabase
          .from("client_goals")
          .select("*")
          .eq("client_id", user.id)
          .eq("is_achieved", false)
          .order("priority", { ascending: false })
          .limit(4),

        // Latest measurements
        supabase
          .from("body_measurements")
          .select("*")
          .eq("client_id", user.id)
          .order("date", { ascending: false })
          .limit(1),

        // Upcoming workouts (next 7 days)
        supabase
          .from("workout_sessions")
          .select(`
            *,
            workout_programs(name, description)
          `)
          .eq("client_id", user.id)
          .gte("scheduled_date", today)
          .lte("scheduled_date", dateToLocalDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)))
          .order("scheduled_date", { ascending: true })
          .limit(5),

        // Active programs
        supabase
          .from("workout_programs")
          .select(`
            *,
            profiles!workout_programs_trainer_id_fkey(full_name, email)
          `)
          .eq("client_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),

        // Recent workout sessions for streak calculation
        supabase
          .from("workout_sessions")
          .select("scheduled_date, status, completed_date")
          .eq("client_id", user.id)
          .gte("scheduled_date", sevenDaysAgo)
          .order("scheduled_date", { ascending: false }),

        // Today's nutrition plan
        supabase
          .from("nutrition_plans")
          .select(`
            *,
            nutrition_plan_meals!inner(
              *,
              nutrition_plan_meal_items(
                *,
                food_item_id,
                quantity
              )
            )
          `)
          .eq("client_id", user.id)
          .eq("is_active", true)
          .eq("nutrition_plan_meals.day_of_week", new Date().getDay())
          .order("created_at", { ascending: false })
          .limit(1),

        // Today's daily meals (explicit daily schedule)
        supabase
          .from("daily_meals")
          .select("*")
          .eq("client_id", user.id)
          .eq("scheduled_date", today)
          .order("meal_type"),

        // Today's habits with logs
        supabase
          .from("client_habits")
          .select(`
            *,
            habit_logs!left(*)
          `)
          .eq("client_id", user.id)
          .eq("is_active", true)
          .eq("habit_logs.log_date", today)
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      if (todayWorkoutsError) {
        console.error("Error fetching today's workouts:", todayWorkoutsError);
      }
      
      

      // Calculate workout streak
      let streak = 0;
      if (workoutLogs && workoutLogs.length > 0) {
        const sortedLogs = workoutLogs.sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
        for (const log of sortedLogs) {
          if (log.status === 'completed') {
            streak++;
          } else {
            break;
          }
        }
      }

      // Calculate total completed workouts
      const { count: totalCompleted } = await supabase
        .from("workout_sessions")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", user.id)
        .eq("status", "completed");

      setData({
        todayWorkouts: todayWorkouts || [],
        activeGoals: activeGoals || [],
        latestMeasurements: latestMeasurements?.[0] || null,
        weeklyProgress: null, // TODO: Calculate from recent data
        upcomingWorkouts: upcomingWorkouts || [],
        activePrograms: activePrograms || [],
        todayNutrition: nutritionPlan?.[0] || null,
        todayDailyMeals: dailyMeals || [],
        workoutStreak: streak,
        totalWorkoutsCompleted: totalCompleted || 0,
        todayHabits: habits || []
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingDashboard profile={profile} />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {profile.full_name}!</h1>
            <p className="text-muted-foreground">Here's your fitness overview</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={fetchDashboardData} variant="outline">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentDate = new Date();
  const greeting = currentDate.getHours() < 12 ? "Good morning" : 
                  currentDate.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            {greeting}, {profile.full_name?.split(' ')[0]}! 💪
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {currentDate.toLocaleDateString('bg-BG', {
              weekday: 'long',
              day: 'numeric',
              month: 'short'
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild size="sm" className="flex-1 sm:flex-initial">
            <Link href="/protected/progress">
              <BarChart3 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Progress</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1 sm:flex-initial">
            <Link href="/protected/workouts/log">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Quick Log</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Daily Quote */}
      <DailyQuoteCard />

      {/* Quick Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Workouts"
          value={data?.todayWorkouts?.length || 0}
          subtitle="scheduled"
          icon={<Dumbbell className="h-4 w-4" />}
          color="blue"
          actionText={data?.todayWorkouts?.length ? "Start workout" : "View programs"}
          actionHref={data?.todayWorkouts?.length ? `/protected/workouts/${data.todayWorkouts[0].id}` : "/protected/programs"}
        />
        
        <StatsCard
          title="Workout Streak"
          value={data?.workoutStreak || 0}
          subtitle="days"
          icon={<Flame className="h-4 w-4" />}
          color="orange"
          trend={(data?.workoutStreak || 0) >= 7 ? "🔥 On fire!" : "Keep going!"}
        />
        
        <StatsCard
          title="Current Weight"
          value={data?.latestMeasurements?.weight_kg || "—"}
          subtitle="kg"
          icon={<TrendingUp className="h-4 w-4" />}
          color="green"
          trend={data?.latestMeasurements ? `Updated ${new Date(data.latestMeasurements.date).toLocaleDateString()}` : "No data"}
          actionText="Update"
          actionHref="/protected/progress"
        />
        
        <StatsCard
          title="Total Workouts"
          value={data?.totalWorkoutsCompleted || 0}
          subtitle="completed"
          icon={<Award className="h-4 w-4" />}
          color="purple"
          trend="All time"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        
        {/* Left Column - Today's Activities */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          {/* Today's Workouts */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center">
                <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Today's Workouts
              </h3>
              <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                <Link href="/protected/workouts">
                  <span className="hidden sm:inline">View Calendar</span>
                  <span className="sm:hidden">Calendar</span>
                </Link>
              </Button>
            </div>
            
            {data?.todayWorkouts && data.todayWorkouts.length > 0 ? (
              <div className="space-y-3">
                {data.todayWorkouts.map((workout) => (
                  <TodayWorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No workouts scheduled for today</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/protected/programs">
                    Browse Programs
                  </Link>
                </Button>
              </div>
            )}
          </Card>

          {/* Today's Nutrition */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center">
                <Utensils className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Today's Nutrition
              </h3>
              <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                <Link href="/protected/nutrition">
                  <span className="hidden sm:inline">View Plans</span>
                  <span className="sm:hidden">Plans</span>
                </Link>
              </Button>
            </div>
            
            {data?.todayDailyMeals && data.todayDailyMeals.length > 0 ? (
              <TodayDailyMealsCard meals={data.todayDailyMeals} />
            ) : data?.todayNutrition ? (
              <TodayNutritionCard nutrition={data.todayNutrition} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Apple className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No nutrition plan for today</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/protected/nutrition">
                    Browse Plans
                  </Link>
                </Button>
              </div>
            )}
          </Card>

          {/* Today's Habits */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Днешни навици
              </h3>
              <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                <Link href="/protected/habits">
                  <span className="hidden sm:inline">Виж всички</span>
                  <span className="sm:hidden">Всички</span>
                </Link>
              </Button>
            </div>

            {data?.todayHabits && data.todayHabits.length > 0 ? (
              <div className="space-y-2">
                {data.todayHabits.map((habit) => (
                  <TodayHabitCard key={habit.id} habit={habit} onToggle={fetchDashboardData} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Няма добавени навици</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/protected/habits">
                    Добави навици
                  </Link>
                </Button>
              </div>
            )}
          </Card>

          {/* Active Goals */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Active Goals
              </h3>
              <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                <Link href="/protected/goals">
                  <span className="hidden sm:inline">Manage Goals</span>
                  <span className="sm:hidden">Manage</span>
                </Link>
              </Button>
            </div>

            {data?.activeGoals && data.activeGoals.length > 0 ? (
              <div className="space-y-4">
                {data.activeGoals.map((goal) => (
                  <GoalProgressCard key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active goals</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/protected/goals">
                    Set Your First Goal
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Summary & Quick Actions */}
        <div className="space-y-4 sm:space-y-6">

          {/* Quick Actions */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Actions</h3>
            <div className="space-y-2 sm:space-y-3">
              <Button className="w-full justify-start text-sm" asChild size="sm">
                <Link href="/protected/workouts/log">
                  <Play className="h-4 w-4 mr-2" />
                  Log Workout
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" asChild size="sm">
                <Link href="/protected/nutrition/log">
                  <Utensils className="h-4 w-4 mr-2" />
                  Log Meal
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" asChild size="sm">
                <Link href="/protected/progress">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Update Progress
                </Link>
              </Button>
            </div>
          </Card>

          {/* Active Programs */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold">My Programs</h3>
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href="/protected/programs">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  All
                </Link>
              </Button>
            </div>
            
            {data?.activePrograms && data.activePrograms.length > 0 ? (
              <div className="space-y-3">
                {data.activePrograms.slice(0, 2).map((program) => (
                  <div key={program.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{program.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        Week {Math.ceil((Date.now() - new Date(program.start_date).getTime()) / (7 * 24 * 60 * 60 * 1000)) || 1}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Coach: {program.profiles?.full_name}
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href={`/protected/programs/${program.id}`}>
                        View Program
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No active programs</p>
              </div>
            )}
          </Card>

          {/* Upcoming Workouts */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">This Week</h3>
            
            {data?.upcomingWorkouts && data.upcomingWorkouts.length > 0 ? (
              <div className="space-y-2">
                {data.upcomingWorkouts.slice(0, 4).map((workout) => (
                  <UpcomingWorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No upcoming workouts</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  trend,
  actionText,
  actionHref
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "orange" | "purple";
  trend?: string;
  actionText?: string;
  actionHref?: string;
}) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50"
  };

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1.5 sm:p-2 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
          {icon}
        </div>
        {actionText && actionHref && (
          <Button size="sm" variant="ghost" asChild className="h-auto p-1 text-[10px] sm:text-xs">
            <Link href={actionHref}>
              {actionText}
            </Link>
          </Button>
        )}
      </div>
      <div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-xl sm:text-2xl font-bold">{value}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {trend && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">{trend}</p>
        )}
      </div>
    </Card>
  );
}

function TodayWorkoutCard({ workout }: { workout: any }) {
  const duration = workout.planned_duration_minutes || 45;
  const isCompleted = workout.status === 'completed';

  return (
    <div className={`border rounded-lg p-3 sm:p-4 ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm sm:text-base truncate">{workout.name}</h4>
            {isCompleted && <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {workout.workout_programs?.name}
          </p>
          <div className="flex items-center gap-3 sm:gap-4 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {duration} min
            </span>
            <span className="flex items-center gap-1">
              <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {workout.difficulty_rating ? `${workout.difficulty_rating}/10` : 'Medium'}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant={isCompleted ? "outline" : "default"}
          asChild
          className="flex-shrink-0 text-xs sm:text-sm"
        >
          <Link href={`/protected/workouts`}>
            {isCompleted ? "Review" : "Start"}
          </Link>
        </Button>
      </div>

      {workout.description && (
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {workout.description}
        </p>
      )}
    </div>
  );
}

function GoalProgressCard({ goal }: { goal: any }) {
  const progress = goal.target_value && goal.target_value > 0 
    ? Math.min(100, Math.max(0, (goal.current_value / goal.target_value) * 100))
    : 0;

  const progressColor = progress >= 75 ? "bg-green-600" : 
                       progress >= 50 ? "bg-blue-600" : 
                       progress >= 25 ? "bg-yellow-600" : "bg-gray-400";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{goal.title}</h4>
        <span className="text-sm font-medium text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {goal.current_value || 0} / {goal.target_value || 0} {goal.unit || ''}
        </span>
        <span>
          Target: {new Date(goal.target_date).toLocaleDateString('bg-BG')}
        </span>
      </div>
      
      {goal.description && (
        <p className="text-xs text-muted-foreground">{goal.description}</p>
      )}
    </div>
  );
}

function UpcomingWorkoutCard({ workout }: { workout: any }) {
  const date = parseScheduledDate(workout.scheduled_date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  let dateLabel = date.toLocaleDateString('bg-BG', { weekday: 'short', day: 'numeric' });
  if (isToday) dateLabel = 'Today';
  if (isTomorrow) dateLabel = 'Tomorrow';

  return (
    <div className="flex items-center justify-between p-2 rounded border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded ${
            isToday ? 'bg-blue-100 text-blue-700' : 
            isTomorrow ? 'bg-green-100 text-green-700' : 
            'bg-gray-100 text-gray-700'
          }`}>
            {dateLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {workout.planned_duration_minutes || 45}min
          </span>
        </div>
        <p className="text-sm font-medium truncate mt-1">{workout.name}</p>
      </div>
      <Button size="sm" variant="ghost" asChild>
        <Link href={`/protected/workouts`}>
          <Eye className="h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}

function TodayNutritionCard({ nutrition }: { nutrition: any }) {
  // Calculate total calories and macros from meals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  if (nutrition?.nutrition_plan_meals) {
    nutrition.nutrition_plan_meals.forEach((meal: any) => {
      if (meal.nutrition_plan_meal_items) {
        meal.nutrition_plan_meal_items.forEach((item: any) => {
          // For now just count items since we don't have the food data
          // TODO: Join with food_items table for proper nutrition calculation
        });
      }
    });
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Nutrition Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
          <p className="text-base sm:text-lg font-bold text-blue-600">{Math.round(totalCalories)}</p>
          <p className="text-[10px] sm:text-xs text-blue-600">Calories</p>
        </div>
        <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
          <p className="text-base sm:text-lg font-bold text-green-600">{Math.round(totalProtein)}g</p>
          <p className="text-[10px] sm:text-xs text-green-600">Protein</p>
        </div>
        <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
          <p className="text-base sm:text-lg font-bold text-orange-600">{Math.round(totalCarbs)}g</p>
          <p className="text-[10px] sm:text-xs text-orange-600">Carbs</p>
        </div>
        <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
          <p className="text-base sm:text-lg font-bold text-purple-600">{Math.round(totalFat)}g</p>
          <p className="text-[10px] sm:text-xs text-purple-600">Fat</p>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">Today's Meals</h4>
        {nutrition?.nutrition_plan_meals && nutrition.nutrition_plan_meals.length > 0 ? (
          <div className="space-y-2">
            {nutrition.nutrition_plan_meals.map((meal: any, index: number) => (
              <div key={meal.id || index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">{meal.meal_type || `Meal ${index + 1}`}</h5>
                  <Badge variant="outline" className="text-xs">
                    {meal.nutrition_plan_meal_items?.length || 0} items
                  </Badge>
                </div>
                
                {meal.nutrition_plan_meal_items && meal.nutrition_plan_meal_items.length > 0 && (
                  <div className="space-y-1">
                    {meal.nutrition_plan_meal_items.slice(0, 3).map((item: any, itemIndex: number) => (
                      <div key={item.id || itemIndex} className="flex justify-between text-xs text-muted-foreground">
                        <span>Food item {itemIndex + 1}</span>
                        <span>{item.quantity || 100}g</span>
                      </div>
                    ))}
                    {meal.nutrition_plan_meal_items.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{meal.nutrition_plan_meal_items.length - 3} more items
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No meals planned</p>
        )}
      </div>
      
      <Button variant="outline" size="sm" className="w-full" asChild>
        <Link href="/protected/nutrition">
          View Full Plan
          <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </Button>
    </div>
  );
}

function TodayDailyMealsCard({ meals }: { meals: any[] }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {meals.map((meal) => (
          <div key={meal.id} className="flex items-center justify-between p-2 border rounded-lg">
            <div className="flex items-center gap-2">
              <Apple className="h-4 w-4 opacity-70" />
              <span className="text-sm font-medium">{meal.meal_name || meal.meal_type}</span>
            </div>
            {meal.status === 'completed' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Clock className="h-4 w-4 opacity-70" />
            )}
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="w-full" asChild>
        <Link href="/protected/nutrition">
          View Full Plan
          <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </Button>
    </div>
  );
}

function TodayHabitCard({ habit, onToggle }: { habit: any; onToggle: () => void }) {
  const [loading, setLoading] = useState(false);
  const todayLog = habit.habit_logs?.[0];
  const isCompleted = todayLog?.completed || false;

  const toggleHabit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    try {
      const response = await fetch("/api/habit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit_id: habit.id,
          log_date: today,
          completed: !isCompleted,
          actual_value: habit.target_value,
        })
      });

      if (response.ok) {
        onToggle();
      }
    } catch (error) {
      console.error("Error toggling habit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer hover:shadow-sm ${
        isCompleted ? "bg-green-50 border-green-200" : "hover:bg-muted/50"
      }`}
      onClick={toggleHabit}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCompleted ? "bg-green-600 text-white" : "border-2 border-muted-foreground"
        }`}>
          {isCompleted && <CheckCircle2 className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {habit.icon && <span className="text-lg">{habit.icon}</span>}
            <span className={`text-sm font-medium truncate ${isCompleted ? "line-through opacity-70" : ""}`}>
              {habit.title}
            </span>
          </div>
          {habit.target_value && (
            <p className="text-xs text-muted-foreground">
              {habit.target_value} {habit.unit}
            </p>
          )}
        </div>
      </div>
      {loading && (
        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  );
}

function LoadingDashboard({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile.full_name}!</h1>
          <div className="h-4 bg-muted rounded w-48 mt-1 animate-pulse"></div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-5 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-4/5"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}