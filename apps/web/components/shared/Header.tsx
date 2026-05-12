"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "./SidebarContext";
import { Bell, Check, Menu } from "lucide-react";
import { formatRelativeTime, cn } from "@/lib/utils";
import apiClient from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  status: string;
  createdAt: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: unreadData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: async () => {
      const response = await apiClient.get("/api/notifications/unread-count");
      return response.data.data.count as number;
    },
    refetchInterval: 30000,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await apiClient.get("/api/notifications?limit=10");
      return response.data.data.items as Notification[];
    },
    enabled: showNotifications,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.patch("/api/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.refetchQueries({ queryKey: ["unread-count"] });
      queryClient.refetchQueries({ queryKey: ["notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.patch(`/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      queryClient.refetchQueries({ queryKey: ["unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = unreadData ?? 0;
  const notifications = notificationsData ?? [];

  return (
    <header className="h-14 bg-white border-b border-border-subtle flex items-center justify-between px-4 lg:px-6 flex-shrink-0 sticky top-0 z-30">
      {/* Left: hamburger (mobile only) + page title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — only visible on mobile */}
        <button
          onClick={toggle}
          className="lg:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-ink leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-ink-subtle mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: notification bell + avatar */}
      <div className="flex items-center gap-2 flex-shrink-0" ref={dropdownRef}>
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center font-semibold leading-none"
                style={{ fontSize: "9px" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-pop border border-border-subtle z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="flex items-center gap-1 text-xs text-brand-green hover:underline font-medium"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-6 h-6 text-ink-subtle/30 mx-auto mb-2" />
                    <p className="text-xs text-ink-subtle">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (notification.status === "UNREAD") {
                          markReadMutation.mutate(notification.id);
                        }
                      }}
                      className={cn(
                        "px-4 py-3 border-b border-border-subtle cursor-pointer hover:bg-surface-muted transition-colors",
                        notification.status === "UNREAD"
                          ? "bg-brand-green-lt"
                          : "bg-white",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {notification.status === "UNREAD" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0 mt-1.5" />
                        )}
                        <div
                          className={
                            notification.status === "UNREAD" ? "" : "ml-3.5"
                          }
                        >
                          <p className="text-xs font-semibold text-ink">
                            {notification.title}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5">
                            {notification.body}
                          </p>
                          <p className="text-xs text-ink-subtle mt-1">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-green-lt flex items-center justify-center cursor-pointer">
          <span className="text-brand-green text-xs font-semibold">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </span>
        </div>
      </div>
    </header>
  );
}
