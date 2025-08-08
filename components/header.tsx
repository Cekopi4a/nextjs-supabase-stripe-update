import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/utils/supabase/server";
import { Bell, Search, User } from "lucide-react";

export default async function Header() {
  const client = await createSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  // Get user profile
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user?.id || "")
    .single();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left section - Logo for non-protected pages */}
      <div className="flex items-center">
        {!user && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-gray-900">FitnessPlatform</span>
          </Link>
        )}
        
        {/* For protected pages, we can add search or page title here */}
        {user && (
          <div className="flex items-center gap-4">
            {/* Search bar - hidden on mobile, shown on desktop for protected pages */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Търсене..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {user ? (
          /* Authenticated user header */
          <>
            {/* Mobile search toggle */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Search className="h-4 w-4" />
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </Button>

            {/* User profile section */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {profile?.full_name || "Потребител"}
                </p>
                <p className="text-xs text-gray-500 leading-tight capitalize">
                  {profile?.role || "client"}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </Button>
            </div>
          </>
        ) : (
          /* Guest user header */
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/sign-in">Вход</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Регистрация</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
