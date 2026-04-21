"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-150">
          <Bell className="w-4.5 h-4.5" />
        </button>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-full bg-brand-green-lt flex items-center justify-center cursor-pointer">
          <span className="text-brand-green text-sm font-semibold">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </span>
        </div>
      </div>
    </header>
  );
}
