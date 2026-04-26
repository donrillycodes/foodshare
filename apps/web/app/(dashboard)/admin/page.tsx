"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/shared/Header";
import { adminApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { PlatformAnalytics } from "@/types";
import { Users, Building2, Heart, Package, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminApi.getAnalytics();
        setAnalytics(response.data.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <Header
        title={`Hello, ${user?.firstName} 👋`}
        subtitle="Here is what is happening on FoodShare today"
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                <div className="w-9 h-9 bg-gray-100 rounded-lg mb-4" />
                <div className="h-6 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : analytics ? (
          <div className="space-y-5">
            {/* Pending NGOs alert */}
            {analytics.ngos.pendingReview > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {analytics.ngos.pendingReview} NGO application
                    {analytics.ngos.pendingReview > 1 ? "s" : ""} pending review
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Review and approve NGOs to get them listed on the platform
                  </p>
                </div>
                <a
                  href="/admin/ngos"
                  className="text-xs font-medium text-amber-700 hover:text-amber-900 whitespace-nowrap ml-6 px-3 py-1.5 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  Review now →
                </a>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Total Donors"
                value={analytics.donors.total.toLocaleString()}
                subtitle={`+${analytics.donors.newLast7Days} this week`}
                icon={Users}
                color="green"
              />
              <StatCard
                title="Active NGOs"
                value={analytics.ngos.approved.toString()}
                subtitle={
                  analytics.ngos.pendingReview > 0
                    ? `${analytics.ngos.pendingReview} pending review`
                    : "All reviewed"
                }
                icon={Building2}
                color="blue"
                alert={analytics.ngos.pendingReview > 0}
              />
              <StatCard
                title="Total Donations"
                value={formatCurrency(Number(analytics.donations.totalAmount))}
                subtitle={`${analytics.donations.totalCount} transactions`}
                icon={Heart}
                color="green"
              />
              <StatCard
                title="Donations (30 Days)"
                value={formatCurrency(Number(analytics.donations.last30DaysAmount))}
                subtitle={`${analytics.donations.last30DaysCount} transactions`}
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                title="Food Pledges"
                value={analytics.pledges.total.toLocaleString()}
                subtitle={`${analytics.pledges.fulfilmentRate} fulfilment rate`}
                icon={Package}
                color="amber"
              />
              <StatCard
                title="Published Updates"
                value={analytics.content.publishedUpdates.toLocaleString()}
                subtitle="NGO impact stories"
                icon={Clock}
                color="blue"
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Failed to load analytics. Please refresh.</p>
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
  alert?: boolean;
}

function StatCard({ title, value, subtitle, icon: Icon, color, alert }: StatCardProps) {
  const iconColorMap = {
    green: "bg-brand-green-lt text-brand-green",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-4", iconColorMap[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{title}</p>
      <p className={cn("text-xs mt-1", alert ? "text-amber-600 font-medium" : "text-gray-400")}>
        {subtitle}
      </p>
    </div>
  );
}
