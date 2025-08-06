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
  BookOpen
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function ImprovedSidebar() {
  const pathname = usePathname();
  const basePath = "/protected";

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

  return (
    <div className="flex flex-col min-w-[200px] h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
            <Dumbbell className="h-3 w-3 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">FitnessPlatform</h2>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
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
                }}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-all duration-200 group relative",
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
                <span className="truncate text-sm">{label}</span>
                
                {/* Badges */}
                <div className="ml-auto flex items-center gap-1">
                  {badge && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-1 py-0 h-4">
                      {badge}
                    </Badge>
                  )}
                  {isPro && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full" />
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

      {/* Upgrade prompt (for free users) - Compact version */}
      {userRole === "trainer" && !hasPremiumAccess && (
        <div className="p-3 border-t border-gray-100">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-md p-3 text-white text-xs">
            <div className="flex items-center gap-1 mb-1">
              <Crown className="h-3 w-3" />
              <span className="font-medium text-xs">Pro</span>
            </div>
            <p className="text-xs opacity-90 mb-2">
              Аналитика и още функции
            </p>
            <Link 
              href="/protected/subscription"
              className="block w-full bg-white/20 hover:bg-white/30 rounded px-2 py-1 text-center text-xs font-medium transition-colors"
            >
              Надстройте
            </Link>
          </div>
        </div>
      )}

      {/* User info - Compact */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {userRole === "trainer" ? "Треньор Петров" : "Иван Петров"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userRole === "trainer" ? "trainer@example.com" : "client@example.com"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}