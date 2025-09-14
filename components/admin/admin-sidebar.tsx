"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  UserCheck,
  Crown,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  userProfile: {
    full_name: string | null;
    email: string | null;
  };
}

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Треньори",
    href: "/admin/trainers",
    icon: UserCheck,
  },
  {
    title: "Клиенти",
    href: "/admin/clients",
    icon: Users,
  },
  {
    title: "Планове",
    href: "/admin/plans",
    icon: Crown,
  },
  {
    title: "Финанси",
    href: "/admin/finances",
    icon: TrendingUp,
  },
  {
    title: "Статистики",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Настройки",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({ userProfile }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Fitness App</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive && "bg-secondary/80"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">
              {userProfile.full_name?.charAt(0) || userProfile.email?.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {userProfile.full_name || "Admin"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userProfile.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}