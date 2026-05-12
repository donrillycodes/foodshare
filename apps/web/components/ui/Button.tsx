import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Button — five variants, three sizes.
// "primary"      → brand-green CTA
// "secondary"    → white/border neutral action
// "ghost"        → no background until hover
// "danger"       → red destructive
// "danger-ghost" → outlined red for lighter destructive contexts

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-green text-white hover:bg-brand-green-dk active:bg-brand-green-700 shadow-[0_1px_2px_rgba(13,26,18,0.10)]",
  secondary:
    "bg-white text-ink border border-border-default hover:bg-surface-muted active:bg-border-subtle shadow-[0_1px_2px_rgba(13,26,18,0.04)]",
  ghost: "bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  "danger-ghost": "bg-white text-red-600 border border-red-200 hover:bg-red-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-xs px-3 h-7 gap-1 rounded-lg",
  md: "text-xs px-3.5 h-9 gap-1.5 rounded-lg",
  lg: "text-sm px-5 h-10 gap-2 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-semibold",
        "transition-all duration-150 focus-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";
