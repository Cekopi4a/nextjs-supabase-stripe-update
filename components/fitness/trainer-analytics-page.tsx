"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Activity,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Award
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  created_at: string;
}

interface WorkoutProgram {
  id: string;
  name: string;
  created_at: string;
  is_active: boolean;
  client_id: string;
  profiles?: { full_name: string };
}

interface NutritionPlan {
  id: string;
  name: string;
  created_at: string;
  is_active: boolean;
  client_id: string;
  profiles?: { full_name: string };
}

interface WorkoutCompletion {
  id: string;
  completed_date: string;
  status: string;
  client_id: string;
  profiles?: { full_name: string };
}

interface TrainerAnalyticsPageProps {
  trainer: Profile;
  clients: Profile[];
  clientsCount: number;
  workoutPrograms: WorkoutProgram[];
  nutritionPlans: NutritionPlan[];
  workoutCompletions: WorkoutCompletion[];
}

export default function TrainerAnalyticsPage({
  clients,
  clientsCount,
  workoutPrograms,
  nutritionPlans,
  workoutCompletions
}: TrainerAnalyticsPageProps) {
  // Calculate statistics
  const activeWorkoutPrograms = workoutPrograms.filter(p => p.is_active).length;
  const activeNutritionPlans = nutritionPlans.filter(p => p.is_active).length;
  const totalCompletions = workoutCompletions.length;

  // Calculate completion rate (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentCompletions = workoutCompletions.filter(c =>
    c.completed_date && new Date(c.completed_date) > thirtyDaysAgo
  ).length;

  // Get recent client activity
  const recentActivity = workoutCompletions
    .filter(c => c.completed_date)
    .slice(0, 10)
    .map(completion => ({
      client: completion.profiles?.full_name || "Unknown Client",
      action: "Completed workout",
      time: new Date(completion.completed_date).toLocaleDateString("bg-BG")
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard 📊</h1>
          <p className="text-muted-foreground">
            Track your clients progress and performance
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">{clientsCount}</p>
              <p className="text-xs text-green-600">Active clients</p>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Programs</p>
              <p className="text-2xl font-bold">{activeWorkoutPrograms}</p>
              <p className="text-xs text-blue-600">Workout programs</p>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nutrition Plans</p>
              <p className="text-2xl font-bold">{activeNutritionPlans}</p>
              <p className="text-xs text-green-600">Active plans</p>
            </div>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Workouts</p>
              <p className="text-2xl font-bold">{recentCompletions}</p>
              <p className="text-xs text-green-600">Last 30 days</p>
            </div>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Clients</h3>
          <div className="space-y-3">
            {clients.length > 0 ? (
              clients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{client.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined: {new Date(client.created_at).toLocaleDateString("bg-BG")}
                    </p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No clients yet</p>
                <p className="text-sm">Invite your first client to get started</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.client}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Client workouts will appear here</p>
              </div>
            )}
          </div>
        </Card>

        {/* Program Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Program Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Workout Programs</span>
              <Badge variant="outline">{workoutPrograms.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Programs</span>
              <Badge variant="default">{activeWorkoutPrograms}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nutrition Plans</span>
              <Badge variant="secondary">{nutritionPlans.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Completions</span>
              <Badge variant="outline">{totalCompletions}</Badge>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Client Engagement</p>
                <p className="text-xs text-muted-foreground">
                  {recentCompletions} workouts completed this month
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Program Effectiveness</p>
                <p className="text-xs text-muted-foreground">
                  {((activeWorkoutPrograms / Math.max(workoutPrograms.length, 1)) * 100).toFixed(0)}% active programs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Response Rate</p>
                <p className="text-xs text-muted-foreground">
                  Track client response times
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}