import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Card — the white surface that holds most content blocks.
// Uses subtle border + barely-there shadow so it lifts off the page
// without screaming. Padding is left to the caller — content blocks
// vary too much to bake one in.

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padded = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-xl border border-border-subtle",
        "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        padded && "p-5",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between mb-4", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-sm font-semibold text-ink", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between gap-3 pt-4 mt-4 border-t border-border-subtle", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";
