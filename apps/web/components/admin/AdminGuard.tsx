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

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  if (permission && !can[permission as keyof typeof can]) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-6 h-6 text-gray-300" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Access restricted</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            You do not have permission to access this section. Contact your Super Admin to request access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
