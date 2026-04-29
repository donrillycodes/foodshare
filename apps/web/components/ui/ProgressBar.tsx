import { cn } from "@/lib/utils";

// ProgressBar — used on food-need cards to show "X of Y fulfilled".
// Tone shifts colour: brand green by default, amber when the need is
// past 80% (almost full), red when urgent and nowhere near fulfilled.

type ProgressTone = "brand" | "success" | "warning" | "danger" | "neutral";

interface ProgressBarProps {
  current: number;
  total: number;
  tone?: ProgressTone;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const FILL_COLOUR: Record<ProgressTone, string> = {
  brand: "bg-brand-green",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  neutral: "bg-gray-400",
};

const HEIGHT: Record<"sm" | "md", string> = {
  sm: "h-1",
  md: "h-1.5",
};

export function ProgressBar({
  current,
  total,
  tone = "brand",
  showLabel = false,
  className,
  size = "md",
}: ProgressBarProps) {
  const safeTotal = total > 0 ? total : 1;
  const pct = Math.min(100, Math.max(0, (current / safeTotal) * 100));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-ink-subtle">
            {current} of {total}
          </span>
          <span className="text-xs font-medium text-ink-soft">
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-gray-100 rounded-full overflow-hidden",
          HEIGHT[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            FILL_COLOUR[tone],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
