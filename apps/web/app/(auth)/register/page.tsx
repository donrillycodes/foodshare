"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/firebase";
import { authApi } from "@/lib/api";
import { TextField, PasswordField } from "@/components/ui/FormField";
import {
  PasswordStrength,
  calculateStrength,
} from "@/components/ui/PasswordStrength";
import { Button } from "@/components/ui/Button";
import {
  BrandPanel,
  MobileLogo,
  GoogleSoonButton,
  OrDivider,
} from "@/components/auth/AuthShell";
import { ArrowLeft, Building2, HeartHandshake, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Register — two-step flow. Step one picks a role (NGO or Donor) so the
// second step can speak the right language ("organisation" vs "donor").
// Donors get redirected to /download after registering since the donor
// experience lives in the mobile app, not the dashboard.

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

  const strength = calculateStrength(form.password);

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

    if (strength.level === "weak") {
      setError("Please choose a stronger password — try a longer phrase or add numbers and symbols.");
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
    } catch (err: unknown) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "";
      const code = (err as { code?: string })?.code ?? "";
      if (
        apiMessage.includes("already exists") ||
        code === "auth/email-already-in-use"
      ) {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (code === "auth/invalid-password") {
        setError("Password must be at least 6 characters");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <BrandPanel
        heading="Join the FoodShare network in Winnipeg."
        subheading="Create your account and start making a difference — whether you are an NGO receiving donations or a donor making pledges."
        bullets={[
          "NGOs get a verified dashboard to manage needs",
          "Donors use the FoodShare mobile app",
          "Every pledge tracked, every donation counted",
        ]}
      />

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-page">
        <div className="w-full max-w-sm">
          <MobileLogo />

          <div className="mb-7">
            <h1 className="text-xl font-semibold text-ink">Create your account</h1>
            <p className="text-sm text-ink-soft mt-1">
              {step === "role"
                ? "Choose how you are joining FoodShare"
                : "Enter your account details"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border-subtle p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            {step === "role" ? (
              <RoleStep onSelect={handleRoleSelect} selectedRole={selectedRole} />
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="text-xs text-ink-subtle hover:text-ink-soft inline-flex items-center gap-1 -mt-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>

                <GoogleSoonButton
                  onClick={() =>
                    setError(
                      "Google sign-in is coming soon. Please use email and password for now.",
                    )
                  }
                />

                <OrDivider />

                {selectedRole === "donor" && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs text-blue-700 font-medium">
                      Donors use the FoodShare mobile app
                    </p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Create your account below — we will direct you to download the
                      app right after.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3.5 py-3">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="First name"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    placeholder="Emmanuel"
                    required
                    autoComplete="given-name"
                    leftIcon={<User className="w-4 h-4" />}
                  />
                  <TextField
                    label="Last name"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    placeholder="Oyenuga"
                    required
                    autoComplete="family-name"
                  />
                </div>

                <TextField
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <div>
                  <PasswordField
                    label="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="At least 6 characters"
                    required
                    autoComplete="new-password"
                  />
                  <div className="mt-2">
                    <PasswordStrength password={form.password} />
                  </div>
                </div>

                <PasswordField
                  label="Confirm password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                  placeholder="Repeat your password"
                  required
                  autoComplete="new-password"
                  error={
                    form.confirmPassword.length > 0 &&
                    form.password !== form.confirmPassword
                      ? "Passwords do not match"
                      : undefined
                  }
                />

                <Button type="submit" disabled={loading} fullWidth size="lg">
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-ink-soft mt-5">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-brand-green hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Step 1 (role picker) ----------

function RoleStep({
  onSelect,
  selectedRole,
}: {
  onSelect: (role: "ngo" | "donor") => void;
  selectedRole: "ngo" | "donor" | null;
}) {
  return (
    <div className="space-y-3">
      <RoleCard
        icon={<Building2 className="w-5 h-5" />}
        title="NGO or Charity Representative"
        description="Register your organisation to receive donations and food pledges"
        active={selectedRole === "ngo"}
        onClick={() => onSelect("ngo")}
      />
      <RoleCard
        icon={<HeartHandshake className="w-5 h-5" />}
        title="Donor"
        description="Give cash donations or food pledges to verified charities"
        active={selectedRole === "donor"}
        onClick={() => onSelect("donor")}
      />
    </div>
  );
}

function RoleCard({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl border-2 text-left transition-all duration-150 flex items-start gap-3",
        active
          ? "border-brand-green bg-brand-green-lt"
          : "border-border-subtle hover:border-brand-green hover:bg-brand-green-lt",
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
          active
            ? "bg-brand-green text-white"
            : "bg-brand-green-lt text-brand-green",
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-xs text-ink-soft mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}
