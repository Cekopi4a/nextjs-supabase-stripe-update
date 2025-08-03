// app/protected/programs/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Trash2, 
  GripVertical,
  Calendar,
  Users,
  Target,
  Clock
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  name: string;
  muscle_groups: string[];
  difficulty: string;
  equipment: string[];
  instructions: any;
  image_url?: string;
  exercise_type: string;
}

interface WorkoutExercise {
  exercise_id: string;
  exercise: Exercise;
  sets: number;
  reps: string; // "8-12" or "10"
  weight?: string; // "bodyweight" or "40kg"
  rest_time: number; // seconds
  notes?: string;
  order: number;
}

interface WorkoutDay {
  day_of_week: number;
  name: string;
  exercises: WorkoutExercise[];
  estimated_duration: number;
  workout_type: string;
}

export default function CreateProgramPage() {
  const [programName, setProgramName] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [programGoals, setProgramGoals] = useState<string[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState<string>("");
  const [durationWeeks, setDurationWeeks] = useState<number>(8);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number>(3);
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [activeDay, setActiveDay] = useState<number>(0);
  
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  // Load data on component mount
  useEffect(() => {
    loadExercises();
    loadClients();
    initializeWorkoutDays();
  }, [workoutsPerWeek]);

  const loadExercises = async () => {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .or("is_global.eq.true,trainer_id.eq." + (await supabase.auth.getUser()).data.user?.id)
      .order("name");
    
    if (data) {
      setExercises(data);
      setFilteredExercises(data);
    }
  };

  const loadClients = async () => {
    const user = await supabase.auth.getUser();
    const { data } = await supabase
      .from("trainer_clients")
      .select(`
        client_id,
        profiles!trainer_clients_client_id_fkey(id, full_name, email)
      `)
      .eq("trainer_id", user.data.user?.id)
      .eq("status", "active");
    
    if (data) {
      setClients(data.map(tc => tc.profiles).filter(Boolean));
    }
  };

  const initializeWorkoutDays = () => {
    const days: WorkoutDay[] = [];
    const dayNames = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
    
    for (let i = 0; i < workoutsPerWeek; i++) {
      days.push({
        day_of_week: i,
        name: dayNames[i],
        exercises: [],
        estimated_duration: 60,
        workout_type: "strength"
      });
    }
    setWorkoutDays(days);
    setActiveDay(0);
  };

  // Filter exercises
  useEffect(() => {
    let filtered = exercises;
    
    if (searchTerm) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedMuscleGroup) {
      filtered = filtered.filter(ex => 
        ex.muscle_groups.includes(selectedMuscleGroup)
      );
    }
    
    setFilteredExercises(filtered);
  }, [searchTerm, selectedMuscleGroup, exercises]);

  const addExerciseToWorkout = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      exercise_id: exercise.id,
      exercise: exercise,
      sets: 3,
      reps: "8-12",
      weight: exercise.equipment.includes("none") ? "bodyweight" : "",
      rest_time: 60,
      notes: "",
      order: workoutDays[activeDay].exercises.length
    };

    const updatedDays = [...workoutDays];
    updatedDays[activeDay].exercises.push(newExercise);
    setWorkoutDays(updatedDays);
  };

  const removeExerciseFromWorkout = (exerciseIndex: number) => {
    const updatedDays = [...workoutDays];
    updatedDays[activeDay].exercises.splice(exerciseIndex, 1);
    // Reorder remaining exercises
    updatedDays[activeDay].exercises.forEach((ex, idx) => {
      ex.order = idx;
    });
    setWorkoutDays(updatedDays);
  };

  const updateExerciseInWorkout = (exerciseIndex: number, field: string, value: any) => {
    const updatedDays = [...workoutDays];
    (updatedDays[activeDay].exercises[exerciseIndex] as any)[field] = value;
    setWorkoutDays(updatedDays);
  };

  const saveProgram = async () => {
    if (!programName.trim()) {
      alert("Please enter a program name");
      return;
    }

    if (selectedClients.length === 0) {
      alert("Please select at least one client");
      return;
    }

    setSaving(true);

    try {
      const user = await supabase.auth.getUser();
      
      // Create program for each selected client
      for (const clientId of selectedClients) {
        // Create workout program
        const { data: program, error: programError } = await supabase
          .from("workout_programs")
          .insert({
            trainer_id: user.data.user?.id,
            client_id: clientId,
            name: programName,
            description: programDescription,
            program_type: "workout_only",
            goals: { goals: programGoals },
            difficulty_level: difficultyLevel,
            estimated_duration_weeks: durationWeeks,
            workouts_per_week: workoutsPerWeek,
            is_active: true
          })
          .select()
          .single();

        if (programError) throw programError;

        // Create workout templates for each day
        for (const day of workoutDays) {
          const { error: workoutError } = await supabase
            .from("workouts")
            .insert({
              program_id: program.id,
              name: day.name,
              day_of_week: day.day_of_week,
              week_number: 1,
              workout_type: day.workout_type,
              exercises: day.exercises.map(ex => ({
                exercise_id: ex.exercise_id,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                rest_time: ex.rest_time,
                notes: ex.notes,
                order: ex.order
              })),
              estimated_duration_minutes: day.estimated_duration
            });

          if (workoutError) throw workoutError;
        }

        // Generate actual workout sessions for the next 4 weeks
        const startDate = new Date();
        for (let week = 0; week < 4; week++) {
          for (const day of workoutDays) {
            const sessionDate = new Date(startDate);
            sessionDate.setDate(startDate.getDate() + (week * 7) + day.day_of_week);

            await supabase
              .from("workout_sessions")
              .insert({
                program_id: program.id,
                client_id: clientId,
                scheduled_date: sessionDate.toISOString().split('T')[0],
                name: day.name,
                description: `Week ${week + 1} - ${day.name}`,
                planned_duration_minutes: day.estimated_duration,
                exercises: day.exercises.map(ex => ({
                  exercise_id: ex.exercise_id,
                  planned_sets: ex.sets,
                  planned_reps: ex.reps,
                  planned_weight: ex.weight,
                  rest_time: ex.rest_time,
                  notes: ex.notes,
                  order: ex.order,
                  // Initialize actual values as empty
                  actual_sets: 0,
                  actual_reps: "",
                  actual_weight: "",
                  completed: false
                })),
                status: "planned"
              });
          }
        }
      }

      router.push("/protected/programs?created=true");
    } catch (error) {
      console.error("Error saving program:", error);
      alert("Error saving program. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const muscleGroups = [
    "chest", "back", "shoulders", "biceps", "triceps", 
    "quadriceps", "hamstrings", "glutes", "calves", "core", "cardio"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Workout Program</h1>
          <p className="text-muted-foreground">
            Build a comprehensive workout program for your clients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={saveProgram} disabled={saving}>
            {saving ? "Saving..." : "Save Program"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Program Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Program Details</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Program Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Beginner Strength Training"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Describe the program goals and approach..."
                value={programDescription}
                onChange={(e) => setProgramDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Difficulty</Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Duration (weeks)</Label>
                <Input
                  type="number"
                  min="1"
                  max="52"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label>Workouts per week</Label>
              <Select 
                value={workoutsPerWeek.toString()} 
                onValueChange={(value) => setWorkoutsPerWeek(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 workouts</SelectItem>
                  <SelectItem value="3">3 workouts</SelectItem>
                  <SelectItem value="4">4 workouts</SelectItem>
                  <SelectItem value="5">5 workouts</SelectItem>
                  <SelectItem value="6">6 workouts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Assign to Clients *</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {clients.map((client) => (
                  <label key={client.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClients([...selectedClients, client.id]);
                        } else {
                          setSelectedClients(selectedClients.filter(id => id !== client.id));
                        }
                      }}
                    />
                    <span className="text-sm">{client.full_name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Workout Days */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Workout Schedule</h3>
          
          {/* Day Tabs */}
          <div className="flex flex-wrap gap-1 mb-4">
            {workoutDays.map((day, index) => (
              <Button
                key={index}
                variant={activeDay === index ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveDay(index)}
              >
                {day.name}
              </Button>
            ))}
          </div>

          {/* Active Day Details */}
          {workoutDays[activeDay] && (
            <div className="space-y-4">
              <div>
                <Label>Workout Name</Label>
                <Input
                  value={workoutDays[activeDay].name}
                  onChange={(e) => {
                    const updatedDays = [...workoutDays];
                    updatedDays[activeDay].name = e.target.value;
                    setWorkoutDays(updatedDays);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={workoutDays[activeDay].workout_type}
                    onValueChange={(value) => {
                      const updatedDays = [...workoutDays];
                      updatedDays[activeDay].workout_type = value;
                      setWorkoutDays(updatedDays);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                      <SelectItem value="balance">Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    min="15"
                    max="180"
                    value={workoutDays[activeDay].estimated_duration}
                    onChange={(e) => {
                      const updatedDays = [...workoutDays];
                      updatedDays[activeDay].estimated_duration = Number(e.target.value);
                      setWorkoutDays(updatedDays);
                    }}
                  />
                </div>
              </div>

              {/* Exercise List for this day */}
              <div>
                <Label>Exercises ({workoutDays[activeDay].exercises.length})</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {workoutDays[activeDay].exercises.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No exercises added yet. Select from the exercise library.
                    </p>
                  ) : (
                    workoutDays[activeDay].exercises.map((workoutEx, index) => (
                      <WorkoutExerciseCard
                        key={index}
                        workoutExercise={workoutEx}
                        onUpdate={(field, value) => updateExerciseInWorkout(index, field, value)}
                        onRemove={() => removeExerciseFromWorkout(index)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Exercise Library */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Exercise Library</h3>
          
          {/* Search and Filter */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by muscle group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All muscle groups</SelectItem>
                {muscleGroups.map(group => (
                  <SelectItem key={group} value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exercise List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onAdd={() => addExerciseToWorkout(exercise)}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper Components
function ExerciseCard({ exercise, onAdd }: { exercise: Exercise; onAdd: () => void }) {
  return (
    <div className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{exercise.name}</h4>
          <p className="text-xs text-muted-foreground">
            {exercise.muscle_groups.join(", ")} • {exercise.difficulty}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function WorkoutExerciseCard({ 
  workoutExercise, 
  onUpdate, 
  onRemove 
}: { 
  workoutExercise: WorkoutExercise;
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{workoutExercise.exercise.name}</h4>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Sets</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={workoutExercise.sets}
            onChange={(e) => onUpdate("sets", Number(e.target.value))}
            className="h-8"
          />
        </div>
        
        <div>
          <Label className="text-xs">Reps</Label>
          <Input
            placeholder="8-12"
            value={workoutExercise.reps}
            onChange={(e) => onUpdate("reps", e.target.value)}
            className="h-8"
          />
        </div>
        
        <div>
          <Label className="text-xs">Rest (s)</Label>
          <Input
            type="number"
            min="30"
            max="300"
            step="15"
            value={workoutExercise.rest_time}
            onChange={(e) => onUpdate("rest_time", Number(e.target.value))}
            className="h-8"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Weight/Load</Label>
        <Input
          placeholder="bodyweight, 20kg, etc."
          value={workoutExercise.weight}
          onChange={(e) => onUpdate("weight", e.target.value)}
          className="h-8"
        />
      </div>
    </div>
  );
}