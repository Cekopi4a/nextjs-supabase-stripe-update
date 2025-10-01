// app/protected/page.tsx - Заменяме съществуващата страница
import { createSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ClientDashboard from "@/components/fitness/client-dashboard";
import TrainerDashboard from "@/components/fitness/trainer-dashboard";

export default async function ProtectedPage() {
  const client = await createSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user profile to determine role
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Необходима настройка на профил</h2>
          <p className="text-muted-foreground">
            Моля, завършете настройката на профила си, за да продължите.
          </p>
        </div>
      </div>
    );
  }

  // Render different dashboards based on user role
  if (profile.role === "admin") {
    // Redirect admin to admin dashboard
    redirect("/admin");
  }

  if (profile.role === "trainer") {
    return <TrainerDashboard user={user} profile={profile} />;
  }

  // Default to client dashboard
  return <ClientDashboard user={user} profile={profile} />;
}