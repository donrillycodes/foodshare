import { ShieldCheck } from "lucide-react";

// AuthShell — small shared bits for /login, /register and /download.
// The brand panel sits on the left on desktop and disappears on mobile;
// the mobile logo takes its place at the top of the form. Keeping these
// in one file means the marketing copy on the dark panel only changes
// in one place if it changes at all.

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
      style={{ background: "#0d1f17" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
          <span className="text-white text-sm font-bold">F</span>
        </div>
        <span className="text-white font-semibold text-sm">FoodShare</span>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-white leading-snug mb-3">
          {heading}
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.55)" }}
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
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
        FoodShare — Winnipeg, Canada
      </p>
    </div>
  );
}

export function MobileLogo() {
  return (
    <div className="flex items-center gap-2.5 mb-8 lg:hidden">
      <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
        <span className="text-white text-sm font-bold">F</span>
      </div>
      <span className="font-semibold text-ink text-sm">FoodShare</span>
    </div>
  );
}

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

// GoogleSoonButton — the placeholder Google button used on login + register.
// Click hands the message back to the parent so it can show it inside the
// existing error banner instead of a toast we don't have yet.
export function GoogleSoonButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 h-10 px-4 rounded-lg border border-border-default bg-white text-sm font-medium text-ink hover:bg-surface-muted transition-colors relative"
    >
      <GoogleIcon />
      Continue with Google
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
        Coming soon
      </span>
    </button>
  );
}

export function OrDivider({ label = "or use email" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border-subtle" />
      <span className="text-[11px] text-ink-subtle uppercase tracking-wide">
        {label}
      </span>
      <div className="flex-1 h-px bg-border-subtle" />
    </div>
  );
}
