import { createSupabaseClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { EditProgramForm } from "@/components/program-creation/EditProgramForm";

interface EditProgramPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProgramPage({ params }: EditProgramPageProps) {
  const { id } = await params;
  const client = await createSupabaseClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  // Get user profile to check role
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "trainer") {
    return <div>Access denied</div>;
  }

  // Get program details
  const { data: program, error } = await client
    .from("workout_programs")
    .select(`
      *,
      profiles!workout_programs_client_id_fkey(full_name, email)
    `)
    .eq("id", id)
    .eq("trainer_id", user.id) // Only allow editing own programs
    .single();

  if (error || !program) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Редактирай Програма</h1>
        <p className="text-muted-foreground mb-6">
          Редактиране на "{program.name}"
        </p>
      </div>

      <EditProgramForm program={program} />
    </div>
  );
}