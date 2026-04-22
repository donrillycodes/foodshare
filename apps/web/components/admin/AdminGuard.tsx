"use client";

import { useAuth } from "@/hooks/useAuth";
import { ShieldX } from "lucide-react";

type AdminPermission =
  | "canApproveNgos"
  | "canManageUsers"
  | "canManageContent"
  | "canViewAnalytics"
  | "canManageDonations"
  | "canManageAdmins";

interface AdminGuardProps {
  children: React.ReactNode;
  permission?: AdminPermission;
}

export function AdminGuard({ children, permission }: AdminGuardProps) {
  const { user, isSuperAdmin, can } = useAuth();

  // SUPER_ADMIN always passes
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // If a specific permission is required check it
  if (permission && !can[permission as keyof typeof can]) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center">
          <div className="flex justify-center mb-4">
            <ShieldX className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            Access restricted
          </h2>
          <p className="text-sm text-gray-500">
            You do not have permission to access this section. Contact your
            Super Admin to request access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
