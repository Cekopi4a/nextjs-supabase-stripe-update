// app/protected/programs/page.tsx
import { createSupabaseClient } from "@/utils/supabase/server";
import { ProgramsClient } from "./programs-client";

export default async function ProgramsPage() {
  const client = await createSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return <div>Не сте влезли в системата</div>;
  }

  // Get user profile to determine role
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div>Профилът не е намерен</div>;
  }

  // Get programs based on user role
  let activePrograms = [];
  let inactivePrograms = [];

  if (profile.role === "trainer") {
    // Trainers see programs they created - fetch both active and inactive
    const { data: active } = await client
      .from("workout_programs")
      .select(`
        *,
        profiles!workout_programs_client_id_fkey(full_name, email)
      `)
      .eq("trainer_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const { data: inactive } = await client
      .from("workout_programs")
      .select(`
        *,
        profiles!workout_programs_client_id_fkey(full_name, email)
      `)
      .eq("trainer_id", user.id)
      .eq("is_active", false)
      .order("created_at", { ascending: false });

    activePrograms = active || [];
    inactivePrograms = inactive || [];
  } else {
    // Clients see only ACTIVE programs assigned to them
    const { data: active } = await client
      .from("workout_programs")
      .select(`
        *,
        profiles!workout_programs_trainer_id_fkey(full_name, email)
      `)
      .eq("client_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    activePrograms = active || [];
  }

  return (
    <ProgramsClient
      activePrograms={activePrograms}
      inactivePrograms={inactivePrograms}
      userRole={profile.role}
    />
  );
}