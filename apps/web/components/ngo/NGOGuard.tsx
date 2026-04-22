"use client";

import { useQuery } from "@tanstack/react-query";
import { ngoApi } from "@/lib/api";
import type { NGODashboard } from "@/types";
import { Clock, AlertTriangle, XCircle } from "lucide-react";

interface NGOGuardProps {
  children: React.ReactNode;
}

export function NGOGuard({ children }: NGOGuardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["ngo-dashboard"],
    queryFn: async () => {
      const response = await ngoApi.getDashboard();
      return response.data.data as NGODashboard;
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  // No NGO registered yet
  if (!data?.ngo) {
    return (
      <LockedState
        icon={<AlertTriangle className="w-8 h-8 text-gray-300" />}
        title="No NGO registered"
        message="You need to register your NGO before accessing this section."
        actionLabel="Register your NGO"
        actionHref="/ngo/profile"
      />
    );
  }

  const status = data.ngo.status;

  // Pending or resubmitted
  if (status === "PENDING" || status === "RESUBMITTED") {
    return (
      <LockedState
        icon={<Clock className="w-8 h-8 text-amber-400" />}
        title="Application under review"
        message="Your NGO application is being reviewed by our team. You will be notified once approved. This section will unlock after approval."
        actionLabel="View your application"
        actionHref="/ngo/profile"
        color="amber"
      />
    );
  }

  // Rejected
  if (status === "REJECTED") {
    return (
      <LockedState
        icon={<XCircle className="w-8 h-8 text-red-400" />}
        title="Application rejected"
        message={
          data.ngo.rejectionReason
            ? `Your application was rejected: ${data.ngo.rejectionReason}`
            : "Your application was rejected. Please update your details and resubmit."
        }
        actionLabel="Update and resubmit"
        actionHref="/ngo/profile"
        color="red"
      />
    );
  }

  // Suspended
  if (status === "SUSPENDED") {
    return (
      <LockedState
        icon={<XCircle className="w-8 h-8 text-gray-400" />}
        title="NGO suspended"
        message="Your NGO has been suspended. Please contact FoodShare support for assistance."
        color="gray"
      />
    );
  }

  // Approved — render the page
  return <>{children}</>;
}

interface LockedStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  color?: "amber" | "red" | "gray";
}

function LockedState({
  icon,
  title,
  message,
  actionLabel,
  actionHref,
  color = "amber",
}: LockedStateProps) {
  const bgMap = {
    amber: "bg-amber-50 border-amber-100",
    red: "bg-red-50 border-red-100",
    gray: "bg-gray-50 border-gray-100",
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div
        className={`max-w-md w-full rounded-2xl border p-8 text-center ${bgMap[color]}`}
      >
        <div className="flex justify-center mb-4">{icon}</div>
        <h2 className="text-base font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        {actionLabel && actionHref && (
          <a
            href={actionHref}
            className="inline-flex items-center px-4 py-2 bg-brand-green text-white text-sm rounded-lg hover:bg-brand-green-dk transition-colors"
          >
            {actionLabel}
          </a>
        )}
      </div>
    </div>
  );
}
