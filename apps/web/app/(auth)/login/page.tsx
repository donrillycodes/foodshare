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
        setError(
          "Too many failed attempts. Please wait a few minutes and try again.",
        );
      } else if (code === "auth/user-disabled") {
        setError("Your account has been disabled. Please contact support.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Dark brand panel — visible on desktop only */}
      <BrandPanel />

      {/* Form panel
          Mobile:  top-aligned with padding-top so logo + form sit near top,
                   no dead space above or below.
          Desktop: centred vertically (the brand panel fills the left half). */}
      <div className="flex-1 flex flex-col items-center justify-start md:justify-center px-5 pt-12 pb-10 md:pt-0 md:pb-0 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Small logo — only shown on mobile when BrandPanel is hidden */}
          <MobileLogo />

          {/* Heading */}
          <div className="mb-8 mt-2">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to your NGO or Admin dashboard
            </p>
          </div>

          {/* Card — white surface with real shadow so it lifts off the page */}
          <div
            className="bg-white rounded-2xl p-6 md:p-8"
            style={{
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
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

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
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

              {/* Extra breathing room between last field and button */}
              <div className="pt-1">
                <Button type="submit" disabled={loading} fullWidth size="lg">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to GivHive?{" "}
            <Link
              href="/register"
              className="text-brand-green hover:underline font-semibold"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
