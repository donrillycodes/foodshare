"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/firebase";
import { authApi } from "@/lib/api";
import { TextField, PasswordField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import {
  BrandPanel,
  MobileLogo,
  GoogleSoonButton,
  OrDivider,
} from "@/components/auth/AuthShell";
import { Mail } from "lucide-react";

// Login — left column is the dark brand panel, right column is the form.
// We keep the Google button visible so the placement is correct for when
// the provider gets wired up — but until then it shows a "Coming soon"
// pill and the click sets an error message. The brand panel gives the
// page weight on wide screens and collapses to just a small logo on mobile.

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      const response = await authApi.getMe();
      const user = response.data.data.user;

      if (user.role === "DONOR") {
        setError("This dashboard is for NGO and Admin users only.");
        setLoading(false);
        return;
      }

      if (user.role === "NGO") {
        router.push("/ngo");
      } else {
        router.push("/admin");
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait a few minutes and try again.");
      } else if (code === "auth/user-disabled") {
        setError("Your account has been disabled. Please contact support.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-page">
        <div className="w-full max-w-sm">
          <MobileLogo />

          <div className="mb-7">
            <h1 className="text-xl font-semibold text-ink">Welcome back</h1>
            <p className="text-sm text-ink-soft mt-1">
              Sign in to your NGO or Admin dashboard
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border-subtle p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <GoogleSoonButton
              onClick={() =>
                setError(
                  "Google sign-in is coming soon. Please use email and password for now.",
                )
              }
            />

            <div className="my-5">
              <OrDivider />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3.5 py-3">
                  {error}
                </div>
              )}

              <TextField
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organisation.org"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />

              <PasswordField
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                autoComplete="current-password"
              />

              <Button type="submit" disabled={loading} fullWidth size="lg">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-ink-soft mt-5">
            New to FoodShare?{" "}
            <Link href="/register" className="text-brand-green hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

