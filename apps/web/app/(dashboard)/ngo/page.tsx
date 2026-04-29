"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/shared/Header";
import { ngoApi, foodPledgeApi, donationApi } from "@/lib/api";
import {
  formatCurrency,
  formatRelativeTime,
  cn,
} from "@/lib/utils";
import type { NGODashboard, FoodPledge, Donation } from "@/types";
import { Badge, statusToTone } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Heart,
  Package,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  ShieldCheck,
  MapPin,
  Activity,
  ArrowRight,
} from "lucide-react";

// NGO Dashboard home — the screen the NGO Owner sees first every morning.
// Top of page: status banner when something needs attention, otherwise a
// verified hero. Then four stat cards, four quick actions, then a
// merged recent-activity feed (pledges + donations) so the owner can see
// "what changed since I was last here" without clicking through tabs.

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
  const isApproved = ngo?.status === "APPROVED";

  // Once the NGO is approved, the green banner is celebratory but only
  // useful for ~5 seconds — then it just becomes noise. Auto-dismiss.
  useEffect(() => {
    if (ngo?.status === "APPROVED") {
      const timer = setTimeout(() => setShowApprovedBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [ngo?.status]);

  return (
    <div className="flex flex-col flex-1">
      <Header
        title={`Hello, ${user?.firstName ?? ""} 👋`}
        subtitle={ngo?.name ?? "Loading your NGO..."}
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <DashboardSkeleton />
        ) : !ngo ? (
          <EmptyState
            icon={<Package className="w-5 h-5" />}
            title="No NGO found"
            description="Register your organisation to start receiving donations and food pledges through FoodShare."
            action={
              <Link href="/ngo/profile">
                <Button>
                  Register your NGO <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            }
            className="max-w-md mx-auto mt-8"
          />
        ) : (
          <div className="space-y-5 max-w-6xl">
            {/* Status messages — only when something needs attention */}
            {!isApproved && <StatusBanner ngo={ngo} />}

            {isApproved && showApprovedBanner && (
              <ApprovedBanner onDismiss={() => setShowApprovedBanner(false)} />
            )}

            {/* Verified hero — only shown when approved so the owner sees
                their NGO presented the way the public sees it. */}
            {isApproved && <VerifiedHero ngo={ngo} />}

            {/* Stats grid */}
            {isApproved && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total donations"
                  value={formatCurrency(Number(stats.totalDonationsAmount))}
                  meta={`${stats.totalDonationsCount} donation${stats.totalDonationsCount === 1 ? "" : "s"} all-time`}
                  icon={<Heart className="w-4 h-4" />}
                />
                <StatCard
                  label="Active pledges"
                  value={stats.activePledges}
                  meta="Pending and confirmed"
                  icon={<Package className="w-4 h-4" />}
                  iconClassName="bg-amber-50 text-amber-600"
                />
                <StatCard
                  label="Open food needs"
                  value={stats.openNeeds}
                  meta="Currently accepting pledges"
                  icon={<Package className="w-4 h-4" />}
                  iconClassName="bg-blue-50 text-blue-600"
                />
                <StatCard
                  label="Team members"
                  value={stats.totalMembers}
                  meta={stats.totalMembers === 1 ? "Just you" : "Active staff"}
                  icon={<Users className="w-4 h-4" />}
                  iconClassName="bg-purple-50 text-purple-600"
                />
              </div>
            )}

            {/* Body grid — quick actions + activity */}
            {isApproved && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                  <QuickActions />
                  <RecentActivity ngoId={ngo.id} />
                </div>
                <div className="space-y-5">
                  <SetupChecklist stats={stats} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Status banner ----------

function StatusBanner({ ngo }: { ngo: NGODashboard["ngo"] }) {
  const isPending = ngo.status === "PENDING" || ngo.status === "RESUBMITTED";
  const isRejected = ngo.status === "REJECTED";
  const isSuspended = ngo.status === "SUSPENDED";

  const config = isPending
    ? {
        icon: <Clock className="w-4 h-4 text-amber-500" />,
        wrapper: "bg-amber-50 border-amber-100",
        title:
          ngo.status === "RESUBMITTED"
            ? "Your resubmission is under review"
            : "Your application is under review",
        body: "We typically review NGO applications within 1–2 business days. We will email you once a decision is made.",
      }
    : isRejected
      ? {
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
          wrapper: "bg-red-50 border-red-100",
          title: "Your application was rejected",
          body: ngo.rejectionReason,
        }
      : isSuspended
        ? {
            icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
            wrapper: "bg-red-50 border-red-100",
            title: "Your NGO has been suspended",
            body: "Please contact support@foodshare.ca to resolve this.",
          }
        : {
            icon: <AlertTriangle className="w-4 h-4 text-gray-500" />,
            wrapper: "bg-gray-50 border-gray-100",
            title: "Status update",
            body: undefined,
          };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex items-start gap-3",
        config.wrapper,
      )}
    >
      <div className="mt-0.5 flex-shrink-0">{config.icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-ink">{config.title}</p>
          <Badge tone={statusToTone(ngo.status)} size="sm">
            {ngo.status}
          </Badge>
        </div>
        {config.body && (
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
            {config.body}
          </p>
        )}
        {isRejected && ngo.resubmissionCount < 3 && (
          <Link
            href="/ngo/profile"
            className="text-xs text-brand-green hover:underline mt-2 inline-flex items-center gap-1 font-medium"
          >
            Update your application and resubmit
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

function ApprovedBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="bg-brand-green-lt border border-brand-green-mid/30 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
        <p className="text-sm text-ink">
          Your NGO is verified and live on FoodShare
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-brand-green-dk/70 hover:text-brand-green-dk ml-4"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ---------- Verified hero ----------

function VerifiedHero({ ngo }: { ngo: NGODashboard["ngo"] }) {
  return (
    <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-4">
        <Avatar src={ngo.logoUrl} name={ngo.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-ink truncate">
              {ngo.name}
            </h2>
            <Badge tone="success" size="sm" dot>
              <ShieldCheck className="w-3 h-3" /> Verified
            </Badge>
          </div>
          <p className="text-xs text-ink-subtle mt-1 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {ngo.city}, {ngo.province}
          </p>
          {ngo.description && (
            <p className="text-sm text-ink-soft mt-3 leading-relaxed line-clamp-2">
              {ngo.description}
            </p>
          )}
        </div>
        <Link href="/ngo/profile">
          <Button variant="secondary" size="sm">
            Edit profile
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ---------- Quick actions ----------

const QUICK_ACTIONS = [
  {
    label: "Post Food Need",
    description: "Tell donors what you need",
    href: "/ngo/food-needs",
    icon: Package,
  },
  {
    label: "Write Update",
    description: "Share an impact story",
    href: "/ngo/updates",
    icon: FileText,
  },
  {
    label: "Review Pledges",
    description: "Confirm or fulfil",
    href: "/ngo/pledges",
    icon: Heart,
  },
  {
    label: "Manage Team",
    description: "Invite staff members",
    href: "/ngo/team",
    icon: Users,
  },
];

function QuickActions() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink mb-3">Quick actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white border border-border-subtle rounded-xl p-4 flex items-start gap-3 hover:border-brand-green hover:shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center group-hover:bg-brand-green-lt transition-colors flex-shrink-0">
              <action.icon className="w-4 h-4 text-ink-soft group-hover:text-brand-green transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink">{action.label}</p>
              <p className="text-xs text-ink-subtle mt-0.5">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------- Recent activity (merged feed of pledges + donations) ----------

type ActivityItem = {
  id: string;
  type: "pledge" | "donation";
  createdAt: string;
  pledge?: FoodPledge;
  donation?: Donation;
};

function RecentActivity({ ngoId }: { ngoId: string }) {
  const { data: pledgesRes } = useQuery({
    queryKey: ["ngo-recent-pledges", ngoId],
    queryFn: () => foodPledgeApi.getByNGO(ngoId, { limit: 5 }),
  });

  const { data: donationsRes } = useQuery({
    queryKey: ["ngo-recent-donations", ngoId],
    queryFn: () => donationApi.getByNGO(ngoId, { limit: 5 }),
  });

  const pledges: FoodPledge[] = pledgesRes?.data?.data?.pledges ?? [];
  const donations: Donation[] = donationsRes?.data?.data?.donations ?? [];

  const activity: ActivityItem[] = [
    ...pledges.map((p) => ({
      id: `pledge-${p.id}`,
      type: "pledge" as const,
      createdAt: p.createdAt,
      pledge: p,
    })),
    ...donations.map((d) => ({
      id: `donation-${d.id}`,
      type: "donation" as const,
      createdAt: d.createdAt,
      donation: d,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="bg-white rounded-xl border border-border-subtle shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-ink-soft" />
          <h3 className="text-sm font-semibold text-ink">Recent activity</h3>
        </div>
        <Link
          href="/ngo/pledges"
          className="text-xs text-brand-green hover:underline font-medium"
        >
          View all
        </Link>
      </div>
      {activity.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-ink-soft">No activity yet</p>
          <p className="text-xs text-ink-subtle mt-1">
            New pledges and donations will appear here
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {activity.map((item) => (
            <li key={item.id} className="px-5 py-3.5 flex items-center gap-3">
              {item.type === "pledge" && item.pledge ? (
                <PledgeRow pledge={item.pledge} />
              ) : item.type === "donation" && item.donation ? (
                <DonationRow donation={item.donation} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PledgeRow({ pledge }: { pledge: FoodPledge }) {
  const donorName = `${pledge.donor.firstName} ${pledge.donor.lastName}`;
  return (
    <>
      <Avatar
        src={pledge.donor.avatarUrl}
        name={donorName}
        size="sm"
        className="bg-amber-50 text-amber-600"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink truncate">
          <span className="font-medium">{donorName}</span> pledged{" "}
          <span className="font-medium">
            {pledge.quantityPledged} {pledge.foodNeed.unit}
          </span>{" "}
          of {pledge.foodNeed.itemName}
        </p>
        <p className="text-xs text-ink-subtle mt-0.5">
          {formatRelativeTime(pledge.createdAt)}
        </p>
      </div>
      <Badge tone={statusToTone(pledge.status)} size="sm">
        {pledge.status}
      </Badge>
    </>
  );
}

function DonationRow({ donation }: { donation: Donation }) {
  const donorName = donation.isAnonymous
    ? "Anonymous donor"
    : donation.donor
      ? `${donation.donor.firstName} ${donation.donor.lastName}`
      : "A donor";
  return (
    <>
      <Avatar
        src={donation.donor?.avatarUrl}
        name={donorName}
        size="sm"
        className="bg-emerald-50 text-emerald-600"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink truncate">
          <span className="font-medium">{donorName}</span> donated{" "}
          <span className="font-medium">
            {formatCurrency(Number(donation.amount))}
          </span>
        </p>
        <p className="text-xs text-ink-subtle mt-0.5">
          {formatRelativeTime(donation.createdAt)}
        </p>
      </div>
      <Badge tone={statusToTone(donation.status)} size="sm">
        {donation.status}
      </Badge>
    </>
  );
}

// ---------- Setup checklist (right rail) ----------

function SetupChecklist({
  stats,
}: {
  stats?: NGODashboard["stats"];
}) {
  const items = [
    { label: "Profile verified", done: true },
    { label: "Invite at least one team member", done: (stats?.totalMembers ?? 0) > 1 },
    { label: "Post your first food need", done: (stats?.openNeeds ?? 0) > 0 },
    { label: "Receive your first pledge", done: (stats?.activePledges ?? 0) > 0 },
  ];
  const completed = items.filter((i) => i.done).length;

  return (
    <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink">Get started</h3>
        <span className="text-xs text-ink-subtle">
          {completed} of {items.length}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                item.done ? "bg-brand-green" : "bg-gray-200",
              )}
            >
              {item.done && (
                <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </div>
            <span
              className={cn(
                "text-sm",
                item.done ? "text-ink-subtle line-through" : "text-ink-soft",
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Skeleton ----------

function DashboardSkeleton() {
  return (
    <div className="space-y-5 max-w-6xl">
      <div className="bg-white rounded-xl border border-border-subtle p-5 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-border-subtle p-5 animate-pulse"
          >
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
            <div className="h-7 bg-gray-100 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
