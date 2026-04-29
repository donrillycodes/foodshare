import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// StatCard — the four tiles you see at the top of most dashboard pages.
// Designed so the value reads first (large), the label second (small/grey),
// and an optional metadata line ties it to a real-world meaning ("3 awaiting
// approval", "+12% vs last week"). Trend colour shifts the metadata green or
// red without making it loud.

type Trend = "up" | "down" | "neutral";

interface StatCardProps {
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  trend?: Trend;
  icon?: ReactNode;
  iconClassName?: string;
  className?: string;
}

const TREND_CLASSES: Record<Trend, string> = {
  up: "text-emerald-600",
  down: "text-red-600",
  neutral: "text-ink-subtle",
};

export function StatCard({
  label,
  value,
  meta,
  trend = "neutral",
  icon,
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-border-subtle p-5",
        "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-ink-subtle uppercase tracking-wide">
          {label}
        </p>
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-lg bg-brand-green-lt text-brand-green flex items-center justify-center",
              iconClassName,
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-ink leading-tight">{value}</p>
      {meta && (
        <p className={cn("text-xs mt-2", TREND_CLASSES[trend])}>{meta}</p>
      )}
    </div>
  );
}
