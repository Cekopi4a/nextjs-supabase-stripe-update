"use client";

import { useState } from "react";
import { EnhancedCalendar } from "@/components/program-creation/EnhancedCalendar";
import { DayEditorSection } from "@/components/program-creation/DayEditorSection";
import { DayType } from "@/components/program-creation/DayOptionsModal";
import { WorkoutExercise } from "@/app/protected/programs/create/step2/page";

interface WorkoutDay {
  day_of_week: number;
  name: string;
  exercises: WorkoutExercise[];
  estimated_duration: number;
  workout_type: string;
  status?: 'assigned' | 'completed' | 'skipped';
}

interface RestDay {
  name: string;
  description: string;
}

interface WorkoutCalendarWithEditorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
  programStartDate: Date;
  programDurationWeeks: number;
  dayTypes: Record<string, DayType>;
  workoutsByDate: Record<string, WorkoutDay>;
  restDaysByDate: Record<string, RestDay>;
  onSaveWorkout: (date: Date, workout: WorkoutDay) => void;
  onSaveRestDay: (date: Date, restDay: RestDay) => void;
  onUpdateWorkoutStatus: (date: Date, status: 'assigned' | 'completed' | 'skipped') => void;
  onSetDayType?: (date: Date, type: DayType) => void;
  onAddExerciseFromLibrary?: (exerciseId: string) => void;
  onSelectedDateChange?: (date: Date | null) => void;
  isTrainer: boolean;
  availableExercises?: any[];
}

export function WorkoutCalendarWithEditor({
  currentDate,
  onDateChange,
  view,
  onViewChange,
  programStartDate,
  programDurationWeeks,
  dayTypes,
  workoutsByDate,
  restDaysByDate,
  onSaveWorkout,
  onSaveRestDay,
  onUpdateWorkoutStatus,
  onSetDayType,
  onAddExerciseFromLibrary,
  onSelectedDateChange,
  isTrainer,
  availableExercises = []
}: WorkoutCalendarWithEditorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Ensure restDaysByDate is always defined
  const safeRestDaysByDate = restDaysByDate || {};

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Notify parent about selected date change
    if (onSelectedDateChange) {
      onSelectedDateChange(date);
    }
  };

  const handleDayTypeChange = (date: Date, type: DayType) => {
    if (onSetDayType) {
      onSetDayType(date, type);
    }
  };

  const handleAddExerciseFromLibrary = (exercise: any) => {
    if (!selectedDate) return;
    
    // Call the parent function to add exercise
    if (onAddExerciseFromLibrary) {
      onAddExerciseFromLibrary(exercise.id);
    }
  };

  // Transform workoutsByDate for calendar display
  const workoutsForCalendar: Record<string, unknown[]> = {};
  Object.entries(workoutsByDate).forEach(([dateKey, workout]) => {
    workoutsForCalendar[dateKey] = workout.exercises;
  });

  const selectedDateKey = selectedDate?.toISOString().split('T')[0];
  const selectedWorkout = selectedDateKey ? workoutsByDate[selectedDateKey] : undefined;
  const selectedRestDay = selectedDateKey ? safeRestDaysByDate[selectedDateKey] : undefined;
  const selectedDayType = selectedDateKey ? dayTypes[selectedDateKey] : undefined;

  return (
    <div className="space-y-6">
      {/* Enhanced Calendar */}
      <EnhancedCalendar
        currentDate={currentDate}
        onDateChange={onDateChange}
        view={view}
        onViewChange={onViewChange}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        programStartDate={programStartDate}
        programDurationWeeks={programDurationWeeks}
        dayTypes={dayTypes}
        workoutsByDate={workoutsForCalendar}
      />

      {/* Day Editor Section */}
      <DayEditorSection
        selectedDate={selectedDate}
        dayType={selectedDayType}
        workout={selectedWorkout}
        restDay={selectedRestDay}
        isTrainer={isTrainer}
        availableExercises={availableExercises}
        onDayTypeChange={handleDayTypeChange}
        onSaveWorkout={onSaveWorkout}
        onSaveRestDay={onSaveRestDay}
      />
    </div>
  );
}