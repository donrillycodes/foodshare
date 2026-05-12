import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// StatCard — four summary tiles at the top of dashboard pages.
// Value reads first (large), label second (small/muted), optional
// meta line anchors it to real-world meaning.

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

const TREND_CONFIG: Record<
  Trend,
  {
    text: string;
    bg: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  up: { text: "text-emerald-700", bg: "bg-emerald-50", Icon: TrendingUp },
  down: { text: "text-red-600", bg: "bg-red-50", Icon: TrendingDown },
  neutral: { text: "text-ink-subtle", bg: "bg-surface-muted", Icon: Minus },
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
  const { text, bg, Icon } = TREND_CONFIG[trend];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-border-subtle p-5",
        "shadow-[0_1px_3px_rgba(13,26,18,0.05)]",
        "hover:shadow-[0_4px_12px_rgba(13,26,18,0.07)] transition-shadow duration-200",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-ink-subtle uppercase tracking-widest">
          {label}
        </p>
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-xl bg-brand-green-lt text-brand-green flex items-center justify-center",
              iconClassName,
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-ink leading-tight">{value}</p>

      {meta && (
        <div
          className={cn(
            "inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 rounded-full",
            bg,
            text,
          )}
        >
          <Icon className="w-3 h-3" />
          <span>{meta}</span>
        </div>
      )}
    </div>
  );
}
