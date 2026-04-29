"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/shared/Header";
import { adminApi } from "@/lib/api";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type {
  PlatformAnalytics,
  AuditLog,
  PaginatedResponse,
} from "@/types";
import {
  Users,
  Building2,
  Heart,
  Package,
  TrendingUp,
  FileText,
  AlertTriangle,
  ArrowRight,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

// Map audit-log action prefixes/actions → tone for the activity feed badge.
function actionTone(action: string): BadgeTone {
  if (action.includes("APPROVED") || action.includes("REACTIVATED"))
    return "success";
  if (
    action.includes("REJECTED") ||
    action.includes("SUSPENDED") ||
    action.includes("CANCELLED") ||
    action.includes("FLAGGED")
  )
    return "danger";
  if (action.includes("REFUNDED") || action.includes("PENDING"))
    return "warning";
  if (action.includes("LOGIN")) return "info";
  if (action.includes("COMPLETED") || action.includes("FULFILLED"))
    return "success";
  return "neutral";
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["platform-analytics"],
    queryFn: async () => {
      const response = await adminApi.getAnalytics();
      return response.data.data as PlatformAnalytics;
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["audit-logs-recent"],
    queryFn: async () => {
      const response = await adminApi.getAuditLogs({ limit: 10 });
      return response.data.data as PaginatedResponse<AuditLog>;
    },
  });

  return (
    <div className="flex flex-col flex-1">
      <Header
        title={`Hello, ${user?.firstName ?? ""} 👋`}
        subtitle="Here is what is happening on FoodShare today"
      />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl space-y-6">
          {isLoading ? (
            <StatGridSkeleton />
          ) : analytics ? (
            <>
              {/* Attention strip */}
              {analytics.ngos.pendingReview > 0 && (
                <AttentionStrip count={analytics.ngos.pendingReview} />
              )}

              {/* Two-column: stats grid + recent activity rail */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                  {/* Headline stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard
                      label="Total raised"
                      value={formatCurrency(
                        Number(analytics.donations.totalAmount),
                      )}
                      meta={`${analytics.donations.totalCount.toLocaleString()} transactions all time`}
                      icon={<Heart className="w-4 h-4" />}
                    />
                    <StatCard
                      label="Last 30 days"
                      value={formatCurrency(
                        Number(analytics.donations.last30DaysAmount),
                      )}
                      meta={`${analytics.donations.last30DaysCount.toLocaleString()} recent transactions`}
                      trend="up"
                      icon={<TrendingUp className="w-4 h-4" />}
                    />
                  </div>

                  {/* Secondary stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="Donors"
                      value={analytics.donors.total.toLocaleString()}
                      meta={`+${analytics.donors.newLast7Days} this week`}
                      icon={<Users className="w-4 h-4" />}
                    />
                    <StatCard
                      label="Active NGOs"
                      value={analytics.ngos.approved.toLocaleString()}
                      meta={
                        analytics.ngos.pendingReview > 0
                          ? `${analytics.ngos.pendingReview} awaiting review`
                          : "All reviewed"
                      }
                      trend={
                        analytics.ngos.pendingReview > 0 ? "down" : "neutral"
                      }
                      icon={<Building2 className="w-4 h-4" />}
                      iconClassName="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                      label="Pledges"
                      value={analytics.pledges.total.toLocaleString()}
                      meta={`${analytics.pledges.fulfilmentRate} fulfilled`}
                      icon={<Package className="w-4 h-4" />}
                      iconClassName="bg-amber-50 text-amber-600"
                    />
                    <StatCard
                      label="Updates"
                      value={analytics.content.publishedUpdates.toLocaleString()}
                      meta="Published stories"
                      icon={<FileText className="w-4 h-4" />}
                      iconClassName="bg-purple-50 text-purple-600"
                    />
                  </div>
                </div>

                {/* Recent activity rail */}
                <RecentActivity logs={recent?.items ?? []} />
              </div>
            </>
          ) : (
            <EmptyState
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Failed to load analytics"
              description="Refresh the page or check the API server."
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Attention strip ----------

function AttentionStrip({ count }: { count: number }) {
  return (
    <Link
      href="/admin/ngos"
      className="group flex items-center justify-between gap-4 px-5 py-4 rounded-xl bg-amber-50 border border-amber-100 hover:border-amber-200 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-900">
            {count} NGO application{count > 1 ? "s" : ""} waiting for review
          </p>
          <p className="text-xs text-amber-700/80 mt-0.5">
            New organisations can&apos;t go live until you approve them.
          </p>
        </div>
      </div>
      <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-amber-800 group-hover:text-amber-900">
        Review now
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

// ---------- Recent activity ----------

function RecentActivity({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="bg-white rounded-xl border border-border-subtle shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-ink-subtle" />
          <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide">
            Recent activity
          </h3>
        </div>
        <Link
          href="/admin/audit"
          className="text-xs font-medium text-brand-green hover:text-brand-green-dk"
        >
          View all
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="p-6 text-center">
          <ShieldCheck className="w-5 h-5 text-ink-subtle mx-auto mb-2" />
          <p className="text-xs text-ink-subtle">
            No platform activity yet — actions you and your team take will
            appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {logs.slice(0, 10).map((log) => (
            <li key={log.id} className="px-5 py-3">
              <div className="flex items-start gap-2 flex-wrap">
                <Badge tone={actionTone(log.action)} size="sm">
                  {log.action.replace(/_/g, " ")}
                </Badge>
                <span className="text-xs text-ink-subtle">
                  {formatRelativeTime(log.createdAt)}
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-1.5 truncate">
                {log.actor ? (
                  <>
                    <span className="font-medium text-ink">
                      {log.actor.firstName} {log.actor.lastName}
                    </span>
                    <span className="text-ink-subtle"> · {log.actor.role}</span>
                  </>
                ) : (
                  <span className="text-ink-subtle">System</span>
                )}
              </p>
              {log.notes && (
                <p className="text-xs text-ink-subtle mt-0.5 truncate">
                  {log.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Skeleton ----------

function StatGridSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-border-subtle p-5 h-28 animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-border-subtle p-5 h-28 animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border-subtle h-96 animate-pulse" />
      </div>
    </div>
  );
}
