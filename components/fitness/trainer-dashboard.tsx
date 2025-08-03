// components/fitness/trainer-dashboard.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, TrendingUp, Star } from "lucide-react";

interface TrainerDashboardProps {
  user: any;
  profile: any;
}

export default function TrainerDashboard({ user, profile }: TrainerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, Coach {profile.full_name}! 🏋️‍♂️
          </h1>
          <p className="text-muted-foreground">
            Manage your clients and track their progress
          </p>
        </div>
        <Button>Add New Client</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-green-600">+2 this month</p>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sessions Today</p>
              <p className="text-2xl font-bold">6</p>
              <p className="text-xs text-blue-600">4 completed</p>
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-xs text-green-600">+0.2 this month</p>
            </div>
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">$2,340</p>
              <p className="text-xs text-green-600">+15% this month</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Client Activity</h3>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>Client activity will appear here</p>
              <p className="text-sm">Connect with your first client to get started</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>No sessions scheduled for today</p>
              <Button variant="outline" size="sm" className="mt-2">
                Add Session
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}