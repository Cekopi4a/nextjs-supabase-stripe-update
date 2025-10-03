"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { createSupabaseClient } from "@/utils/supabase/client";
import { Bell, User, LogOut, Settings, UserCircle, ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
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
    <header className="bg-background/95 backdrop-blur-sm border-b border-border h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      {/* Left section - Logo/Menu */}
      <div className="flex items-center">
        {/* Logo and navigation for non-authenticated users */}
        {!loading && !user && (
          <>
            <Logo showText={true} href="/" className="hidden md:flex" />

            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex ml-10 space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-foreground hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
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
              className="lg:hidden h-9 w-9 p-0 hover:bg-muted"
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
      <div className="flex items-center gap-3">
        {/* Theme Toggle - always visible */}
        <ThemeToggle />
        
        {loading ? (
          /* Loading state */
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
          </div>
        ) : user ? (
          /* Authenticated user header */
          <>
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hover:bg-blue-50/50">
              <Bell className="h-4 w-4" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg">
                2
              </span>
            </Button>

            {/* User profile section */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 pl-3 border-l border-border hover:bg-blue-50/50 rounded-r-xl py-2 px-3 transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {profile?.full_name || "Потребител"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight capitalize">
                    {profile?.role || "client"}
                  </p>
                </div>
                <div className="h-9 w-9 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-background rounded-lg shadow-lg border border-border py-2 z-50">
                  {/* User info in dropdown */}
                  <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {profile?.full_name?.charAt(0).toUpperCase() || "П"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {profile?.full_name || "Потребител"}
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">
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
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted w-full text-left transition-colors"
                    >
                      <UserCircle className="h-4 w-4" />
                      Моят профил
                    </button>
                    
                    <button
                      onClick={() => {
                        router.push('/protected/settings');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted w-full text-left transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Настройки
                    </button>
                  </div>

                  <div className="border-t border-border pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 w-full text-left transition-colors"
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
            <Button variant="outline" size="sm" className="border-blue-200 hover:border-blue-300 hover:bg-blue-50/50" asChild>
              <Link href="/sign-in">Вход</Link>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg" asChild>
              <Link href="/sign-up">Регистрация</Link>
            </Button>
          </>
        )}
      </div>
    </header>
    
    {/* Mobile Navigation Menu */}
    {!loading && !user && showMobileMenu && (
      <div 
        ref={mobileMenuRef}
        className="fixed inset-x-0 top-16 bg-background/95 backdrop-blur-sm border-b border-border z-30 lg:hidden"
      >
        <nav className="px-4 py-6 space-y-2">
          {navigationItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3 rounded-xl text-foreground hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 font-medium"
            >
              {item.label}
            </Link>
          ))}
          
          {/* Mobile Auth Buttons */}
          <div className="pt-4 mt-4 border-t border-border space-y-3">
            <Button variant="outline" className="w-full border-blue-200 hover:border-blue-300 hover:bg-blue-50/50" asChild>
              <Link href="/sign-in">Вход в акаунта</Link>
            </Button>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg" asChild>
              <Link href="/sign-up">Създай акаунт безплатно</Link>
            </Button>
          </div>
        </nav>
      </div>
    )}
    </>
  );
}
