import { createSupabaseClient } from "@/utils/supabase/server";

export type NotificationType =
  | "program_created"
  | "program_updated"
  | "program_deleted"
  | "workout_created"
  | "workout_updated"
  | "workout_deleted"
  | "nutrition_plan_created"
  | "nutrition_plan_updated"
  | "nutrition_plan_deleted"
  | "general";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user
 * This function should be called from server-side code only
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        metadata: params.metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error };
    }

    console.log("✅ Notification created:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Exception creating notification:", error);
    return { success: false, error };
  }
}

/**
 * Notify client about new training program
 */
export async function notifyProgramCreated(
  clientId: string,
  programName: string,
  programId: string,
  trainerName: string
) {
  return createNotification({
    userId: clientId,
    type: "program_created",
    title: "Нова тренировъчна програма",
    message: `${trainerName} ви създаде нова програма: "${programName}"`,
    link: `/protected/programs/${programId}`,
    metadata: {
      program_id: programId,
      program_name: programName,
      trainer_name: trainerName,
    },
  });
}

/**
 * Notify client about program update
 */
export async function notifyProgramUpdated(
  clientId: string,
  programName: string,
  programId: string,
  trainerName: string
) {
  return createNotification({
    userId: clientId,
    type: "program_updated",
    title: "Актуализирана програма",
    message: `${trainerName} направи промени в програмата: "${programName}"`,
    link: `/protected/programs/${programId}`,
    metadata: {
      program_id: programId,
      program_name: programName,
      trainer_name: trainerName,
    },
  });
}

/**
 * Notify client about workout creation
 */
export async function notifyWorkoutCreated(
  clientId: string,
  workoutName: string,
  workoutId: string,
  scheduledDate: string,
  trainerName: string
) {
  return createNotification({
    userId: clientId,
    type: "workout_created",
    title: "Нова тренировка",
    message: `${trainerName} ви зададе нова тренировка: "${workoutName}" за ${scheduledDate}`,
    link: `/protected/calendar`,
    metadata: {
      workout_id: workoutId,
      workout_name: workoutName,
      scheduled_date: scheduledDate,
      trainer_name: trainerName,
    },
  });
}

/**
 * Notify client about workout update
 */
export async function notifyWorkoutUpdated(
  clientId: string,
  workoutName: string,
  workoutId: string,
  scheduledDate: string,
  trainerName: string
) {
  return createNotification({
    userId: clientId,
    type: "workout_updated",
    title: "Актуализирана тренировка",
    message: `${trainerName} направи промени в тренировката: "${workoutName}" за ${scheduledDate}`,
    link: `/protected/calendar`,
    metadata: {
      workout_id: workoutId,
      workout_name: workoutName,
      scheduled_date: scheduledDate,
      trainer_name: trainerName,
    },
  });
}

/**
 * Notify client about nutrition plan creation
 */
export async function notifyNutritionPlanCreated(
  clientId: string,
  planName: string,
  planId: string,
  trainerName: string
) {
  return createNotification({
    userId: clientId,
    type: "nutrition_plan_created",
    title: "Нов хранителен план",
    message: `${trainerName} ви създаде нов хранителен план: "${planName}"`,
    link: `/protected/nutrition-plans/${planId}`,
    metadata: {
      plan_id: planId,
      plan_name: planName,
      trainer_name: trainerName,
    },
  });
}

/**
 * Notify client about nutrition plan update
 */
export async function notifyNutritionPlanUpdated(
  clientId: string,
  planName: string,
  planId: string,
  trainerName: string
) {
  return createNotification({
    userId: clientId,
    type: "nutrition_plan_updated",
    title: "Актуализиран хранителен план",
    message: `${trainerName} направи промени в хранителния план: "${planName}"`,
    link: `/protected/nutrition-plans/${planId}`,
    metadata: {
      plan_id: planId,
      plan_name: planName,
      trainer_name: trainerName,
    },
  });
}

/**
 * Create a general notification
 */
export async function notifyGeneral(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  return createNotification({
    userId,
    type: "general",
    title,
    message,
    link,
  });
}
