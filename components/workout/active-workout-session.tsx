"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Dumbbell,
  Timer,
  Play,
  Pause,
  SkipForward,
  X,
  ChevronLeft,
  ChevronRight,
  Trophy
} from "lucide-react";

interface Exercise {
  id?: string;
  exercise_id: string;
  exercise?: {
    id: string;
    name: string;
    primary_muscles: string[];
    secondary_muscles: string[];
    equipment: string;
    level: string;
    images: string[];
    custom_images: string[];
    video_urls?: string[];
  };
  planned_sets: number;
  planned_reps: string;
  planned_weight?: string;
  rest_time: number;
  notes?: string;
  order: number;
}

interface ActiveWorkoutSessionProps {
  workoutId: string;
  workoutName: string;
  exercises: Exercise[];
  onComplete: (duration: number) => void;
  onCancel: () => void;
}

interface SetProgress {
  exerciseIndex: number;
  setNumber: number;
  completed: boolean;
}

export function ActiveWorkoutSession({
  workoutId,
  workoutName,
  exercises,
  onComplete,
  onCancel
}: ActiveWorkoutSessionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState<SetProgress[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [isRestingBetweenExercises, setIsRestingBetweenExercises] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [workoutStartTime] = useState(Date.now());
  const [showCongratulations, setShowCongratulations] = useState(false);

  const EXERCISE_REST_TIME = 90; // 90 seconds rest between exercises

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const progress = ((currentExerciseIndex) / totalExercises) * 100;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive && restTimeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setIsResting(false);

            // If we were resting between exercises, move to next exercise
            if (isRestingBetweenExercises) {
              setIsRestingBetweenExercises(false);
              setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
              setCurrentSet(1);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerActive, restTimeRemaining, isRestingBetweenExercises]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isSetCompleted = (exerciseIndex: number, setNumber: number) => {
    return completedSets.some(
      (s) => s.exerciseIndex === exerciseIndex && s.setNumber === setNumber && s.completed
    );
  };

  const handleSetComplete = (setNumber: number) => {
    // Mark set as completed
    setCompletedSets([
      ...completedSets,
      {
        exerciseIndex: currentExerciseIndex,
        setNumber,
        completed: true
      }
    ]);

    // Check if this was the last set for this exercise
    if (setNumber === currentExercise.planned_sets) {
      // Check if this was the last exercise too
      if (currentExerciseIndex === totalExercises - 1) {
        // Last set of last exercise - show congratulations!
        setTimeout(() => {
          setShowCongratulations(true);
        }, 500);
      } else {
        // Start rest timer between exercises
        setRestTimeRemaining(EXERCISE_REST_TIME);
        setIsResting(true);
        setIsRestingBetweenExercises(true);
        setTimerActive(true);
      }
    } else {
      // Start rest timer for next set
      setCurrentSet(setNumber + 1);
      setRestTimeRemaining(currentExercise.rest_time);
      setIsResting(true);
      setIsRestingBetweenExercises(false);
      setTimerActive(true);
    }
  };

  const handleSkipRest = () => {
    // If skipping rest between exercises, move to next exercise
    if (isRestingBetweenExercises) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setIsRestingBetweenExercises(false);
    }

    setIsResting(false);
    setTimerActive(false);
    setRestTimeRemaining(0);
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentSet(1);
      setIsResting(false);
      setTimerActive(false);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setIsResting(false);
      setTimerActive(false);
    }
  };

  const handleWorkoutComplete = async () => {
    const duration = Math.round((Date.now() - workoutStartTime) / 60000); // minutes
    await onComplete(duration);
  };

  if (!currentExercise && !showCongratulations) {
    return null;
  }

  // Congratulations screen
  if (showCongratulations) {
    const duration = Math.round((Date.now() - workoutStartTime) / 60000);
    const totalSets = completedSets.length;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl">
          <div className="p-8 space-y-6 text-center">
            {/* Trophy Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Trophy className="h-16 w-16 text-white" />
              </div>
            </div>

            {/* Congratulations Message */}
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-green-600">Браво!</h2>
              <p className="text-2xl font-semibold">Завърши тренировката!</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 py-6">
              <Card className="p-4 bg-blue-50 dark:bg-blue-950">
                <p className="text-sm text-muted-foreground">Време</p>
                <p className="text-2xl font-bold">{duration} мин</p>
              </Card>
              <Card className="p-4 bg-green-50 dark:bg-green-950">
                <p className="text-sm text-muted-foreground">Серии</p>
                <p className="text-2xl font-bold">{totalSets}</p>
              </Card>
              <Card className="p-4 bg-purple-50 dark:bg-purple-950">
                <p className="text-sm text-muted-foreground">Упражнения</p>
                <p className="text-2xl font-bold">{totalExercises}</p>
              </Card>
              <Card className="p-4 bg-orange-50 dark:bg-orange-950">
                <p className="text-sm text-muted-foreground">Прогрес</p>
                <p className="text-2xl font-bold">100%</p>
              </Card>
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-4 rounded-lg">
              <p className="text-lg font-medium">
                Продължавай в същия дух! Всяка тренировка те прави по-силен! 💪
              </p>
            </div>

            {/* Action Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg py-6"
              onClick={handleWorkoutComplete}
            >
              Завърши и затвори
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{workoutName}</h2>
              <p className="text-muted-foreground">
                Упражнение {currentExerciseIndex + 1} от {totalExercises}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогрес</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Rest Timer */}
          {isResting && (
            <Card className={`p-6 ${isRestingBetweenExercises ? 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800' : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'}`}>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Timer className={`h-6 w-6 ${isRestingBetweenExercises ? 'text-purple-600' : 'text-blue-600'}`} />
                  <h3 className="text-xl font-semibold">
                    {isRestingBetweenExercises ? 'Почивка между упражнения' : 'Почивка между серии'}
                  </h3>
                </div>

                {isRestingBetweenExercises && (
                  <p className="text-sm text-muted-foreground">
                    Следващо: {exercises[currentExerciseIndex + 1]?.exercise?.name}
                  </p>
                )}

                <div className={`text-5xl font-bold ${isRestingBetweenExercises ? 'text-purple-600' : 'text-blue-600'}`}>
                  {formatTime(restTimeRemaining)}
                </div>

                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setTimerActive(!timerActive)}
                  >
                    {timerActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Пауза
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Старт
                      </>
                    )}
                  </Button>

                  <Button onClick={handleSkipRest}>
                    <SkipForward className="h-4 w-4 mr-2" />
                    Прескочи
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Current Exercise */}
          {!isResting && (
            <div className="space-y-6">
              {/* Exercise Info */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Dumbbell className="h-8 w-8 text-blue-600" />
                  <h3 className="text-3xl font-bold">
                    {currentExercise.exercise?.name || 'Неизвестно упражнение'}
                  </h3>
                </div>

                {/* Exercise Image */}
                {(() => {
                  const exerciseImage =
                    currentExercise.exercise?.custom_images?.[0] ||
                    currentExercise.exercise?.images?.[0];

                  return exerciseImage && (
                    <div className="flex justify-center">
                      <img
                        src={exerciseImage}
                        alt={currentExercise.exercise?.name}
                        className="max-w-md w-full h-64 object-cover rounded-lg"
                        onError={(e) => {
                          // Hide image if it fails to load
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  );
                })()}

                {/* Exercise Details */}
                <div className="flex justify-center gap-4 flex-wrap">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {currentExercise.planned_sets} серии
                  </Badge>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {currentExercise.planned_reps} повторения
                  </Badge>
                  {currentExercise.planned_weight && (
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {currentExercise.planned_weight} кг
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Почивка: {currentExercise.rest_time}сек
                  </Badge>
                </div>

                {/* Muscle Groups */}
                {currentExercise.exercise?.primary_muscles && currentExercise.exercise.primary_muscles.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Основни мускули: </span>
                    {currentExercise.exercise.primary_muscles.join(', ')}
                  </div>
                )}

                {currentExercise.exercise?.secondary_muscles && currentExercise.exercise.secondary_muscles.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Вторични мускули: </span>
                    {currentExercise.exercise.secondary_muscles.join(', ')}
                  </div>
                )}

                {/* Notes */}
                {currentExercise.notes && (
                  <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm">
                      <span className="font-medium">Бележка: </span>
                      {currentExercise.notes}
                    </p>
                  </Card>
                )}
              </div>

              {/* Sets Tracker */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-center">
                  Серия {currentSet} от {currentExercise.planned_sets}
                </h4>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {Array.from({ length: currentExercise.planned_sets }, (_, i) => {
                    const setNumber = i + 1;
                    const completed = isSetCompleted(currentExerciseIndex, setNumber);
                    const isCurrent = setNumber === currentSet;

                    return (
                      <Button
                        key={setNumber}
                        variant={completed ? "default" : isCurrent ? "outline" : "ghost"}
                        className={`h-20 flex flex-col gap-2 ${
                          completed
                            ? "bg-green-600 hover:bg-green-700"
                            : isCurrent
                            ? "border-2 border-blue-600"
                            : ""
                        }`}
                        onClick={() => !completed && handleSetComplete(setNumber)}
                        disabled={setNumber !== currentSet || completed}
                      >
                        {completed ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                        <span className="text-sm font-medium">Серия {setNumber}</span>
                      </Button>
                    );
                  })}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  {isSetCompleted(currentExerciseIndex, currentSet)
                    ? "Серията е завършена! Почивайте..."
                    : "Кликнете на серията след като я завършите"}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-2 justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousExercise}
              disabled={currentExerciseIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Предишно
            </Button>

            <Button
              variant="outline"
              onClick={onCancel}
            >
              Прекрати тренировката
            </Button>

            <Button
              variant="outline"
              onClick={handleNextExercise}
              disabled={currentExerciseIndex === totalExercises - 1}
            >
              Следващо
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
