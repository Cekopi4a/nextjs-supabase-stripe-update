"use client";

import { useState } from "react";
import { EnhancedCalendar } from "@/components/program-creation/EnhancedCalendar";
import { DayWorkoutInlineEditor } from "@/components/program-creation/DayWorkoutInlineEditor";
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

interface WorkoutCalendarWithEditorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
  programStartDate: Date;
  programDurationWeeks: number;
  dayTypes: Record<string, DayType>;
  workoutsByDate: Record<string, WorkoutDay>;
  onSaveWorkout: (date: Date, workout: WorkoutDay) => void;
  onUpdateWorkoutStatus: (date: Date, status: 'assigned' | 'completed' | 'skipped') => void;
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
  onSaveWorkout,
  onUpdateWorkoutStatus,
  isTrainer,
  availableExercises = []
}: WorkoutCalendarWithEditorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingDate, setEditingDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setEditingDate(null);
  };

  const handleStartEdit = () => {
    if (selectedDate) {
      setEditingDate(selectedDate);
    }
  };

  const handleSaveWorkout = (workout: WorkoutDay) => {
    if (editingDate) {
      onSaveWorkout(editingDate, workout);
      setEditingDate(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingDate(null);
  };

  const handleStatusUpdate = (status: 'assigned' | 'completed' | 'skipped') => {
    if (selectedDate) {
      onUpdateWorkoutStatus(selectedDate, status);
    }
  };

  // Transform workoutsByDate for calendar display
  const workoutsForCalendar: Record<string, unknown[]> = {};
  Object.entries(workoutsByDate).forEach(([dateKey, workout]) => {
    workoutsForCalendar[dateKey] = workout.exercises;
  });

  const selectedDateKey = selectedDate?.toISOString().split('T')[0];
  const selectedWorkout = selectedDateKey ? workoutsByDate[selectedDateKey] : undefined;
  const isEditing = editingDate?.toDateString() === selectedDate?.toDateString();

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

      {/* Day Workout Editor */}
      {selectedDate && (
        <div className="mt-6">
          <DayWorkoutInlineEditor
            date={selectedDate}
            workout={selectedWorkout}
            isTrainer={isTrainer}
            isEditing={isEditing}
            onStartEdit={handleStartEdit}
            onSave={handleSaveWorkout}
            onCancel={handleCancelEdit}
            onUpdateStatus={!isTrainer ? handleStatusUpdate : undefined}
            availableExercises={availableExercises}
          />
        </div>
      )}
    </div>
  );
}