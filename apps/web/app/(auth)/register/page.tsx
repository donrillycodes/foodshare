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
  const [selectedRole, setSelectedRole] = useState<"ngo" | "donor" | null>(null);
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
    setStep("details");
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
      await authApi.register({
        email: form.email.toLowerCase().trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: selectedRole === "ngo" ? "NGO" : "DONOR",
      });

      await signIn(form.email, form.password);

      if (selectedRole === "donor") {
        router.push("/download");
      } else {
        router.push("/ngo");
      }
    } catch (err: any) {
      const code = err?.response?.data?.message ?? err?.code ?? "";
      if (code.includes("already exists") || err?.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (err?.code === "auth/invalid-password") {
        setError("Password must be at least 6 characters");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  const inputClass = cn(
    "w-full px-3.5 py-2.5 rounded-lg border text-sm",
    "border-gray-200 bg-gray-50 text-gray-900",
    "placeholder:text-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent focus:bg-white",
    "transition-all duration-150",
  );

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
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
            Join the FoodShare network in Winnipeg.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            Create your account and start making a difference — whether you are an NGO receiving donations or a donor making pledges.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "NGOs get a verified dashboard to manage needs",
              "Donors use the FoodShare mobile app",
              "Every pledge tracked, every donation counted",
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
            <h1 className="text-xl font-semibold text-gray-900">Create your account</h1>
            <p className="text-sm text-gray-500 mt-1">
              {step === "role" ? "Choose how you are joining FoodShare" : "Enter your account details"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
            {/* Step 1 — Role selection */}
            {step === "role" && (
              <div className="space-y-3">
                <button
                  onClick={() => handleRoleSelect("ngo")}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-150",
                    selectedRole === "ngo"
                      ? "border-brand-green bg-brand-green-lt"
                      : "border-gray-100 hover:border-brand-green hover:bg-brand-green-lt",
                  )}
                >
                  <p className="text-sm font-semibold text-gray-900">NGO or Charity Representative</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Register your organisation to receive donations and food pledges
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
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Give cash donations or food pledges to verified charities
                  </p>
                </button>
              </div>
            )}

            {/* Step 2 — Account details */}
            {step === "details" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-1"
                >
                  ← Back
                </button>

                {selectedRole === "donor" && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs text-blue-700 font-medium">Donors use the FoodShare mobile app</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Create your account below and we will direct you to download the app.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3.5 py-3">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">First name</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      placeholder="Emmanuel"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Last name</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      placeholder="Oyenuga"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="At least 6 characters"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Repeat your password"
                    required
                    className={inputClass}
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
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-green hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
