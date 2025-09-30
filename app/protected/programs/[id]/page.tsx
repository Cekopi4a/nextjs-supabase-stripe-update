import { createSupabaseClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Target, Users, Clock, Dumbbell } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { id } = await params;
  const client = await createSupabaseClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  // Get user profile to determine role
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div>Profile not found</div>;
  }

  // Get program details
  const { data: program, error } = await client
    .from("workout_programs")
    .select(`
      *,
      profiles!workout_programs_client_id_fkey(full_name, email),
      trainer:profiles!workout_programs_trainer_id_fkey(full_name, email)
    `)
    .eq("id", id)
    .single();

  if (error || !program) {
    notFound();
  }

  // Check if user has access to this program
  const hasAccess =
    profile.role === "trainer" && program.trainer_id === user.id ||
    profile.role === "client" && program.client_id === user.id ||
    profile.role === "admin";

  if (!hasAccess) {
    return <div>Access denied</div>;
  }

  const relatedUser = profile.role === "trainer"
    ? program.profiles // client info for trainer
    : program.trainer; // trainer info for client

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/protected/programs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{program.name}</h1>
          <p className="text-muted-foreground">Program Details</p>
        </div>
      </div>

      {/* Program Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={program.is_active ? "default" : "secondary"}>
                {program.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline">
                {program.program_type.replace('_', ' ')}
              </Badge>
            </div>

            {program.difficulty_level && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <Badge variant="outline">
                  {program.difficulty_level}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{program.estimated_duration_weeks || 8} weeks</span>
              </div>
            </div>

            {program.workouts_per_week && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Frequency:</span>
                <div className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  <span>{program.workouts_per_week}/week</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(program.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        {/* Participants */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Participants</h3>
          <div className="space-y-3">
            {relatedUser && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Users className="h-4 w-4" />
                <div>
                  <div className="font-medium">{relatedUser.full_name}</div>
                  <div className="text-sm text-muted-foreground">{relatedUser.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {profile.role === "trainer" ? "Client" : "Trainer"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Description */}
      {program.description && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Description</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {program.description}
          </p>
        </Card>
      )}

      {/* Goals */}
      {program.goals && typeof program.goals === 'object' && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Goals</h3>
          <div className="text-muted-foreground">
            {program.goals.goals && Array.isArray(program.goals.goals)
              ? program.goals.goals.map((goal: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <span>{goal}</span>
                  </div>
                ))
              : typeof program.goals.goals === 'string'
                ? <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>{program.goals.goals}</span>
                  </div>
                : <span className="text-muted-foreground">No specific goals defined</span>
            }
          </div>
        </Card>
      )}

      {/* Program Dates */}
      {(program.start_date || program.end_date) && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            {program.start_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(program.start_date).toLocaleDateString()}</span>
                </div>
              </div>
            )}
            {program.end_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(program.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        {profile.role === "trainer" && (
          <>
            <Button asChild>
              <Link href={`/protected/programs/${program.id}/edit`}>
                Edit Details
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/protected/programs/${program.id}/edit-calendar`}>
                Edit Calendar
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/protected/workouts?program=${program.id}`}>
                View Workouts
              </Link>
            </Button>
          </>
        )}

        {profile.role === "client" && program.is_active && (
          <Button asChild>
            <Link href={`/protected/workouts?program=${program.id}`}>
              Start Workout
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}