"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/shared/Header";
import { ngoApi } from "@/lib/api";
import { formatCurrency, getStatusColor, cn } from "@/lib/utils";
import type { NGODashboard } from "@/types";
import {
  Heart,
  Package,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function NGODashboardPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["ngo-dashboard"],
    queryFn: async () => {
      const response = await ngoApi.getDashboard();
      return response.data.data as NGODashboard;
    },
  });

  const ngo = data?.ngo;
  const stats = data?.stats;

  return (
    <div className="flex flex-col flex-1">
      <Header
        title={`Hello, ${user?.firstName} 👋`}
        subtitle={ngo?.name ?? "Loading your NGO..."}
      />

      <div className="flex-1 p-8 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"
              >
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : ngo ? (
          <div className="space-y-6">
            {/* NGO status banner */}
            {ngo.status !== "APPROVED" && (
              <div
                className={cn(
                  "rounded-xl border p-4 flex items-start gap-3",
                  ngo.status === "PENDING" || ngo.status === "RESUBMITTED"
                    ? "bg-amber-50 border-amber-100"
                    : ngo.status === "REJECTED"
                      ? "bg-red-50 border-red-100"
                      : "bg-gray-50 border-gray-100",
                )}
              >
                {ngo.status === "PENDING" || ngo.status === "RESUBMITTED" ? (
                  <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                ) : ngo.status === "REJECTED" ? (
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {ngo.status === "PENDING"
                      ? "Your application is under review"
                      : ngo.status === "RESUBMITTED"
                        ? "Your resubmission is under review"
                        : ngo.status === "REJECTED"
                          ? "Your application was rejected"
                          : "Your NGO has been suspended"}
                  </p>
                  {ngo.rejectionReason && (
                    <p className="text-sm text-gray-600 mt-1">
                      {ngo.rejectionReason}
                    </p>
                  )}
                  {ngo.status === "REJECTED" && ngo.resubmissionCount < 3 && (
                    <a
                      href="/ngo/profile"
                      className="text-sm text-brand-green hover:underline mt-2 inline-block"
                    >
                      Update your application and resubmit →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Approved badge */}
            {ngo.status === "APPROVED" && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0" />
                <p className="text-sm text-green-800">
                  Your NGO is verified and live on FoodShare
                </p>
              </div>
            )}

            {/* Stats grid */}
            {ngo.status === "APPROVED" && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Total Donations"
                  value={formatCurrency(Number(stats.totalDonationsAmount))}
                  subtitle={`${stats.totalDonationsCount} donations`}
                  icon={Heart}
                  color="green"
                />
                <StatCard
                  title="Active Pledges"
                  value={stats.activePledges.toString()}
                  subtitle="Pending and confirmed"
                  icon={Package}
                  color="amber"
                />
                <StatCard
                  title="Open Food Needs"
                  value={stats.openNeeds.toString()}
                  subtitle="Currently accepting pledges"
                  icon={Package}
                  color="blue"
                />
                <StatCard
                  title="Team Members"
                  value={stats.totalMembers.toString()}
                  subtitle="Active staff members"
                  icon={Users}
                  color="blue"
                />
              </div>
            )}

            {/* Quick actions */}
            {ngo.status === "APPROVED" && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-3">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Post Food Need",
                      href: "/ngo/food-needs",
                      icon: Package,
                    },
                    {
                      label: "Write Update",
                      href: "/ngo/updates",
                      icon: FileText,
                    },
                    {
                      label: "View Pledges",
                      href: "/ngo/pledges",
                      icon: Heart,
                    },
                    {
                      label: "Manage Team",
                      href: "/ngo/team",
                      icon: Users,
                    },
                  ].map((action) => (
                    <a
                      key={action.href}
                      href={action.href}
                      className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-brand-green hover:bg-brand-green-lt transition-colors duration-150 group"
                    >
                      <action.icon className="w-5 h-5 text-gray-400 group-hover:text-brand-green transition-colors" />
                      <span className="text-xs font-medium text-gray-600 group-hover:text-brand-green transition-colors text-center">
                        {action.label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-gray-500">
              No NGO found. Please register your organisation first.
            </p>
            <a
              href="/register"
              className="text-sm text-brand-green hover:underline mt-2 inline-block"
            >
              Register your NGO →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "green" | "blue" | "amber";
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: StatCardProps) {
  const colorMap = {
    green: "bg-brand-green-lt text-brand-green",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
