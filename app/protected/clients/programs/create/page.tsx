"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Dumbbell, 
  Clock, 
  RotateCcw, 
  Trash2, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  GripVertical,
  Play,
  Target,
  Users,
  Calendar,
  Copy
} from 'lucide-react';

// Type definitions
interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface ButtonProps {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

interface SelectProps {
  children: ReactNode;
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

interface SelectItemProps {
  children: ReactNode;
  value: string;
  onClick?: () => void;
}

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
}

interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

interface Exercise {
  id: string;
  name: string;
  muscle_groups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercise_type: 'strength' | 'cardio' | 'flexibility' | 'active_recovery';
  equipment: string[];
  instructions?: {
    steps: string[];
  };
}

interface WorkoutExercise {
  exercise_id: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  weight: string;
  rest_time: number;
  notes: string;
  order: number;
}

interface WorkoutDay {
  day_of_week: number;
  name: string;
  exercises: WorkoutExercise[];
  estimated_duration: number;
  workout_type: string;
}

interface Client {
  id: string;
  full_name: string;
  email: string;
}

// UI Components
const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const Button: React.FC<ButtonProps> = ({ children, variant = "default", size = "default", className = "", onClick, disabled = false }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<string, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-background hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  const sizes: Record<string, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input 
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Textarea: React.FC<TextareaProps> = ({ className = "", ...props }) => (
  <textarea 
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Select: React.FC<SelectProps> = ({ children, value, onValueChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleItemClick = (itemValue: string) => {
    onValueChange(itemValue);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || "Избери..."}</span>
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-md">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              const childElement = child as React.ReactElement<{ value: string; onClick?: () => void }>;
              return React.cloneElement(childElement, {
                onClick: () => handleItemClick(childElement.props.value)
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

const SelectItem: React.FC<SelectItemProps> = ({ children, value, onClick }) => (
  <div 
    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
    onClick={onClick}
  >
    {children}
  </div>
);

const Badge: React.FC<BadgeProps> = ({ children, className = "", variant = "default" }) => {
  const variants: Record<string, string> = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    destructive: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

const Label: React.FC<LabelProps> = ({ children, htmlFor, className = "" }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

// Mock data - в реалния проект тези ще идват от Supabase
const mockExercises: Exercise[] = [
  {
    id: "1",
    name: "Push-ups",
    muscle_groups: ["chest", "shoulders", "triceps"],
    difficulty: "beginner",
    exercise_type: "strength",
    equipment: ["none"],
    instructions: { steps: ["Start in plank position", "Lower body until chest nearly touches floor", "Push back up to starting position"] }
  },
  {
    id: "2", 
    name: "Squats",
    muscle_groups: ["quadriceps", "glutes", "hamstrings"],
    difficulty: "beginner",
    exercise_type: "strength",
    equipment: ["none"],
    instructions: { steps: ["Stand with feet shoulder-width apart", "Lower hips back and down", "Drive through heels to return"] }
  },
  {
    id: "3",
    name: "Deadlift",
    muscle_groups: ["hamstrings", "glutes", "lower_back", "traps"],
    difficulty: "intermediate", 
    exercise_type: "strength",
    equipment: ["barbell", "plates"],
    instructions: { steps: ["Stand with feet hip-width apart", "Grip bar with hands outside legs", "Drive through heels to lift"] }
  },
  {
    id: "4",
    name: "Планк",
    muscle_groups: ["core", "shoulders"],
    difficulty: "beginner",
    exercise_type: "strength", 
    equipment: ["none"],
    instructions: { steps: ["Start in push-up position", "Hold body in straight line", "Engage core muscles"] }
  },
  {
    id: "5",
    name: "Бягане",
    muscle_groups: ["legs", "cardiovascular"],
    difficulty: "beginner",
    exercise_type: "cardio",
    equipment: ["none"],
    instructions: { steps: ["Start with light warm-up", "Maintain steady pace", "Focus on breathing rhythm"] }
  }
];

const mockClients: Client[] = [
  { id: "1", full_name: "Мария Петрова", email: "maria@example.com" },
  { id: "2", full_name: "Иван Димитров", email: "ivan@example.com" },
  { id: "3", full_name: "Елена Георгиева", email: "elena@example.com" }
];

const muscleGroups = [
  "chest", "shoulders", "triceps", "biceps", "back", "core", 
  "quadriceps", "hamstrings", "glutes", "calves", "legs", "cardiovascular"
];

const workoutTypes = [
  { value: "strength", label: "Силова", color: "bg-blue-500" },
  { value: "cardio", label: "Кардио", color: "bg-red-500" },
  { value: "flexibility", label: "Гъвкавост", color: "bg-green-500" },
  { value: "active_recovery", label: "Активно възстановяване", color: "bg-yellow-500" }
];

const difficultyLevels = [
  { value: "beginner", label: "Начинаещ", color: "bg-green-100 text-green-800" },
  { value: "intermediate", label: "Средно ниво", color: "bg-yellow-100 text-yellow-800" },
  { value: "advanced", label: "Напреднал", color: "bg-red-100 text-red-800" }
];

export default function ExerciseBuilder() {
  // States
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [programName, setProgramName] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [programGoals, setProgramGoals] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("intermediate");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(3);
  
  // Workout days state
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  
  // Exercise library
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(mockExercises);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  
  // UI states
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize workout days when workoutsPerWeek changes
  useEffect(() => {
    initializeWorkoutDays();
  }, [workoutsPerWeek]);

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

  const initializeWorkoutDays = () => {
    const days: WorkoutDay[] = [];
    const dayNames = ["Ден 1", "Ден 2", "Ден 3", "Ден 4", "Ден 5", "Ден 6", "Ден 7"];
    
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

  const addExerciseToWorkout = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      exercise_id: exercise.id,
      exercise: exercise,
      sets: 3,
      reps: exercise.exercise_type === "cardio" ? "10 мин" : "8-12",
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

  const updateExerciseInWorkout = (exerciseIndex: number, field: keyof WorkoutExercise, value: any) => {
    const updatedDays = [...workoutDays];
    (updatedDays[activeDay].exercises[exerciseIndex] as any)[field] = value;
    setWorkoutDays(updatedDays);
  };

  const duplicateWorkoutDay = () => {
    const dayToCopy = workoutDays[activeDay];
    const newDay: WorkoutDay = {
      ...dayToCopy,
      day_of_week: workoutDays.length,
      name: `Ден ${workoutDays.length + 1}`,
      exercises: dayToCopy.exercises.map(ex => ({ ...ex }))
    };
    
    setWorkoutDays([...workoutDays, newDay]);
    setWorkoutsPerWeek(workoutDays.length + 1);
  };

  const saveProgram = async () => {
    if (!programName.trim()) {
      alert("Моля въведете име на програмата");
      return;
    }

    if (selectedClients.length === 0) {
      alert("Моля изберете поне един клиент");
      return;
    }

    // Validate that each day has at least one exercise
    const emptyDays = workoutDays.filter(day => day.exercises.length === 0);
    if (emptyDays.length > 0) {
      alert("Всички дни трябва да имат поне по едно упражнение");
      return;
    }

    setSaving(true);

    try {
      // Simulate saving (в реалния проект това ще прави Supabase заявки)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Програмата "${programName}" беше създадена успешно за ${selectedClients.length} клиента!`);
      
      // Reset form
      setProgramName("");
      setProgramDescription("");
      setSelectedClients([]);
      initializeWorkoutDays();
      
    } catch (error) {
      alert("Грешка при запазване на програмата");
    } finally {
      setSaving(false);
    }
  };

  const getTotalExercises = () => {
    return workoutDays.reduce((total, day) => total + day.exercises.length, 0);
  };

  const getEstimatedTotalDuration = () => {
    return workoutDays.reduce((total, day) => total + day.estimated_duration, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => {}}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exercise Builder</h1>
              <p className="text-gray-600 mt-1">Създайте детайлни тренировъчни програми за вашите клиенти</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowExerciseLibrary(!showExerciseLibrary)}>
              <Dumbbell className="h-4 w-4 mr-2" />
              {showExerciseLibrary ? "Скрий" : "Покажи"} упражнения
            </Button>
            <Button 
              onClick={saveProgram} 
              disabled={saving || !programName.trim() || selectedClients.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Запазване..." : "Запази програма"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Program Settings */}
          <Card className="lg:col-span-1">
            <CardContent>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Настройки на програмата
              </h2>
              
              {/* Program Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="program-name">Име на програмата *</Label>
                  <Input
                    id="program-name"
                    value={programName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramName(e.target.value)}
                    placeholder="Например: Силова програма за начинаещи"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="program-description">Описание</Label>
                  <Textarea
                    id="program-description"
                    value={programDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProgramDescription(e.target.value)}
                    placeholder="Кратко описание на програмата..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="program-goals">Цели</Label>
                  <Input
                    id="program-goals"
                    value={programGoals}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramGoals(e.target.value)}
                    placeholder="Отслабване, мускулна маса, издръжливост..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="difficulty-level">Ниво</Label>
                    <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                      {difficultyLevels.map(level => (
                        <SelectItem key={level.value} value={level.value} onClick={() => {}}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration-weeks">Продължителност</Label>
                    <Select value={durationWeeks.toString()} onValueChange={(val: string) => setDurationWeeks(parseInt(val))}>
                      <SelectItem value="2" onClick={() => {}}>2 седмици</SelectItem>
                      <SelectItem value="4" onClick={() => {}}>4 седмици</SelectItem>
                      <SelectItem value="6" onClick={() => {}}>6 седмици</SelectItem>
                      <SelectItem value="8" onClick={() => {}}>8 седмици</SelectItem>
                      <SelectItem value="12" onClick={() => {}}>12 седмици</SelectItem>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="workouts-per-week">Тренировки в седмицата</Label>
                  <Select value={workoutsPerWeek.toString()} onValueChange={(val: string) => setWorkoutsPerWeek(parseInt(val))}>
                    <SelectItem value="1" onClick={() => {}}>1 тренировка</SelectItem>
                    <SelectItem value="2" onClick={() => {}}>2 тренировки</SelectItem>
                    <SelectItem value="3" onClick={() => {}}>3 тренировки</SelectItem>
                    <SelectItem value="4" onClick={() => {}}>4 тренировки</SelectItem>
                    <SelectItem value="5" onClick={() => {}}>5 тренировки</SelectItem>
                    <SelectItem value="6" onClick={() => {}}>6 тренировки</SelectItem>
                  </Select>
                </div>
              </div>

              {/* Client Selection */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Избери клиенти ({selectedClients.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {mockClients.map(client => (
                    <label key={client.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
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
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{client.full_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Program Summary */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Обобщение</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-blue-600 font-medium">Общо упражнения</p>
                    <p className="text-xl font-bold text-blue-800">{getTotalExercises()}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-green-600 font-medium">Общо време</p>
                    <p className="text-xl font-bold text-green-800">{getEstimatedTotalDuration()} мин</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Workout Builder */}
          <Card className="lg:col-span-2">
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Планиране на тренировки
                </h2>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={duplicateWorkoutDay}>
                    <Copy className="h-4 w-4 mr-1" />
                    Дублирай ден
                  </Button>
                </div>
              </div>

              {/* Day Tabs */}
              <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
                {workoutDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveDay(index)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeDay === index 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-center">
                      <div>{day.name}</div>
                      <div className="text-xs opacity-75">
                        {day.exercises.length} упр.
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Day Settings */}
              {workoutDays[activeDay] && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="workout-name">Име на тренировката</Label>
                      <Input
                        id="workout-name"
                        value={workoutDays[activeDay].name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const updatedDays = [...workoutDays];
                          updatedDays[activeDay].name = e.target.value;
                          setWorkoutDays(updatedDays);
                        }}
                        placeholder="Име на тренировката"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="workout-type">Тип тренировка</Label>
                      <Select 
                        value={workoutDays[activeDay].workout_type}
                        onValueChange={(value: string) => {
                          const updatedDays = [...workoutDays];
                          updatedDays[activeDay].workout_type = value;
                          setWorkoutDays(updatedDays);
                        }}
                      >
                        {workoutTypes.map(type => (
                          <SelectItem key={type.value} value={type.value} onClick={() => {}}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="workout-duration">Продължителност (мин)</Label>
                      <Input
                        id="workout-duration"
                        type="number"
                        value={workoutDays[activeDay].estimated_duration}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const updatedDays = [...workoutDays];
                          updatedDays[activeDay].estimated_duration = parseInt(e.target.value) || 60;
                          setWorkoutDays(updatedDays);
                        }}
                        min="15"
                        max="180"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Exercise List for Current Day */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Упражнения за {workoutDays[activeDay]?.name}
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowExerciseLibrary(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Добави упражнение
                  </Button>
                </div>

                {workoutDays[activeDay]?.exercises.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Няма добавени упражнения</h3>
                    <p className="text-gray-500 mb-4">
                      Започнете да изграждате тренировката като добавите упражнения
                    </p>
                    <Button onClick={() => setShowExerciseLibrary(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Добави първо упражнение
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workoutDays[activeDay]?.exercises.map((exercise, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                                  {index + 1}
                                </span>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {exercise.exercise.name}
                                  </h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {exercise.exercise.muscle_groups.join(", ")}
                                  </Badge>
                                  <Badge className={difficultyLevels.find(d => d.value === exercise.exercise.difficulty)?.color}>
                                    {difficultyLevels.find(d => d.value === exercise.exercise.difficulty)?.label}
                                  </Badge>
                                </div>
                                
                                {/* Exercise Parameters */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                  <div>
                                    <Label htmlFor={`sets-${index}`} className="text-xs">Сетове</Label>
                                    <Input
                                      id={`sets-${index}`}
                                      type="number"
                                      value={exercise.sets}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExerciseInWorkout(index, 'sets', parseInt(e.target.value))}
                                      min="1"
                                      max="10"
                                      className="text-sm h-8"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor={`reps-${index}`} className="text-xs">Повторения</Label>
                                    <Input
                                      id={`reps-${index}`}
                                      value={exercise.reps}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExerciseInWorkout(index, 'reps', e.target.value)}
                                      placeholder="8-12 или 30 сек"
                                      className="text-sm h-8"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor={`weight-${index}`} className="text-xs">Тегло/Интензивност</Label>
                                    <Input
                                      id={`weight-${index}`}
                                      value={exercise.weight}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExerciseInWorkout(index, 'weight', e.target.value)}
                                      placeholder="20kg или bodyweight"
                                      className="text-sm h-8"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor={`rest-${index}`} className="text-xs">Почивка (сек)</Label>
                                    <Input
                                      id={`rest-${index}`}
                                      type="number"
                                      value={exercise.rest_time}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExerciseInWorkout(index, 'rest_time', parseInt(e.target.value))}
                                      min="30"
                                      max="300"
                                      className="text-sm h-8"
                                    />
                                  </div>
                                </div>
                                
                                {/* Exercise Notes */}
                                <div className="mb-3">
                                  <Label htmlFor={`notes-${index}`} className="text-xs">Бележки</Label>
                                  <Textarea
                                    id={`notes-${index}`}
                                    value={exercise.notes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateExerciseInWorkout(index, 'notes', e.target.value)}
                                    placeholder="Специални инструкции или бележки..."
                                    className="text-sm h-16 mt-1"
                                  />
                                </div>
                                
                                {/* Exercise Instructions */}
                                {exercise.exercise.instructions?.steps && (
                                  <div className="bg-blue-50 p-3 rounded-md">
                                    <h5 className="text-xs font-semibold text-blue-800 mb-2">Инструкции:</h5>
                                    <ol className="text-xs text-blue-700 space-y-1">
                                      {exercise.exercise.instructions.steps.map((step, stepIndex) => (
                                        <li key={stepIndex} className="flex items-start gap-2">
                                          <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            {stepIndex + 1}
                                          </span>
                                          {step}
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeExerciseFromWorkout(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise Library Modal */}
        {showExerciseLibrary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Библиотека с упражнения</h2>
                <Button variant="ghost" onClick={() => setShowExerciseLibrary(false)}>
                  ✕
                </Button>
              </div>
              
              {/* Exercise Filters */}
              <div className="p-6 border-b bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      placeholder="Търси упражнения..."
                      className="pl-10"
                    />
                  </div>
                  
                  <div>
                    <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                      <SelectItem value="" onClick={() => {}}>Всички мускулни групи</SelectItem>
                      {muscleGroups.map(group => (
                        <SelectItem key={group} value={group} onClick={() => {}}>
                          {group.charAt(0).toUpperCase() + group.slice(1)}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* Exercise Grid */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExercises.map(exercise => (
                    <Card key={exercise.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{exercise.name}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={difficultyLevels.find(d => d.value === exercise.difficulty)?.color}>
                                {difficultyLevels.find(d => d.value === exercise.difficulty)?.label}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {exercise.exercise_type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              Мускули: {exercise.muscle_groups.join(", ")}
                            </p>
                            <p className="text-xs text-gray-500">
                              Оборудване: {exercise.equipment.join(", ")}
                            </p>
                          </div>
                          
                          <Button 
                            size="sm"
                            onClick={() => {
                              addExerciseToWorkout(exercise);
                              setShowExerciseLibrary(false);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {exercise.instructions?.steps && (
                          <div className="bg-gray-50 p-2 rounded text-xs">
                            <p className="font-medium mb-1">Инструкции:</p>
                            <ol className="space-y-1">
                              {exercise.instructions.steps.slice(0, 2).map((step, idx) => (
                                <li key={idx} className="text-gray-600">
                                  {idx + 1}. {step}
                                </li>
                              ))}
                              {exercise.instructions.steps.length > 2 && (
                                <li className="text-gray-500 italic">
                                  +{exercise.instructions.steps.length - 2} още стъпки...
                                </li>
                              )}
                            </ol>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {filteredExercises.length === 0 && (
                  <div className="text-center py-8">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Няма намерени упражнения</h3>
                    <p className="text-gray-500">
                      Опитайте с различни филтри или търсене
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Panel */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-600">Прогрес:</span>
                  <span className="font-semibold ml-2">
                    {workoutDays.filter(day => day.exercises.length > 0).length} / {workoutDays.length} дни завършени
                  </span>
                </div>
                
                <div className="text-sm">
                  <span className="text-gray-600">Общо упражнения:</span>
                  <span className="font-semibold ml-2">{getTotalExercises()}</span>
                </div>
                
                <div className="text-sm">
                  <span className="text-gray-600">Време на седмица:</span>
                  <span className="font-semibold ml-2">{getEstimatedTotalDuration()} мин</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Нулирай
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <Copy className="h-4 w-4 mr-1" />
                  Копирай от шаблон
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <Play className="h-4 w-4 mr-1" />
                  Преглед
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Прогрес на програмата</span>
                <span>
                  {Math.round((workoutDays.filter(day => day.exercises.length > 0).length / workoutDays.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(workoutDays.filter(day => day.exercises.length > 0).length / workoutDays.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {programName.trim() && selectedClients.length > 0 && getTotalExercises() > 0 && (
          <div className="flex justify-center gap-4 pb-8">
            <Button variant="outline" size="lg" onClick={() => {}}>
              <Save className="h-4 w-4 mr-2" />
              Запиши като чернова
            </Button>
            
            <Button 
              size="lg" 
              onClick={saveProgram}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Създаване..." : `Създай програма за ${selectedClients.length} клиента`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}