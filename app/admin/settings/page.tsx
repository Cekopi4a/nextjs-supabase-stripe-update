import { createSupabaseClient } from "@/utils/supabase/server";
import AdminSettingsPage from "@/components/admin/admin-settings-page";

export default async function SettingsPage() {
  const client = await createSupabaseClient();

  // Get all admin settings
  const { data: allSettings } = await client
    .from("admin_settings")
    .select("*")
    .order("setting_key");

  return <AdminSettingsPage settings={allSettings || []} />;
}