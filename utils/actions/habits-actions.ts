// Habits Actions
// Server actions for habit tracking functionality

"use server";

import { createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface ClientHabit {
  id: string;
  client_id: string;
  habit_type: string;
  title: string;
  description?: string;
  target_value?: number;
  unit?: string;
  frequency: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  client_id: string;
  log_date: string;
  completed: boolean;
  actual_value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HabitWithProgress extends ClientHabit {
  streak?: number;
  todayLog?: HabitLog;
  completionRate?: number;
}

/**
 * Get all habits for the current user
 */
export async function getClientHabits(): Promise<{ habits: HabitWithProgress[]; error?: string }> {
  const supabase = await createSupabaseClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { habits: [], error: "Not authenticated" };
  }

  const { data: habits, error } = await supabase
    .from("client_habits")
    .select("*")
    .eq("client_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching habits:", error);
    return { habits: [], error: error.message };
  }

  // Fetch today's logs for all habits
  const today = new Date().toISOString().split("T")[0];
  const { data: todayLogs } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("client_id", user.id)
    .eq("log_date", today);

  // Combine habits with their logs
  const habitsWithProgress: HabitWithProgress[] = (habits || []).map((habit) => {
    const todayLog = todayLogs?.find((log) => log.habit_id === habit.id);
    return {
      ...habit,
      todayLog,
    };
  });

  return { habits: habitsWithProgress };
}

/**
 * Create a new habit
 */
export async function createHabit(habitData: {
  habit_type: string;
  title: string;
  description?: string;
  target_value?: number;
  unit?: string;
  frequency?: string;
  icon?: string;
  color?: string;
}): Promise<{ success: boolean; habit?: ClientHabit; error?: string }> {
  const supabase = await createSupabaseClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("client_habits")
    .insert({
      client_id: user.id,
      ...habitData,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating habit:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/protected/habits");
  return { success: true, habit: data };
}

/**
 * Update a habit
 */
export async function updateHabit(
  habitId: string,
  updates: Partial<ClientHabit>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("client_habits")
    .update(updates)
    .eq("id", habitId)
    .eq("client_id", user.id);

  if (error) {
    console.error("Error updating habit:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/protected/habits");
  return { success: true };
}

/**
 * Delete a habit (soft delete by setting is_active = false)
 */
export async function deleteHabit(habitId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("client_habits")
    .update({ is_active: false })
    .eq("id", habitId)
    .eq("client_id", user.id);

  if (error) {
    console.error("Error deleting habit:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/protected/habits");
  return { success: true };
}

/**
 * Log a habit for a specific date
 */
export async function logHabit(
  habitId: string,
  logDate: string,
  data: {
    completed: boolean;
    actual_value?: number;
    notes?: string;
  }
): Promise<{ success: boolean; log?: HabitLog; error?: string }> {
  const supabase = await createSupabaseClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Upsert the log (insert or update if exists)
  const { data: logData, error } = await supabase
    .from("habit_logs")
    .upsert(
      {
        habit_id: habitId,
        client_id: user.id,
        log_date: logDate,
        ...data,
      },
      { onConflict: "habit_id,log_date" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error logging habit:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/protected/habits");
  revalidatePath("/protected");
  return { success: true, log: logData };
}

/**
 * Get habit logs for a specific period
 */
export async function getHabitLogs(
  habitId: string,
  startDate: string,
  endDate: string
): Promise<{ logs: HabitLog[]; error?: string }> {
  const supabase = await createSupabaseClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { logs: [], error: "Not authenticated" };
  }

  const { data: logs, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .eq("client_id", user.id)
    .gte("log_date", startDate)
    .lte("log_date", endDate)
    .order("log_date", { ascending: false });

  if (error) {
    console.error("Error fetching habit logs:", error);
    return { logs: [], error: error.message };
  }

  return { logs: logs || [] };
}

/**
 * Get habit streak (consecutive days completed)
 */
export async function getHabitStreak(habitId: string): Promise<{ streak: number; error?: string }> {
  const supabase = await createSupabaseClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { streak: 0, error: "Not authenticated" };
  }

  const { data, error } = await supabase.rpc("calculate_habit_streak", {
    p_habit_id: habitId,
    p_client_id: user.id,
  });

  if (error) {
    console.error("Error calculating streak:", error);
    return { streak: 0, error: error.message };
  }

  return { streak: data || 0 };
}

/**
 * Get habit completion rate for a period
 */
export async function getHabitCompletionRate(
  habitId: string,
  days: number = 7
): Promise<{ rate: number; error?: string }> {
  const supabase = await createSupabaseClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { rate: 0, error: "Not authenticated" };
  }

  const { data, error } = await supabase.rpc("get_habit_completion_rate", {
    p_habit_id: habitId,
    p_client_id: user.id,
    p_days: days,
  });

  if (error) {
    console.error("Error calculating completion rate:", error);
    return { rate: 0, error: error.message };
  }

  return { rate: data || 0 };
}

/**
 * Get all logs for today
 */
export async function getTodayHabitLogs(): Promise<{ logs: HabitLog[]; error?: string }> {
  const supabase = await createSupabaseClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { logs: [], error: "Not authenticated" };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: logs, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("client_id", user.id)
    .eq("log_date", today);

  if (error) {
    console.error("Error fetching today's logs:", error);
    return { logs: [], error: error.message };
  }

  return { logs: logs || [] };
}

/**
 * Predefined habit templates
 */
export const HABIT_TEMPLATES = [
  {
    habit_type: "water",
    title: "Изпий 8 чаши вода",
    target_value: 8,
    unit: "чаши",
    icon: "💧",
    color: "blue",
    description: "Поддържай хидратацията си през деня",
  },
  {
    habit_type: "sleep",
    title: "Спи 7-8 часа",
    target_value: 8,
    unit: "часа",
    icon: "😴",
    color: "purple",
    description: "Качествен сън за добро възстановяване",
  },
  {
    habit_type: "steps",
    title: "Изминай 10,000 стъпки",
    target_value: 10000,
    unit: "стъпки",
    icon: "👟",
    color: "green",
    description: "Бъди активен всеки ден",
  },
  {
    habit_type: "protein",
    title: "Изяж достатъчно протеин",
    target_value: 140,
    unit: "g",
    icon: "🥩",
    color: "red",
    description: "Важно за мускулния растеж",
  },
  {
    habit_type: "meditation",
    title: "Медитирай 10 минути",
    target_value: 10,
    unit: "мин",
    icon: "🧘",
    color: "orange",
    description: "Спокойствие и фокус",
  },
  {
    habit_type: "stretching",
    title: "Разтягане",
    target_value: 15,
    unit: "мин",
    icon: "🤸",
    color: "cyan",
    description: "Подобри гъвкавостта си",
  },
];
