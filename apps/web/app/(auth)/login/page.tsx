"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/firebase";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";

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
    } catch (err: any) {
      const code = err?.code ?? "";
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
      {/* Brand panel */}
      <div
        className="hidden lg:flex lg:w-[420px] flex-col justify-between p-10 flex-shrink-0"
        style={{ background: "#0d1f17" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
            <span className="text-white text-sm font-bold">F</span>
          </div>
          <span className="text-white font-semibold text-sm">FoodShare</span>
        </div>

        {/* Tagline */}
        <div>
          <h2 className="text-2xl font-semibold text-white leading-snug mb-3">
            Connecting food donors with the communities that need them most.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            The management dashboard for NGOs and administrators running food donation programmes in Winnipeg.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Verified NGO organisations only",
              "Real-time food pledge tracking",
              "Secure, role-based access control",
            ].map((point) => (
              <div key={point} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green-mid flex-shrink-0" />
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          FoodShare — Winnipeg, Canada
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-page">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">FoodShare</span>
          </div>

          <div className="mb-7">
            <h1 className="text-xl font-semibold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to your NGO or Admin dashboard
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3.5 py-3">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organisation.org"
                  required
                  className={cn(
                    "w-full px-3.5 py-2.5 rounded-lg border text-sm",
                    "border-gray-200 bg-gray-50 text-gray-900",
                    "placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent focus:bg-white",
                    "transition-all duration-150",
                  )}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "w-full px-3.5 py-2.5 rounded-lg border text-sm",
                    "border-gray-200 bg-gray-50 text-gray-900",
                    "placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent focus:bg-white",
                    "transition-all duration-150",
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-2.5 px-4 rounded-lg text-sm font-medium mt-1",
                  "bg-brand-green text-white",
                  "hover:bg-brand-green-dk transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                )}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-500 mt-5">
            New to FoodShare?{" "}
            <a href="/register" className="text-brand-green hover:underline font-medium">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
