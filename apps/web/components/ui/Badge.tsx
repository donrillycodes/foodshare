import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Badge — small status pill used everywhere a state needs naming.
// Pick a tone explicitly OR pass a status string and let `statusToTone`
// map it to the right colour family. Keeping this in one place stops
// the codebase from drifting into "blue here, indigo there" inconsistency.

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand"
  | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: "sm" | "md";
  dot?: boolean;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
  brand: "bg-brand-green-lt text-brand-green",
  muted: "bg-gray-50 text-gray-500",
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-gray-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  brand: "bg-brand-green",
  muted: "bg-gray-300",
};

const SIZE_CLASSES = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1",
  md: "text-xs px-2 py-0.5 gap-1.5",
};

export function Badge({
  className,
  tone = "neutral",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium leading-none",
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", DOT_CLASSES[tone])} />
      )}
      {children}
    </span>
  );
}

// Map FoodShare statuses to a tone. Any status not listed falls back
// to neutral so the UI never throws — it just renders grey.
export function statusToTone(status: string): BadgeTone {
  const s = status.toUpperCase();
  switch (s) {
    case "APPROVED":
    case "PUBLISHED":
    case "FULFILLED":
    case "CONFIRMED":
    case "ACTIVE":
    case "SUCCEEDED":
      return "success";
    case "PENDING":
    case "RESUBMITTED":
    case "DRAFT":
    case "PROCESSING":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
    case "FAILED":
    case "SUSPENDED":
    case "FLAGGED":
      return "danger";
    case "OPEN":
    case "INFO":
      return "info";
    case "EXPIRED":
    case "CLOSED":
    case "ARCHIVED":
      return "muted";
    case "URGENT":
      return "danger";
    default:
      return "neutral";
  }
}
