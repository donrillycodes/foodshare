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
  Building2,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: boolean;
  section?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isNGO, can, signOut } = useAuth();

  const ngoNav: NavItem[] = [
    { label: "Dashboard", href: "/ngo", icon: LayoutDashboard, section: "Overview" },
    { label: "Food Needs", href: "/ngo/food-needs", icon: Package, section: "Manage" },
    { label: "Pledges", href: "/ngo/pledges", icon: Heart },
    { label: "Updates", href: "/ngo/updates", icon: FileText },
    { label: "Profile", href: "/ngo/profile", icon: Building2, section: "Settings" },
    { label: "Team", href: "/ngo/team", icon: Users },
  ];

  const adminNav: NavItem[] = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard, section: "Platform", permission: can.viewAnalytics },
    { label: "NGO Applications", href: "/admin/ngos", icon: CheckSquare, section: "Manage", permission: can.approveNgos },
    { label: "Users", href: "/admin/users", icon: Users, permission: can.manageUsers },
    { label: "Content", href: "/admin/content", icon: FileText, permission: can.manageContent },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: can.viewAnalytics },
    { label: "Audit Log", href: "/admin/audit", icon: Shield, section: "Super Admin", permission: user?.role === "SUPER_ADMIN" },
    { label: "Admin Team", href: "/admin/team", icon: Users, permission: user?.role === "SUPER_ADMIN" },
  ];

  const allItems = isNGO ? ngoNav : adminNav;
  const visibleItems = isNGO
    ? allItems
    : allItems.filter((item) => item.permission === undefined || item.permission === true);

  const roleLabel =
    user?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user?.role === "ADMIN"
        ? "Admin"
        : "NGO Manager";

  return (
    <aside
      className="w-60 min-h-screen flex flex-col flex-shrink-0"
      style={{ background: "#0d1f17" }}
    >
      {/* Logo */}
      <div
        className="h-14 flex items-center px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-green flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <span className="font-semibold text-white text-sm">FoodShare</span>
          <span
            className="text-xs px-1.5 py-0.5 rounded leading-none"
            style={{
              background: "rgba(26,122,74,0.3)",
              color: "#4de69e",
              fontSize: "10px",
            }}
          >
            {isNGO ? "NGO" : "Admin"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {visibleItems.map((item, index) => {
          const isActive =
            item.href === "/ngo" || item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <div key={item.href}>
              {item.section && (
                <span className="sidebar-section-label" style={{ marginTop: index === 0 ? "4px" : "16px" }}>
                  {item.section}
                </span>
              )}
              <Link
                href={item.href}
                className={cn("sidebar-item", isActive && "active")}
              >
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User + Sign out */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="w-7 h-7 rounded-full bg-brand-green flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-medium truncate"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>
              {roleLabel}
            </p>
          </div>
        </div>
        <div className="px-2 pb-3">
          <button
            onClick={signOut}
            className="sidebar-item w-full"
            style={{ color: "rgba(255,255,255,0.38)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.12)";
              e.currentTarget.style.color = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "";
              e.currentTarget.style.color = "rgba(255,255,255,0.38)";
            }}
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
