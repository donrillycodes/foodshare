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
      // Step 1 — Sign in with Firebase
      await signIn(email, password);

      // Step 2 — Fetch user profile from our API
      const response = await authApi.getMe();
      const user = response.data.data.user;

      // Step 3 — Block donors from accessing the dashboard
      if (user.role === "DONOR") {
        setError("This dashboard is for NGO and Admin users only.");
        setLoading(false);
        return;
      }

      // Step 4 — Route based on role
      if (user.role === "NGO") {
        router.push("/ngo");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      // Handle Firebase auth errors with friendly messages
      const code = err?.code ?? "";
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-green mb-4">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to FoodShare
          </h1>
          <p className="text-gray-500 mt-1">
            Sign in to your NGO or Admin dashboard
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
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
                  "w-full px-4 py-2.5 rounded-lg border text-sm",
                  "border-gray-200 bg-white text-gray-900",
                  "placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent",
                  "transition-all duration-150",
                )}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
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
                  "w-full px-4 py-2.5 rounded-lg border text-sm",
                  "border-gray-200 bg-white text-gray-900",
                  "placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent",
                  "transition-all duration-150",
                )}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-2.5 px-4 rounded-lg text-sm font-medium",
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

        {/* Footer note */}
        <p className="text-center text-sm text-gray-400 mt-6">
          FoodShare Dashboard — Winnipeg, Canada
        </p>
      </div>
    </div>
  );
}
