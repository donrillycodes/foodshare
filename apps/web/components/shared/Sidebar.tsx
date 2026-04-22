"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Heart,
  Package,
  FileText,
  Users,
  CheckSquare,
  BarChart3,
  Shield,
  LogOut,
  ChevronRight,
  Building2,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isNGO, isAdminOrAbove, can, signOut } = useAuth();

  // NGO navigation items
  const ngoNav: NavItem[] = [
    {
      label: "Dashboard",
      href: "/ngo",
      icon: LayoutDashboard,
    },
    {
      label: "Food Needs",
      href: "/ngo/food-needs",
      icon: Package,
    },
    {
      label: "Profile",
      href: "/ngo/profile",
      icon: Building2,
    },
    {
      label: "Pledges",
      href: "/ngo/pledges",
      icon: Heart,
    },
    {
      label: "Updates",
      href: "/ngo/updates",
      icon: FileText,
    },
    {
      label: "Team",
      href: "/ngo/team",
      icon: Users,
    },
  ];

  // Admin navigation items — shown based on permissions
  const adminNav: NavItem[] = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      permission: can.viewAnalytics,
    },
    {
      label: "NGO Applications",
      href: "/admin/ngos",
      icon: CheckSquare,
      permission: can.approveNgos,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
      permission: can.manageUsers,
    },
    {
      label: "Content",
      href: "/admin/content",
      icon: FileText,
      permission: can.manageContent,
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      permission: can.viewAnalytics,
    },
    {
      label: "Audit Log",
      href: "/admin/audit",
      icon: Shield,
      permission: user?.role === "SUPER_ADMIN",
    },
    {
      label: "Admin Team",
      href: "/admin/team",
      icon: Users,
      permission: user?.role === "SUPER_ADMIN",
    },
  ];

  const navItems = isNGO ? ngoNav : adminNav;

  // Filter admin nav by permissions
  const visibleItems = isNGO
    ? navItems
    : navItems.filter(
        (item) => item.permission === undefined || item.permission === true,
      );

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
            <span className="text-white text-sm font-bold">F</span>
          </div>
          <span className="font-semibold text-gray-900">FoodShare</span>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-green-lt flex items-center justify-center flex-shrink-0">
            <span className="text-brand-green text-sm font-semibold">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role === "SUPER_ADMIN"
                ? "Super Admin"
                : user?.role === "ADMIN"
                  ? "Admin"
                  : "NGO Manager"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/ngo" || item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150",
                isActive
                  ? "bg-brand-green-lt text-brand-green font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-brand-green" : "text-gray-400",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-brand-green" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={signOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
            "text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-150",
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-gray-400" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
