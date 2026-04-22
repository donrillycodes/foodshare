"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/firebase";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Step = "role" | "details";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<"ngo" | "donor" | null>(
    null,
  );
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (role: "ngo" | "donor") => {
    setSelectedRole(role);
    if (role === "donor") {
      setStep("details");
    } else {
      setStep("details");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Register via our API — creates Firebase account and database record
      await authApi.register({
        email: form.email.toLowerCase().trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: selectedRole === "ngo" ? "NGO" : "DONOR",
      });

      // Sign in immediately after registration
      await signIn(form.email, form.password);

      // Route based on selected role
      if (selectedRole === "donor") {
        // Donors belong on the mobile app
        router.push("/download");
      } else {
        // NGO managers go to their dashboard
        router.push("/ngo");
      }
    } catch (err: any) {
      const code = err?.response?.data?.message ?? err?.code ?? "";
      if (
        code.includes("already exists") ||
        err?.code === "auth/email-already-in-use"
      ) {
        setError(
          "An account with this email already exists. Please sign in instead.",
        );
      } else if (err?.code === "auth/invalid-password") {
        setError("Password must be at least 6 characters");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-green mb-4">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join FoodShare</h1>
          <p className="text-gray-500 mt-1">
            Create your account to get started
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step 1 — Role selection */}
          {step === "role" && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700 text-center mb-6">
                I am joining FoodShare as a...
              </p>

              <button
                onClick={() => handleRoleSelect("ngo")}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all duration-150",
                  selectedRole === "ngo"
                    ? "border-brand-green bg-brand-green-lt"
                    : "border-gray-100 hover:border-brand-green hover:bg-brand-green-lt",
                )}
              >
                <p className="text-sm font-semibold text-gray-900">
                  NGO or Charity Representative
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Register your organisation to receive donations and food
                  pledges
                </p>
              </button>

              <button
                onClick={() => handleRoleSelect("donor")}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all duration-150",
                  selectedRole === "donor"
                    ? "border-brand-green bg-brand-green-lt"
                    : "border-gray-100 hover:border-brand-green hover:bg-brand-green-lt",
                )}
              >
                <p className="text-sm font-semibold text-gray-900">Donor</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Give cash donations or food pledges to verified charities
                </p>
              </button>
            </div>
          )}

          {/* Step 2 — Account details */}
          {step === "details" && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Back button */}
              <button
                type="button"
                onClick={() => setStep("role")}
                className="text-xs text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1"
              >
                ← Back
              </button>

              {/* Donor info banner */}
              {selectedRole === "donor" && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2">
                  <p className="text-xs text-blue-700 font-medium">
                    Donors use the FoodShare mobile app
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Create your account below and we will direct you to download
                    the app.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    First name
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    placeholder="Emmanuel"
                    required
                    className={cn(
                      "w-full px-3 py-2.5 rounded-lg border text-sm",
                      "border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent",
                    )}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    placeholder="Oyenuga"
                    required
                    className={cn(
                      "w-full px-3 py-2.5 rounded-lg border text-sm",
                      "border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent",
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="you@example.com"
                  required
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg border text-sm",
                    "border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent",
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="At least 6 characters"
                  required
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg border text-sm",
                    "border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent",
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Repeat your password"
                  required
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg border text-sm",
                    "border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent",
                  )}
                />
              </div>

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
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-brand-green hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>

        {/* Sign in link on login page too */}
        <p className="text-center text-sm text-gray-400 mt-2">
          FoodShare Dashboard — Winnipeg, Canada
        </p>
      </div>
    </div>
  );
}
