import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// EmptyState — the "nothing here yet" panel. Used everywhere a list might
// load with zero rows. Centralising the layout means every empty list in
// the dashboard speaks the same visual language.

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-border-subtle p-10 text-center",
        className,
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-surface-muted text-ink-subtle flex items-center justify-center mx-auto mb-3">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && (
        <p className="text-xs text-ink-subtle mt-1 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
