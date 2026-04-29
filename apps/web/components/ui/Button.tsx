import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Button — four variants and three sizes cover every spot in the app.
// "primary" is the brand-green CTA. "secondary" is the white-with-border
// neutral action. "ghost" has no background until hover. "danger" is a
// red destructive action that uses light fill so it doesn't shout.

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-green text-white hover:bg-brand-green-dk active:bg-brand-green-700 shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
  secondary:
    "bg-white text-ink border border-border-default hover:bg-surface-muted active:bg-border-subtle",
  ghost:
    "bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  "danger-ghost":
    "bg-white text-red-600 border border-red-200 hover:bg-red-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-xs px-3 h-7 gap-1",
  md: "text-xs px-3.5 h-9 gap-1.5",
  lg: "text-sm px-5 h-10 gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg",
        "transition-all duration-150 focus-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current",
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
