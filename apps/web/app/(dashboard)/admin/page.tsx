"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/shared/Header";
import { adminApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { PlatformAnalytics } from "@/types";
import {
  Users,
  Building2,
  Heart,
  Package,
  TrendingUp,
  Clock,
} from "lucide-react";

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
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"
              >
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total donors */}
              <StatCard
                title="Total Donors"
                value={analytics.donors.total.toLocaleString()}
                subtitle={`+${analytics.donors.newLast7Days} this week`}
                icon={Users}
                color="green"
              />

              {/* Approved NGOs */}
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

              {/* Total donations */}
              <StatCard
                title="Total Donations"
                value={formatCurrency(Number(analytics.donations.totalAmount))}
                subtitle={`${analytics.donations.totalCount} transactions`}
                icon={Heart}
                color="green"
              />

              {/* Last 30 days */}
              <StatCard
                title="Donations (30 Days)"
                value={formatCurrency(
                  Number(analytics.donations.last30DaysAmount),
                )}
                subtitle={`${analytics.donations.last30DaysCount} transactions`}
                icon={TrendingUp}
                color="green"
              />

              {/* Pledges */}
              <StatCard
                title="Food Pledges"
                value={analytics.pledges.total.toLocaleString()}
                subtitle={`${analytics.pledges.fulfilmentRate} fulfilment rate`}
                icon={Package}
                color="amber"
              />

              {/* Published updates */}
              <StatCard
                title="Published Updates"
                value={analytics.content.publishedUpdates.toLocaleString()}
                subtitle="NGO impact stories"
                icon={Clock}
                color="blue"
              />
            </div>

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
                  className="text-sm font-medium text-amber-700 hover:text-amber-900 whitespace-nowrap ml-4"
                >
                  Review now →
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Failed to load analytics. Please refresh.
          </p>
        )}
      </div>
    </div>
  );
}

// Stat card component
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "green" | "blue" | "amber";
  alert?: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  alert,
}: StatCardProps) {
  const colorMap = {
    green: "bg-brand-green-lt text-brand-green",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-colors duration-150">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p
            className={`text-xs mt-1 ${alert ? "text-amber-600 font-medium" : "text-gray-500"}`}
          >
            {subtitle}
          </p>
        </div>
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
    </div>
  );
}
