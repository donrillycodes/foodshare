"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/shared/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold">F</span>
          </div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
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

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        {children}
      </main>
    </div>
  );
}
