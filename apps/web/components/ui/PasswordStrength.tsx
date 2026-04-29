"use client";

import { cn } from "@/lib/utils";

// PasswordStrength — four-segment bar that fills as the password gets stronger.
// We score on length and character variety. Not a security guarantee, just a
// nudge toward something the user won't regret. Empty state shows the bar in
// neutral grey so the layout doesn't jump when the user starts typing.

export type StrengthLevel = "empty" | "weak" | "medium" | "strong";

export interface StrengthResult {
  level: StrengthLevel;
  score: number; // 0-4
  label: string;
}

export function calculateStrength(password: string): StrengthResult {
  if (!password) return { level: "empty", score: 0, label: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4 so the bar never overflows.
  score = Math.min(score, 4);

  if (score <= 1) return { level: "weak", score, label: "Weak" };
  if (score <= 3) return { level: "medium", score, label: "Medium" };
  return { level: "strong", score, label: "Strong" };
}

const SEGMENT_COLOUR: Record<StrengthLevel, string> = {
  empty: "bg-gray-200",
  weak: "bg-red-500",
  medium: "bg-amber-500",
  strong: "bg-emerald-500",
};

const LABEL_COLOUR: Record<StrengthLevel, string> = {
  empty: "text-ink-subtle",
  weak: "text-red-600",
  medium: "text-amber-600",
  strong: "text-emerald-600",
};

interface PasswordStrengthProps {
  password: string;
  className?: string;
  showLabel?: boolean;
}

export function PasswordStrength({
  password,
  className,
  showLabel = true,
}: PasswordStrengthProps) {
  const { level, score, label } = calculateStrength(password);
  // Render 4 segments. Number lit = max(score, 1) when there's input.
  const lit = level === "empty" ? 0 : Math.max(1, Math.min(score, 4));

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors duration-200",
              i < lit ? SEGMENT_COLOUR[level] : "bg-gray-200",
            )}
          />
        ))}
      </div>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-[11px] font-medium",
              LABEL_COLOUR[level],
            )}
          >
            {level === "empty" ? "\u00A0" : `Password strength: ${label}`}
          </span>
          {level !== "empty" && level !== "strong" && (
            <span className="text-[11px] text-ink-subtle">
              Use 12+ chars with a mix of cases, numbers and symbols
            </span>
          )}
        </div>
      )}
    </div>
  );
}
