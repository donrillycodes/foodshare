"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
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
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: boolean;
  section?: string;
}

// ─── GivHive hexagon logo mark ────────────────────────────────────────────
function HiveMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <path d="M14 2L24.3923 8V20L14 26L3.60769 20V8L14 2Z" fill="#1a7a4a" />
      <path
        d="M14 7L19.1962 10V16L14 19L8.80385 16V10L14 7Z"
        fill="#4de69e"
        opacity="0.9"
      />
    </svg>
  );
}

// ─── Sidebar inner content (shared between desktop + mobile) ───────────────
function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { user, isNGO, can, signOut } = useAuth();

  const ngoNav: NavItem[] = [
    {
      label: "Dashboard",
      href: "/ngo",
      icon: LayoutDashboard,
      section: "Overview",
    },
    {
      label: "Food Needs",
      href: "/ngo/food-needs",
      icon: Package,
      section: "Manage",
    },
    { label: "Pledges", href: "/ngo/pledges", icon: Heart },
    { label: "Updates", href: "/ngo/updates", icon: FileText },
    {
      label: "Profile",
      href: "/ngo/profile",
      icon: Building2,
      section: "Settings",
    },
    { label: "Team", href: "/ngo/team", icon: Users },
  ];

  const adminNav: NavItem[] = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      section: "Platform",
      permission: can.viewAnalytics,
    },
    {
      label: "NGO Applications",
      href: "/admin/ngos",
      icon: CheckSquare,
      section: "Manage",
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
      section: "Super Admin",
      permission: user?.role === "SUPER_ADMIN",
    },
    {
      label: "Admin Team",
      href: "/admin/team",
      icon: Users,
      permission: user?.role === "SUPER_ADMIN",
    },
  ];

  const allItems = isNGO ? ngoNav : adminNav;
  const visibleItems = isNGO
    ? allItems
    : allItems.filter(
        (item) => item.permission === undefined || item.permission === true,
      );

  const roleLabel =
    user?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user?.role === "ADMIN"
        ? "Admin"
        : "NGO Manager";

  return (
    <div className="flex flex-col h-full" style={{ background: "#0b1c13" }}>
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div
        className="h-14 flex items-center justify-between px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2.5">
          <HiveMark size={26} />
          <span className="font-semibold text-white text-sm tracking-tight">
            GivHive
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-md leading-none font-medium"
            style={{
              background: "rgba(77,230,158,0.12)",
              color: "#4de69e",
              fontSize: "10px",
            }}
          >
            {isNGO ? "NGO" : "Admin"}
          </span>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {visibleItems.map((item, index) => {
          const isActive =
            item.href === "/ngo" || item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <div key={item.href}>
              {item.section && (
                <span
                  className="sidebar-section-label"
                  style={{ marginTop: index === 0 ? "4px" : undefined }}
                >
                  {item.section}
                </span>
              )}
              <Link
                href={item.href}
                className={cn("sidebar-item", isActive && "active")}
                onClick={onNavClick}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* ── User + sign out ───────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white"
            style={{ background: "#1a7a4a" }}
          >
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-medium truncate"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {user?.firstName} {user?.lastName}
            </p>
            <p
              className="truncate"
              style={{ color: "rgba(255,255,255,0.32)", fontSize: "10px" }}
            >
              {roleLabel}
            </p>
          </div>
        </div>
        <div className="px-2 pb-4">
          <button
            onClick={signOut}
            className="sidebar-item"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.12)";
              e.currentTarget.style.color = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "";
              e.currentTarget.style.color = "rgba(255,255,255,0.35)";
            }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar — desktop static + mobile drawer ─────────────────────────────
export function Sidebar() {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Desktop sidebar — always visible at lg+ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:flex-shrink-0 min-h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <div
        className={cn("sidebar-overlay lg:hidden", isOpen && "open")}
        onClick={close}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "sidebar-drawer lg:hidden flex flex-col",
          isOpen && "open",
        )}
        aria-label="Navigation"
      >
        {/* Close button inside drawer */}
        <button
          onClick={close}
          className="absolute top-3.5 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/08 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent onNavClick={close} />
      </aside>
    </>
  );
}
