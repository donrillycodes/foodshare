"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/shared/Sidebar";
import { SidebarProvider } from "@/components/shared/SidebarContext";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          {/* Hexagon logo mark — inline so no extra import needed here */}
          <svg
            width="36"
            height="36"
            viewBox="0 0 28 28"
            fill="none"
            className="mx-auto mb-3"
          >
            <path
              d="M14 2L24.3923 8V20L14 26L3.60769 20V8L14 2Z"
              fill="#1a7a4a"
            />
            <path
              d="M14 7L19.1962 10V16L14 19L8.80385 16V10L14 7Z"
              fill="#4de69e"
              opacity="0.9"
            />
          </svg>
          <p className="text-xs text-ink-subtle">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 text-sm text-brand-green hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      {/* Main content — takes remaining space, scrollable independently */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  );
}
