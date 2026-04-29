import { cn } from "@/lib/utils";

// Pull the first letter of each of the first two whitespace-separated
// chunks of a name. "Winnipeg Food Bank" → "WF"; "Emmanuel" → "E".
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Avatar — circular initial-or-image badge used on members, donors, NGO logos.
// Falls back to brand-tinted initials if no image URL is provided. We pull
// initials via the existing getInitials() helper so the whole app uses one rule.

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
  alt?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
  xl: "w-20 h-20 text-base",
};

export function Avatar({
  src,
  name,
  size = "md",
  className,
  alt,
}: AvatarProps) {
  const initials = name ? initialsFromName(name) : "?";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0",
        "bg-brand-green-lt text-brand-green font-semibold",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? "avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
