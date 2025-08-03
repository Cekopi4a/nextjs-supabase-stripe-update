// components/protected-sidebar.tsx - Обновена версия
import InPageSidebar from "@/components/in-page-sidebar";
import { createSupabaseClient } from "@/utils/supabase/server";
import { createUpdateClient } from "@/utils/update/server";

export default async function ProtectedSidebar() {
  const supabase = await createSupabaseClient();
  const updateClient = await createUpdateClient();
  
  // Get user profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Check premium access
  const { data: entitlementData } = await updateClient.entitlements.check("premium");
  const hasPremiumAccess = entitlementData?.hasAccess || false;

  // Different sidebar items based on user role
  const getMenuItems = () => {
    if (profile?.role === "trainer") {
      return [
        {
          label: "Dashboard",
          href: "/",
        },
        {
          label: "Programs",
          href: "/programs",
        },
        {
          label: "Clients",
          href: "/clients",
        },
        {
          label: "Exercises",
          href: "/exercises",
        },
        {
          label: "Calendar",
          href: "/calendar",
          disabled: true, // TODO: Implement
        },
        {
          label: "Analytics",
          href: "/analytics",
          disabled: !hasPremiumAccess,
        },
        {
          label: "Pricing",
          href: "/pricing",
        },
        {
          label: "Subscription",
          href: "/subscription",
        },
        {
          label: "Account",
          href: "/account",
        },
      ];
    } else {
      // Client menu
      return [
        {
          label: "Dashboard",
          href: "/",
        },
        {
          label: "My Programs",
          href: "/programs",
        },
        {
          label: "Workouts",
          href: "/workouts",
        },
        {
          label: "Progress",
          href: "/progress",
        },
        {
          label: "Nutrition",
          href: "/nutrition",
          disabled: true, // TODO: Implement
        },
        {
          label: "Goals",
          href: "/goals",
          disabled: true, // TODO: Implement
        },
        {
          label: "Account",
          href: "/account",
        },
      ];
    }
  };

  return (
    <InPageSidebar
      basePath="/protected"
      items={getMenuItems()}
    />
  );
}