// components/protected-sidebar.tsx - Подобрен Right Sidebar
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Dumbbell, 
  Calendar, 
  BarChart3, 
  Settings, 
  User,
  Target,
  Apple,
  CreditCard,
  Crown,
  BookOpen,
  Menu,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  badge?: string;
  isPro?: boolean;
};

// Mock user role - replace with actual data
const userRole = "trainer"; // or "client"
const hasPremiumAccess = false;

export default function ProtectedSidebar() {
  const pathname = usePathname();
  const basePath = "/protected";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getMenuItems = (): MenuItem[] => {
    if (userRole === "trainer") {
      return [
        {
          label: "Начало",
          href: "/",
          icon: Home,
        },
        {
          label: "Клиенти",
          href: "/clients",
          icon: Users,
          badge: "3",
        },
        {
          label: "Програми",
          href: "/programs",
          icon: BookOpen,
        },
        {
          label: "Упражнения",
          href: "/exercises",
          icon: Dumbbell,
        },
        {
          label: "Календар",
          href: "/calendar",
          icon: Calendar,
          disabled: true,
        },
        {
          label: "Аналитика",
          href: "/analytics",
          icon: BarChart3,
          disabled: !hasPremiumAccess,
          isPro: true,
        },
        {
          label: "Абонамент",
          href: "/subscription",
          icon: CreditCard,
        },
        {
          label: "Профил",
          href: "/account",
          icon: Settings,
        },
      ];
    } else {
      // Client menu
      return [
        {
          label: "Начало",
          href: "/",
          icon: Home,
        },
        {
          label: "Моите програми",
          href: "/programs",
          icon: BookOpen,
        },
        {
          label: "Тренировки",
          href: "/workouts",
          icon: Dumbbell,
        },
        {
          label: "Напредък",
          href: "/progress",
          icon: BarChart3,
        },
        {
          label: "Хранене",
          href: "/nutrition",
          icon: Apple,
          disabled: true,
        },
        {
          label: "Цели",
          href: "/goals",
          icon: Target,
          disabled: true,
        },
        {
          label: "Профил",
          href: "/account",
          icon: User,
        },
      ];
    }
  };

  const menuItems = getMenuItems();

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">FitLife Studio</h2>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item, index) => {
          const { label, href, icon: Icon, disabled = false, badge, isPro = false } = item;
          const fullHref = `${basePath}${href}`;
          const isActive =
            href === "/"
              ? pathname === basePath || pathname === `${basePath}/`
              : pathname === fullHref || pathname.startsWith(fullHref + "/");

          return (
            <div key={index} className="relative">
              <Link
                href={fullHref}
                onClick={(e) => {
                  if (disabled) {
                    e.preventDefault();
                    return;
                  }
                  // Close mobile menu on navigation
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium border border-blue-100"
                    : disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon 
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive 
                      ? "text-blue-600" 
                      : disabled 
                      ? "text-gray-300" 
                      : "text-gray-500 group-hover:text-gray-700"
                  )} 
                />
                <span className="truncate">{label}</span>
                
                {/* Badges */}
                <div className="ml-auto flex items-center gap-1">
                  {badge && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 h-5">
                      {badge}
                    </Badge>
                  )}
                  {isPro && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-600 rounded-l-full" />
                )}
              </Link>

              {/* Disabled overlay tooltip */}
              {disabled && (
                <div className="absolute inset-0 bg-transparent" title={isPro ? "Изисква Pro абонамент" : "Скоро..."} />
              )}
            </div>
          );
        })}
      </nav>

      {/* Upgrade prompt (for free users) */}
      {userRole === "trainer" && !hasPremiumAccess && (
        <div className="p-3 border-t border-gray-100">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4" />
              <span className="font-semibold">Pro план</span>
            </div>
            <p className="text-sm opacity-90 mb-3">
              Получете достъп до аналитика и премиум функции
            </p>
            <Link 
              href="/protected/subscription"
              className="block w-full bg-white/20 hover:bg-white/30 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors"
            >
              Надстройте сега
            </Link>
          </div>
        </div>
      )}

      {/* User info */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userRole === "trainer" ? "Треньор профил" : "Клиент профил"}
            </p>
            <p className="text-xs text-gray-500">Версия 1.0</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-72 h-full bg-white border-l border-gray-200 shadow-sm">
        <SidebarContent />
      </div>

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}