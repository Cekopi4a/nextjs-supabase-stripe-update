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

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Left Sidebar */}
      <LeftSidebar 
        userRole={profile?.role as "trainer" | "client" || "client"}
        hasPremiumAccess={false} // TODO: Get from subscription data
        userProfile={{
          full_name: profile?.full_name,
          email: profile?.email || user?.email
        }}
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