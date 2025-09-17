"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/styles";
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
  X,
  ChefHat,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
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

interface LeftSidebarProps {
  userRole?: "trainer" | "client" | "admin";
  hasPremiumAccess?: boolean;
  userProfile?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  clientsCount?: number;
  planType?: "free" | "pro" | "beast";
}

export default function LeftSidebar({ 
  userRole = "client", 
  hasPremiumAccess = false,
  userProfile,
  clientsCount = 0,
  planType = "free"
}: LeftSidebarProps) {
  const pathname = usePathname();
  const basePath = "/protected";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getMenuItems = (): MenuItem[] => {
    if (userRole === "admin") {
      return [
        {
          label: "Админ панел",
          href: "/admin",
          icon: Settings,
        },
        {
          label: "Дашборд",
          href: "/",
          icon: Home,
        },
      ];
    } else if (userRole === "trainer") {
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
          badge: clientsCount > 0 ? clientsCount.toString() : undefined,
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
          label: "Храни",
          href: "/foods",
          icon: Apple,
        },
        {
          label: "Хранене",
          href: "/nutrition",
          icon: ChefHat,
        },
        {
          label: "Календар",
          href: "/calendar",
          icon: Calendar,
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
          label: "Настройки",
          href: "/account",
          icon: Settings,
        },
      ];
    } else {
      return [
        {
          label: "Начало",
          href: "/",
          icon: Home,
        },
        {
          label: "Програми",
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
        },
        {
          label: "Цели",
          href: "/goals",
          icon: Target,
        },
        {
          label: "Календар",
          href: "/calendar",
          icon: Calendar,
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

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "border-b border-border bg-background",
        isCollapsed && !isMobile ? "p-2" : "p-4"
      )}>
        {(!isCollapsed || isMobile) ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground capitalize truncate">{userRole}</p>
            </div>
            
            {/* Desktop collapse toggle */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            
            {/* Mobile close button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-8 w-8 p-0 hover:bg-muted lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          /* Collapsed state - centered toggle button */
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-1 overflow-y-auto",
        isCollapsed && !isMobile ? "p-2" : "p-3"
      )}>
        {menuItems.map((item, index) => {
          const { label, href, icon: Icon, disabled = false, badge, isPro = false } = item;
          const fullHref = href === "/admin" ? "/admin" : `${basePath}${href}`;
          const isActive = href === "/admin"
            ? pathname.startsWith("/admin")
            : href === "/"
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
                  if (isMobile) {
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary/10 text-primary font-medium border border-primary/20"
                    : disabled
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && !isMobile && "justify-center px-2 py-3"
                )}
                title={isCollapsed && !isMobile ? label : undefined}
              >
                <Icon 
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive 
                      ? "text-primary" 
                      : disabled 
                      ? "text-muted-foreground/50" 
                      : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className="truncate">{label}</span>
                    
                    {/* Badges */}
                    <div className="ml-auto flex items-center gap-1">
                      {badge && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 h-5">
                          {badge}
                        </Badge>
                      )}
                      {isPro && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />
                )}
              </Link>

              {/* Disabled overlay tooltip */}
              {disabled && (
                <div 
                  className="absolute inset-0 bg-transparent cursor-help" 
                  title={isPro ? "Изисква Pro абонамент" : "Скоро..."}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Upgrade prompt */}
      {userRole === "trainer" && planType !== "beast" && (!isCollapsed || isMobile) && (
        <div className="p-3 border-t border-border">
          <div className={cn(
            "rounded-lg p-3 text-white",
            planType === "free" 
              ? "bg-gradient-to-r from-purple-500 to-blue-600"
              : "bg-gradient-to-r from-orange-500 to-red-600"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold text-sm">
                {planType === "free" ? "Pro план" : "Beast план"}
              </span>
            </div>
            <p className="text-xs opacity-90 mb-3 leading-relaxed">
              {planType === "free" 
                ? "Получете достъп до аналитика и премиум функции"
                : "Неограничен брой клиенти и всички функции"}
            </p>
            <Link 
              href="/protected/subscription"
              className="block w-full bg-white/20 hover:bg-white/30 rounded-md px-3 py-2 text-center text-xs font-medium transition-colors"
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
            >
              Надстройте сега
            </Link>
          </div>
        </div>
      )}

      {/* User info */}
      <div className={cn(
        "border-t border-border bg-muted/30",
        isCollapsed && !isMobile ? "p-2" : "p-3"
      )}>
        {(!isCollapsed || isMobile) ? (
          <div className="flex items-center gap-3">
            <Avatar
              src={userProfile?.avatar_url}
              alt={userProfile?.full_name || "Потребител"}
              size="sm"
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userProfile?.full_name || (userRole === "trainer" ? "Треньор" : "Клиент")}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userProfile?.email || "Потребител"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar
              src={userProfile?.avatar_url}
              alt={userProfile?.full_name || "Потребител"}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex flex-col bg-background border-r border-border shadow-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background shadow-md border border-border"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-background shadow-xl transform transition-transform duration-300">
            <SidebarContent isMobile />
          </div>
        </div>
      )}
    </>
  );
}