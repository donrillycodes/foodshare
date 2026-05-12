import { ShieldCheck } from "lucide-react";

// AuthShell — shared pieces for /login, /register, and /download.
// The brand panel sits on the left on desktop; on mobile it collapses to
// a compact top logo + tagline. Everything references GivHive.

// ─── Hexagon hive logo mark ────────────────────────────────────────────────
export function HiveMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <path d="M14 2L24.3923 8V20L14 26L3.60769 20V8L14 2Z" fill="#1a7a4a" />
      <path
        d="M14 7L19.1962 10V16L14 19L8.80385 16V10L14 7Z"
        fill="#4de69e"
        opacity="0.9"
      />
    </svg>
  );
}

// ─── Dark brand panel (desktop left column) ────────────────────────────────
export function BrandPanel({
  heading = "Connecting food donors with the communities that need them most.",
  subheading = "The management dashboard for NGOs and administrators running food donation programmes in Winnipeg.",
  bullets = [
    "Verified NGO organisations only",
    "Real-time food pledge tracking",
    "Secure, role-based access control",
  ],
}: {
  heading?: string;
  subheading?: string;
  bullets?: string[];
}) {
  return (
    <div
      className="hidden lg:flex lg:w-[420px] flex-col justify-between p-10 flex-shrink-0"
      style={{ background: "#0b1c13" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <HiveMark size={28} />
        <span className="text-white font-semibold text-sm tracking-tight">
          GivHive
        </span>
      </div>

      {/* Copy */}
      <div>
        <h2 className="text-2xl font-semibold text-white leading-snug mb-3">
          {heading}
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.52)" }}
        >
          {subheading}
        </p>

        <div className="mt-8 space-y-3">
          {bullets.map((point) => (
            <div key={point} className="flex items-center gap-3">
              <ShieldCheck
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "#4de69e" }}
              />
              <p
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.52)" }}
              >
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
        GivHive — Winnipeg, Canada
      </p>
    </div>
  );
}

// ─── Mobile top logo (replaces the brand panel on small screens) ───────────
export function MobileLogo() {
  return (
    <div className="flex flex-col items-center mb-8 lg:hidden">
      <div className="flex items-center gap-2.5 mb-1">
        <HiveMark size={28} />
        <span className="font-semibold text-ink text-base tracking-tight">
          GivHive
        </span>
      </div>
      <p className="text-xs text-ink-subtle text-center">
        NGO &amp; Admin Dashboard
      </p>
    </div>
  );
}

// ─── Google SSO placeholder ────────────────────────────────────────────────
export function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleSoonButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 h-10 px-4 rounded-xl border border-border-default bg-white text-sm font-medium text-ink hover:bg-surface-muted transition-colors relative"
    >
      <GoogleIcon />
      Continue with Google
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
        Soon
      </span>
    </button>
  );
}

export function OrDivider({ label = "or use email" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border-subtle" />
      <span className="text-[11px] text-ink-subtle uppercase tracking-wide font-medium">
        {label}
      </span>
      <div className="flex-1 h-px bg-border-subtle" />
    </div>
  );
}
