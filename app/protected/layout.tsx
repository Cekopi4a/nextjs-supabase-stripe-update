import LeftSidebar from "@/components/left-sidebar";
import { createSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await createSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  // If no user, redirect to sign-in (backup to middleware)
  if (!user) {
    redirect("/sign-in");
  }

  // Get user profile for sidebar props
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get clients count and subscription info if user is trainer
  let clientsCount = 0;
  let hasPremiumAccess = false;
  let planType = "free";
  
  if (profile?.role === "trainer") {
    const { data: trainerClients } = await client
      .from("trainer_clients")
      .select("client_id")
      .eq("trainer_id", user.id)
      .eq("status", "active");
    
    clientsCount = trainerClients?.length || 0;

    // Get subscription info
    const { data: subscription } = await client
      .from("trainer_subscriptions")
      .select("plan_type")
      .eq("trainer_id", user.id)
      .single();

    planType = subscription?.plan_type || "free";
    hasPremiumAccess = planType === "pro" || planType === "beast";
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Left Sidebar */}
      <LeftSidebar
        userRole={profile?.role as "trainer" | "client" | "admin" || "client"}
        hasPremiumAccess={hasPremiumAccess}
        userProfile={{
          full_name: profile?.full_name,
          email: profile?.email || user?.email,
          avatar_url: profile?.avatar_url
        }}
        clientsCount={clientsCount}
        planType={planType as "free" | "pro" | "beast"}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 max-w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}