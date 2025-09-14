import { createSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await createSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user profile to check if user is admin
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/protected");
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Admin Sidebar */}
      <AdminSidebar
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