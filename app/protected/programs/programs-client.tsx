"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar, Target, History } from "lucide-react";
import Link from "next/link";
import { DeleteProgramButton } from "@/components/delete-program-button";

interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  difficulty_level?: string;
  program_type: string;
  estimated_duration_weeks?: number;
  workouts_per_week?: number;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface ProgramsClientProps {
  activePrograms: WorkoutProgram[];
  inactivePrograms: WorkoutProgram[];
  userRole: string;
}

export function ProgramsClient({
  activePrograms,
  inactivePrograms,
  userRole,
}: ProgramsClientProps) {
  const [showHistory, setShowHistory] = useState(false);

  const programsToShow = showHistory ? [...activePrograms, ...inactivePrograms] : activePrograms;
  const hasHistory = inactivePrograms.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {userRole === "trainer" ? "My Programs" : "My Workout Programs"}
          </h1>
          <p className="text-muted-foreground">
            {userRole === "trainer"
              ? "Manage workout programs for your clients"
              : "View and track your assigned workout programs"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {userRole === "trainer" && hasHistory && (
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 mr-2" />
              {showHistory ? "Hide History" : "Show History"}
            </Button>
          )}
          {userRole === "trainer" && (
            <Button asChild>
              <Link href="/protected/programs/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Program
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Info Badge */}
      {userRole === "trainer" && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>💡 Important:</strong> Each client can only have 1 active program.
            When you create a new program, old ones automatically become inactive.
          </p>
        </Card>
      )}

      {/* History Info */}
      {showHistory && hasHistory && (
        <div className="text-sm text-muted-foreground">
          Showing: {activePrograms.length} active + {inactivePrograms.length} inactive programs
        </div>
      )}

      {/* Programs Grid */}
      {programsToShow.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-muted-foreground">
              <Target className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {userRole === "trainer"
                ? "No programs created yet"
                : "No programs assigned yet"
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {userRole === "trainer"
                ? "Create your first workout program to get started with training clients."
                : "Your trainer will assign workout programs to you soon."
              }
            </p>
            {userRole === "trainer" && (
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
          {programsToShow.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program, userRole }: { program: WorkoutProgram; userRole: string }) {
  const relatedUser = program.profiles;

  return (
    <Card className={`p-6 hover:shadow-md transition-shadow ${!program.is_active ? 'opacity-60' : ''}`}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{program.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              program.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
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
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded">
              {program.difficulty_level}
            </span>
          )}
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded">
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

          {userRole === "trainer" && (
            <>
              {program.is_active && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/protected/programs/${program.id}/edit`}>
                    Edit
                  </Link>
                </Button>
              )}
              <DeleteProgramButton programId={program.id} programName={program.name} />
            </>
          )}

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