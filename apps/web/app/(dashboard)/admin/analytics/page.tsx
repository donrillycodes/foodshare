"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/shared/Header";
import { adminApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { PlatformAnalytics } from "@/types";
import { AdminGuard } from "@/components/admin/AdminGuard";
import {
  Users,
  Building2,
  Heart,
  Package,
  TrendingUp,
  FileText,
} from "lucide-react";

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["platform-analytics"],
    queryFn: async () => {
      const response = await adminApi.getAnalytics();
      return response.data.data as PlatformAnalytics;
    },
  });

  return (
    <AdminGuard permission="canViewAnalytics">
      <div className="flex flex-col flex-1">
        <Header
          title="Platform Analytics"
          subtitle="Overview of FoodShare platform performance"
        />

        <div className="flex-1 p-8 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"
                >
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                  <div className="h-8 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Donors section */}
              <div>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Donors
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AnalyticsCard
                    title="Total Donors"
                    value={data.donors.total.toLocaleString()}
                    icon={Users}
                    color="green"
                  />
                  <AnalyticsCard
                    title="New This Week"
                    value={data.donors.newLast7Days.toLocaleString()}
                    icon={TrendingUp}
                    color="green"
                  />
                  <AnalyticsCard
                    title="New This Month"
                    value={data.donors.newLast30Days.toLocaleString()}
                    icon={TrendingUp}
                    color="green"
                  />
                </div>
              </div>

              {/* NGOs section */}
              <div>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  NGOs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AnalyticsCard
                    title="Total NGOs"
                    value={data.ngos.total.toLocaleString()}
                    icon={Building2}
                    color="blue"
                  />
                  <AnalyticsCard
                    title="Approved NGOs"
                    value={data.ngos.approved.toLocaleString()}
                    icon={Building2}
                    color="green"
                  />
                  <AnalyticsCard
                    title="Pending Review"
                    value={data.ngos.pendingReview.toLocaleString()}
                    icon={Building2}
                    color="amber"
                    alert={data.ngos.pendingReview > 0}
                  />
                </div>
              </div>

              {/* Donations section */}
              <div>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Donations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnalyticsCard
                    title="All Time Total"
                    value={formatCurrency(Number(data.donations.totalAmount))}
                    subtitle={`${data.donations.totalCount} transactions`}
                    icon={Heart}
                    color="green"
                    large
                  />
                  <AnalyticsCard
                    title="Last 30 Days"
                    value={formatCurrency(
                      Number(data.donations.last30DaysAmount),
                    )}
                    subtitle={`${data.donations.last30DaysCount} transactions`}
                    icon={TrendingUp}
                    color="green"
                    large
                  />
                </div>
              </div>

              {/* Pledges and content section */}
              <div>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Food Pledges and Content
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AnalyticsCard
                    title="Total Pledges"
                    value={data.pledges.total.toLocaleString()}
                    icon={Package}
                    color="amber"
                  />
                  <AnalyticsCard
                    title="Fulfilled Pledges"
                    value={data.pledges.fulfilled.toLocaleString()}
                    subtitle={`${data.pledges.fulfilmentRate} rate`}
                    icon={Package}
                    color="green"
                  />
                  <AnalyticsCard
                    title="Published Updates"
                    value={data.content.publishedUpdates.toLocaleString()}
                    subtitle="NGO impact stories"
                    icon={FileText}
                    color="blue"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Failed to load analytics. Please refresh.
            </p>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}

interface AnalyticsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "green" | "blue" | "amber";
  alert?: boolean;
  large?: boolean;
}

function AnalyticsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  alert,
  large,
}: AnalyticsCardProps) {
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
          <p
            className={`font-bold text-gray-900 mt-1 ${large ? "text-3xl" : "text-2xl"}`}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={`text-xs mt-1 ${alert ? "text-amber-600 font-medium" : "text-gray-500"}`}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
