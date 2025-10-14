"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { createSupabaseClient } from "@/utils/supabase/client";
import { User, LogOut, Settings, UserCircle, ChevronDown, Menu, X, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useNotifications } from "@/contexts/notification-context";
import { NotificationsDropdown } from "@/components/notifications-dropdown";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createSupabaseClient();
  const { unreadMessagesCount } = useNotifications();

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
        } else if (event === 'SIGNED_IN' || session?.user) {
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

    // Listen for route changes to refresh user state
    const handleRouteChange = () => {
      getUser();
    };

    window.addEventListener('focus', handleRouteChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleRouteChange);
    };
  }, []);

  // Re-check user when pathname changes (after navigation)
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
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
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error checking user on route change:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [pathname]);

  // Handle clicking outside the user menu
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

  // Handle clicking outside the mobile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    }

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/sign-in');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigationItems = [
    { href: '/', label: 'Начало' },
    { href: '/about', label: 'За нас' },
    { href: '/pricing', label: 'Ценоразпис' },
    { href: '/contact', label: 'Контакт' }
  ];

  return (
    <>
    <header className="bg-background/80 backdrop-blur-xl border-b border-border/50 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shadow-sm">
      {/* Left section - Logo/Menu */}
      <div className="flex items-center">
        {/* Logo and navigation for non-authenticated users */}
        {!loading && !user && (
          <>
            <Logo showText={true} href="/" className="hidden md:flex" />

            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex ml-12 space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-950/30 group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300 group-hover:w-3/4 rounded-full"></span>
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </button>
          </>
        )}

        {/* За автентифицирани потребители */}
        {!loading && user && (
          <>
            {/* Mobile Menu Button - вляво */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-10 w-10 p-0 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 rounded-xl transition-all duration-200"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('toggleMobileMenu'));
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop Logo */}
            <Logo showText={true} href="/protected" className="hidden lg:flex" />
          </>
        )}

        {/* Loading state */}
        {loading && (
          <div></div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle - always visible */}
        <div className="mr-1">
          <ThemeToggle />
        </div>

        {loading ? (
          /* Loading state */
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600/30 border-t-blue-600"></div>
          </div>
        ) : user ? (
          /* Authenticated user header */
          <>
            {/* System Notifications */}
            <NotificationsDropdown userId={user.id} />

            {/* Chat Messages */}
            <Button
              variant="ghost"
              size="sm"
              className="relative h-10 w-10 p-0 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 rounded-xl transition-all duration-200 hover:scale-105"
              onClick={() => router.push('/protected/chat')}
            >
              <MessageCircle className="h-4.5 w-4.5 text-foreground/70" />
              {/* Chat badge - показва само ако има непрочетени съобщения */}
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-lg ring-2 ring-background animate-pulse">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </Button>

            {/* User profile section */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 pl-4 ml-2 border-l border-border/50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 rounded-r-2xl py-1.5 pr-3 transition-all duration-200 hover:shadow-md group"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-foreground leading-tight group-hover:text-blue-600 transition-colors">
                    {profile?.full_name || "Потребител"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight capitalize font-medium">
                    {profile?.role || "client"}
                  </p>
                </div>
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-background group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-200 group-hover:scale-105">
                  <User className="h-5 w-5 text-white" />
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-300" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-3 w-72 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User info in dropdown */}
                  <div className="px-4 py-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-200 dark:ring-blue-800">
                        <span className="text-white font-bold text-lg">
                          {profile?.full_name?.charAt(0).toUpperCase() || "П"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {profile?.full_name || "Потребител"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border border-blue-200/50 dark:border-blue-800/50">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-400 capitalize">
                            {profile?.role || "client"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2 px-2">
                    <button
                      onClick={() => {
                        router.push('/protected/account');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 w-full text-left transition-all duration-200 rounded-xl group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                        <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Моят профил
                    </button>

                    <button
                      onClick={() => {
                        router.push('/protected/settings');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 w-full text-left transition-all duration-200 rounded-xl group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50 transition-colors">
                        <Settings className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      Настройки
                    </button>
                  </div>

                  <div className="border-t border-border/50 pt-2 px-2 mt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 w-full text-left transition-all duration-200 rounded-xl group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                        <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
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
            <Button
              variant="ghost"
              size="sm"
              className="relative overflow-hidden group border border-transparent hover:border-blue-200 dark:hover:border-blue-800 font-semibold transition-all duration-300 rounded-xl px-5 hover:shadow-lg hover:scale-[1.02] active:scale-95"
              asChild
            >
              <Link href="/sign-in" className="relative z-10">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-cyan-600 transition-all duration-300">
                  Вход
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-xl" />
              </Link>
            </Button>
            <Button
              size="sm"
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 dark:hover:shadow-blue-500/30 font-semibold transition-all duration-300 hover:scale-105 active:scale-95 rounded-xl group"
              asChild
            >
              <Link href="/sign-up" className="relative z-10">
                Регистрация
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
    
    {/* Mobile Navigation Menu */}
    {!loading && !user && showMobileMenu && (
      <div
        ref={mobileMenuRef}
        className="fixed inset-x-0 top-16 bg-background/95 backdrop-blur-xl border-b border-border/50 z-30 lg:hidden shadow-xl animate-in slide-in-from-top-4 duration-300"
      >
        <nav className="px-4 py-6 space-y-2">
          {navigationItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3.5 rounded-xl text-foreground hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 transition-all duration-200 font-medium hover:pl-5 hover:shadow-sm"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile Auth Buttons */}
          <div className="pt-6 mt-4 border-t border-border/50 space-y-3">
            <Button
              variant="outline"
              className="w-full border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 font-medium h-11 rounded-xl hover:shadow-md transition-all duration-200"
              asChild
            >
              <Link href="/sign-in">Вход в акаунта</Link>
            </Button>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl font-semibold h-11 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              asChild
            >
              <Link href="/sign-up">Създай акаунт безплатно</Link>
            </Button>
          </div>
        </nav>
      </div>
    )}
    </>
  );
}
