// app/protected/programs/page.tsx
import { createSupabaseClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar, Target } from "lucide-react";
import Link from "next/link";

export default async function ProgramsPage() {
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

  // Get programs based on user role
  let programs = [];
  
  if (profile.role === "trainer") {
    // Trainers see programs they created
    const { data } = await client
      .from("workout_programs")
      .select(`
        *,
        profiles!workout_programs_client_id_fkey(full_name, email),
        workouts(count)
      `)
      .eq("trainer_id", user.id)
      .order("created_at", { ascending: false });
    
    programs = data || [];
  } else {
    // Clients see programs assigned to them
    const { data } = await client
      .from("workout_programs")
      .select(`
        *,
        profiles!workout_programs_trainer_id_fkey(full_name, email),
        workouts(count)
      `)
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
    
    programs = data || [];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {profile.role === "trainer" ? "My Programs" : "My Workout Programs"}
          </h1>
          <p className="text-muted-foreground">
            {profile.role === "trainer" 
              ? "Manage workout programs for your clients"
              : "View and track your assigned workout programs"
            }
          </p>
        </div>
        {profile.role === "trainer" && (
          <Button asChild>
            <Link href="/protected/programs/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Link>
          </Button>
        )}
      </div>

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-muted-foreground">
              <Target className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {profile.role === "trainer" 
                ? "No programs created yet"
                : "No programs assigned yet"
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {profile.role === "trainer"
                ? "Create your first workout program to get started with training clients."
                : "Your trainer will assign workout programs to you soon."
              }
            </p>
            {profile.role === "trainer" && (
              <Button asChild>
                <Link href="/protected/programs/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Program
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard 
              key={program.id} 
              program={program} 
              userRole={profile.role}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program, userRole }: { program: any; userRole: string }) {
  const relatedUser = userRole === "trainer" 
    ? program.profiles // client info for trainer
    : program.profiles; // trainer info for client

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{program.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              program.is_active 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {program.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          
          {program.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {program.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{program.estimated_duration_weeks || 8} weeks</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>{program.workouts_per_week || 3}/week</span>
          </div>
        </div>

        {/* Related User Info */}
        {relatedUser && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {userRole === "trainer" ? "Client: " : "Trainer: "}
              {relatedUser.full_name}
            </span>
          </div>
        )}

        {/* Difficulty & Type */}
        <div className="flex gap-2">
          {program.difficulty_level && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {program.difficulty_level}
            </span>
          )}
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
            {program.program_type.replace('_', ' ')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            asChild
          >
            <Link href={`/protected/programs/${program.id}`}>
              View Details
            </Link>
          </Button>
          
          {userRole === "client" && program.is_active && (
            <Button 
              size="sm" 
              className="flex-1"
              asChild
            >
              <Link href={`/protected/workouts?program=${program.id}`}>
                Start Workout
              </Link>
            </Button>
          )}
        </div>

        {/* Created/Updated Date */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Created {new Date(program.created_at).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
}