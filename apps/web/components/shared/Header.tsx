"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Check } from "lucide-react";
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
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    refetchInterval: 30000, // refresh every 30 seconds
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
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-150"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="flex items-center gap-1 text-xs text-brand-green hover:underline"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">
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
                        "px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors",
                        notification.status === "UNREAD"
                          ? "bg-brand-green-lt"
                          : "bg-white",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {notification.status === "UNREAD" && (
                          <div className="w-2 h-2 rounded-full bg-brand-green flex-shrink-0 mt-1.5" />
                        )}
                        <div
                          className={
                            notification.status === "UNREAD" ? "" : "ml-4"
                          }
                        >
                          <p className="text-xs font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {notification.body}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
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
