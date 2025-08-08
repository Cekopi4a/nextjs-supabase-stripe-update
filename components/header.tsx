"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/utils/supabase/client";
import { Bell, Search, User, LogOut, Settings, UserCircle, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (session?.user) {
          setUser(session.user);
          setLoading(false);
          // Fetch profile for the new user
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            setProfile(profile);
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle clicking outside the menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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
        {loading ? (
          /* Loading state */
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
          </div>
        ) : user ? (
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
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 border-l border-gray-200 hover:bg-gray-50 rounded-r-lg py-2 px-2 transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {profile?.full_name || "Потребител"}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight capitalize">
                    {profile?.role || "client"}
                  </p>
                </div>
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* User info in dropdown */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {profile?.full_name?.charAt(0).toUpperCase() || "П"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {profile?.full_name || "Потребител"}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {profile?.role || "client"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        router.push('/protected/account');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                    >
                      <UserCircle className="h-4 w-4" />
                      Моят профил
                    </button>
                    
                    <button
                      onClick={() => {
                        router.push('/protected/settings');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Настройки
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Изход
                    </button>
                  </div>
                </div>
              )}
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
