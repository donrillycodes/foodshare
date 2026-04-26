"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/shared/Header";
import { ngoApi } from "@/lib/api";
import { formatCurrency, getStatusColor, cn } from "@/lib/utils";
import type { NGODashboard } from "@/types";
import { useEffect, useState } from "react";
import {
  Heart,
  Package,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

export default function NGODashboardPage() {
  const { user } = useAuth();
  const [showApprovedBanner, setShowApprovedBanner] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["ngo-dashboard"],
    queryFn: async () => {
      const response = await ngoApi.getDashboard();
      return response.data.data as NGODashboard;
    },
  });

  const ngo = data?.ngo;
  const stats = data?.stats;

  useEffect(() => {
    if (ngo?.status === "APPROVED") {
      const timer = setTimeout(() => setShowApprovedBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [ngo?.status]);

  return (
    <div className="flex flex-col flex-1">
      <Header
        title={`Hello, ${user?.firstName} 👋`}
        subtitle={ngo?.name ?? "Loading your NGO..."}
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                <div className="w-8 h-8 bg-gray-100 rounded-lg mb-4" />
                <div className="h-6 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : ngo ? (
          <div className="space-y-5">
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
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                ) : ngo.status === "REJECTED" ? (
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
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
                    <p className="text-xs text-gray-600 mt-1">{ngo.rejectionReason}</p>
                  )}
                  {ngo.status === "REJECTED" && ngo.resubmissionCount < 3 && (
                    <a
                      href="/ngo/profile"
                      className="text-xs text-brand-green hover:underline mt-2 inline-block"
                    >
                      Update your application and resubmit →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Approved banner */}
            {ngo.status === "APPROVED" && showApprovedBanner && (
              <div className="bg-brand-green-lt border border-green-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    Your NGO is verified and live on FoodShare
                  </p>
                </div>
                <button
                  onClick={() => setShowApprovedBanner(false)}
                  className="text-green-600 hover:text-green-800 ml-4"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Stats grid */}
            {ngo.status === "APPROVED" && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  color="purple"
                />
              </div>
            )}

            {/* Quick actions */}
            {ngo.status === "APPROVED" && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Post Food Need", href: "/ngo/food-needs", icon: Package },
                    { label: "Write Update", href: "/ngo/updates", icon: FileText },
                    { label: "View Pledges", href: "/ngo/pledges", icon: Heart },
                    { label: "Manage Team", href: "/ngo/team", icon: Users },
                  ].map((action) => (
                    <a
                      key={action.href}
                      href={action.href}
                      className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-brand-green hover:bg-brand-green-lt transition-all duration-150 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-brand-green-lt transition-colors">
                        <action.icon className="w-4 h-4 text-gray-400 group-hover:text-brand-green transition-colors" />
                      </div>
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
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p className="text-sm text-gray-500 mb-3">
              No NGO found. Please register your organisation first.
            </p>
            <a href="/ngo/profile" className="text-sm text-brand-green hover:underline font-medium">
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
  color: "green" | "blue" | "amber" | "purple";
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  const iconColorMap = {
    green: "bg-brand-green-lt text-brand-green",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-4", iconColorMap[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}
