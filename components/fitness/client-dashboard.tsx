// components/fitness/client-dashboard.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Target, 
  TrendingUp, 
  Dumbbell,
  Apple,
  Timer,
  Award,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/utils/supabase/client";

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
      // Parallel queries for dashboard data
      const [
        { data: todayWorkouts },
        { data: activeGoals },
        { data: latestMeasurements },
        { data: upcomingWorkouts }
      ] = await Promise.all([
        // Today's workout sessions
        supabase
          .from("workout_sessions")
          .select(`
            *,
            workout_programs(name, description)
          `)
          .eq("client_id", user.id)
          .eq("scheduled_date", new Date().toISOString().split('T')[0])
          .order("created_at", { ascending: false }),

        // Active goals
        supabase
          .from("client_goals")
          .select("*")
          .eq("client_id", user.id)
          .eq("is_achieved", false)
          .order("priority", { ascending: false })
          .limit(5),

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
          .gte("scheduled_date", new Date().toISOString().split('T')[0])
          .lte("scheduled_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order("scheduled_date", { ascending: true })
          .limit(5)
      ]);

      setData({
        todayWorkouts: todayWorkouts || [],
        activeGoals: activeGoals || [],
        latestMeasurements: latestMeasurements?.[0] || null,
        weeklyProgress: null, // TODO: Calculate from recent data
        upcomingWorkouts: upcomingWorkouts || []
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {profile.full_name}! 💪
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Quick Log
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Workouts"
          value={data?.todayWorkouts?.length || 0}
          subtitle="scheduled"
          icon={<Dumbbell className="h-4 w-4" />}
          trend="+2 from yesterday"
        />
        <StatsCard
          title="Active Goals"
          value={data?.activeGoals?.length || 0}
          subtitle="in progress"
          icon={<Target className="h-4 w-4" />}
          trend="3 near completion"
        />
        <StatsCard
          title="Current Weight"
          value={data?.latestMeasurements?.weight_kg || "—"}
          subtitle="kg"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="-2.3kg this month"
        />
        <StatsCard
          title="Streak"
          value="7"
          subtitle="days"
          icon={<Award className="h-4 w-4" />}
          trend="Personal best!"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <CalendarDays className="h-5 w-5 mr-2" />
                Today's Schedule
              </h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>

            {data?.todayWorkouts?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No workouts scheduled for today</p>
                <p className="text-sm">Take a rest day or add a quick workout!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.todayWorkouts?.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions & Goals */}
        <div className="space-y-6">
          {/* Active Goals */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Active Goals
              </h3>
              
              {data?.activeGoals?.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No active goals</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Set Your First Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.activeGoals?.slice(0, 3).map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                  {data?.activeGoals && data.activeGoals.length > 3 && (
                    <Button variant="ghost" size="sm" className="w-full">
                      View All Goals ({data.activeGoals.length})
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
                <Button variant="outline" size="sm">
                  <Apple className="h-4 w-4 mr-2" />
                  Log Meal
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Log Weight
                </Button>
                <Button variant="outline" size="sm">
                  <Timer className="h-4 w-4 mr-2" />
                  Quick Timer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Upcoming Workouts */}
      {data?.upcomingWorkouts && data.upcomingWorkouts.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">This Week's Workouts</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.upcomingWorkouts.map((workout) => (
                <UpcomingWorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Helper Components
function StatsCard({ title, value, subtitle, icon, trend }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {trend && (
            <p className="text-xs text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </Card>
  );
}

function WorkoutCard({ workout }: { workout: any }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{workout.name}</h4>
          <p className="text-sm text-muted-foreground">
            {workout.planned_duration_minutes} min • {workout.status}
          </p>
        </div>
        <Button size="sm">
          {workout.status === 'planned' ? 'Start' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: any }) {
  const progress = goal.target_value && goal.target_value > 0 
    ? Math.min(100, (goal.current_value / goal.target_value) * 100)
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{goal.title}</h4>
        <span className="text-xs text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-muted-foreground">
        {goal.current_value || 0} / {goal.target_value || 0} {goal.unit || ''}
      </p>
    </div>
  );
}

function UpcomingWorkoutCard({ workout }: { workout: any }) {
  const date = new Date(workout.scheduled_date);
  const isToday = date.toDateString() === new Date().toDateString();
  const isTomorrow = date.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
  
  let dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  if (isToday) dateLabel = 'Today';
  if (isTomorrow) dateLabel = 'Tomorrow';

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-blue-600">{dateLabel}</span>
        <span className="text-xs text-muted-foreground">
          {workout.planned_duration_minutes}min
        </span>
      </div>
      <h4 className="text-sm font-medium">{workout.name}</h4>
      <p className="text-xs text-muted-foreground mt-1">
        {workout.workout_programs?.name}
      </p>
    </div>
  );
}

function LoadingDashboard({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile.full_name}!</h1>
          <p className="text-muted-foreground">Here's your fitness overview</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}