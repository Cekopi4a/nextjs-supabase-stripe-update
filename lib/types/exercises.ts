export type ExerciseLevel = 'beginner' | 'intermediate' | 'expert';

export type ExerciseForce = 'pull' | 'push' | 'static' | null;

export type ExerciseMechanic = 'compound' | 'isolation' | null;

export type ExerciseCategory = 
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'plyometrics'
  | 'strongman'
  | 'powerlifting'
  | 'olympic_weightlifting';

export interface Exercise {
  id: string;
  name: string;
  force: ExerciseForce;
  level: ExerciseLevel;
  mechanic: ExerciseMechanic;
  equipment: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  instructions: string[];
  category: ExerciseCategory;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface ExerciseFromAPI {
  id: string;
  name: string;
  force: ExerciseForce;
  level: ExerciseLevel;
  mechanic: ExerciseMechanic;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: ExerciseCategory;
  images: string[];
}

export interface ExerciseSearchFilters {
  searchTerm?: string;
  level?: ExerciseLevel;
  category?: ExerciseCategory;
  equipment?: string;
  primaryMuscle?: string;
  limit?: number;
}

export interface WorkoutProgram {
  id: string;
  trainer_id: string;
  client_id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  difficulty_level: ExerciseLevel;
  program_type: 'strength' | 'cardio' | 'hybrid' | 'bodybuilding' | 'powerlifting' | 'crossfit';
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  program_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  session_name: string;
  session_order: number;
  rest_between_sets: number; // seconds
  estimated_duration: number; // minutes
  notes: string | null;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise: Exercise; // Joined exercise data
  exercise_order: number;
  sets: number;
  reps_min: number | null;
  reps_max: number | null;
  reps: number | null;
  weight_kg: number | null;
  rest_seconds: number;
  rpe: number | null; // Rate of Perceived Exertion 1-10
  notes: string | null;
  is_superset: boolean;
  superset_group: number | null;
  created_at: string;
}

export interface WorkoutSessionWithExercises extends WorkoutSession {
  exercises: WorkoutExercise[];
}

export interface WorkoutProgramWithSessions extends WorkoutProgram {
  sessions: WorkoutSessionWithExercises[];
  client_name?: string;
  client_email?: string;
  trainer_name?: string;
  trainer_email?: string;
  total_sessions?: number;
  total_exercises?: number;
  avg_session_duration?: number;
}

export interface ExerciseSelectionProps {
  onExerciseSelect: (exercise: Exercise) => void;
  selectedExercises?: Exercise[];
  filters?: ExerciseSearchFilters;
}

export interface ExerciseCardProps {
  exercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  onDetails?: (exercise: Exercise) => void;
  isSelected?: boolean;
  showDetails?: boolean;
}

export interface ExerciseDetailsModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MUSCLE_GROUPS = [
  'abdominals',
  'biceps',
  'triceps',
  'chest',
  'shoulders',
  'back',
  'legs',
  'quadriceps',
  'hamstrings',
  'calves',
  'glutes',
  'forearms',
  'lats',
  'middle_back',
  'lower_back',
  'neck',
  'traps'
] as const;

export const EQUIPMENT_TYPES = [
  'body_only',
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'kettlebell',
  'bands',
  'medicine_ball',
  'exercise_ball',
  'foam_roll',
  'e_z_curl_bar',
  'other'
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];
export type EquipmentType = typeof EQUIPMENT_TYPES[number];