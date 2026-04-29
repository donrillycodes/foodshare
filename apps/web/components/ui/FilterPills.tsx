"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// FilterPills — the segmented tab row that replaces dropdowns on list pages.
// Counts go inside the pill so a user can see "Pending (3) — Approved (24)"
// at a glance without needing to apply each filter to find out.

export interface FilterPillOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterPillsProps<T extends string = string> {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  rightSlot?: ReactNode;
}

export function FilterPills<T extends string = string>({
  options,
  value,
  onChange,
  className,
  rightSlot,
}: FilterPillsProps<T>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 flex-wrap",
        className,
      )}
    >
      <div className="inline-flex items-center gap-1 bg-surface-muted p-1 rounded-lg">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-md transition-all",
                active
                  ? "bg-white text-ink shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              <span>{opt.label}</span>
              {typeof opt.count === "number" && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full leading-none",
                    active
                      ? "bg-brand-green-lt text-brand-green"
                      : "bg-white text-ink-subtle",
                  )}
                >
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {rightSlot}
    </div>
  );
}
