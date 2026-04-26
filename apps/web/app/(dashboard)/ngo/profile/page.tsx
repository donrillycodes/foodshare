"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/shared/Header";
import { ngoApi } from "@/lib/api";
import { getStatusColor, formatStatus, cn } from "@/lib/utils";
import type { NGODashboard } from "@/types";

const CATEGORIES = [
  { value: "FOOD_BANK", label: "Food Bank" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "EDUCATION", label: "Education" },
  { value: "SHELTER", label: "Shelter" },
  { value: "COMMUNITY", label: "Community" },
];

type FormState = {
  name: string; email: string; phone: string; description: string;
  mission: string; category: string; website: string; address: string;
  city: string; province: string; country: string; postalCode: string;
  logoUrl: string; coverUrl: string;
};

const EMPTY_FORM: FormState = {
  name: "", email: "", phone: "", description: "", mission: "",
  category: "FOOD_BANK", website: "", address: "", city: "Winnipeg",
  province: "Manitoba", country: "Canada", postalCode: "", logoUrl: "", coverUrl: "",
};

const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent focus:bg-white transition-all";

interface FormFieldProps {
  label: string; name: keyof FormState; type?: string;
  placeholder?: string; required?: boolean; textarea?: boolean;
  form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

const FormField = ({ label, name, type = "text", placeholder, required, textarea, form, setForm }: FormFieldProps) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {textarea ? (
      <textarea value={form[name]} onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))} placeholder={placeholder} rows={3} className={cn(inputClass, "resize-none")} />
    ) : (
      <input type={type} value={form[name]} onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))} placeholder={placeholder} className={inputClass} />
    )}
  </div>
);

export default function NGOProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["ngo-dashboard"],
    queryFn: async () => {
      const response = await ngoApi.getDashboard();
      return response.data.data as NGODashboard;
    },
  });

  const ngo = data?.ngo;

  const registerMutation = useMutation({
    mutationFn: () => ngoApi.register(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["ngo-dashboard"] }); setIsRegistering(false); },
  });

  const updateMutation = useMutation({
    mutationFn: () => ngoApi.update(ngo!.id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["ngo-dashboard"] }); setIsEditing(false); },
  });

  const resubmitMutation = useMutation({
    mutationFn: () => ngoApi.resubmit(ngo!.id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["ngo-dashboard"] }); },
  });

  const handleEditStart = () => {
    if (ngo) {
      setForm({ name: ngo.name, email: ngo.email, phone: ngo.phone ?? "", logoUrl: ngo.logoUrl ?? "", coverUrl: ngo.coverUrl ?? "", description: ngo.description, mission: ngo.mission ?? "", category: ngo.category, website: ngo.website ?? "", address: ngo.address, city: ngo.city, province: ngo.province, country: ngo.country, postalCode: ngo.postalCode });
      setIsEditing(true);
    }
  };

  const fieldProps = { form, setForm };

  const CategorySelect = () => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">Category <span className="text-red-500">*</span></label>
      <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputClass}>
        {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col flex-1">
      <Header title="NGO Profile" subtitle="Manage your organisation details" />

      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 animate-pulse max-w-2xl">
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ) : !ngo && !isRegistering ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center max-w-sm mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-green-lt flex items-center justify-center mx-auto mb-4">
              <span className="text-brand-green text-xl font-bold">F</span>
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Register your NGO</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Submit your organisation details for review. Once approved your NGO will be listed on the FoodShare platform.
            </p>
            <button
              onClick={() => { setForm(EMPTY_FORM); setIsRegistering(true); }}
              className="px-6 py-2.5 bg-brand-green text-white text-sm font-medium rounded-lg hover:bg-brand-green-dk transition-colors"
            >
              Get Started
            </button>
          </div>
        ) : isRegistering || isEditing ? (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-5">
                {isRegistering ? "Register your NGO" : "Update NGO Profile"}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Organisation Name" name="name" required placeholder="Winnipeg Food Bank" {...fieldProps} />
                  <FormField label="Contact Email" name="email" type="email" required placeholder="contact@org.ca" {...fieldProps} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Phone" name="phone" placeholder="+1 204 555 0100" {...fieldProps} />
                  <CategorySelect />
                </div>
                <FormField label="Description" name="description" required placeholder="What does your organisation do?" textarea {...fieldProps} />
                <FormField label="Mission Statement" name="mission" placeholder="Optional mission statement" textarea {...fieldProps} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Website" name="website" type="url" placeholder="https://yourorg.ca" {...fieldProps} />
                  <FormField label="Logo URL" name="logoUrl" type="url" placeholder="https://yourorg.ca/logo.png" {...fieldProps} />
                </div>
                <FormField label="Cover Image URL" name="coverUrl" type="url" placeholder="https://yourorg.ca/cover.jpg" {...fieldProps} />
                <FormField label="Street Address" name="address" required placeholder="123 Main Street" {...fieldProps} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="City" name="city" required {...fieldProps} />
                  <FormField label="Province" name="province" required {...fieldProps} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Postal Code" name="postalCode" required placeholder="R3C 0A1" {...fieldProps} />
                  <FormField label="Country" name="country" required {...fieldProps} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => isRegistering ? registerMutation.mutate() : updateMutation.mutate()}
                  disabled={registerMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 bg-brand-green text-white text-sm font-medium rounded-lg hover:bg-brand-green-dk disabled:opacity-50 transition-colors"
                >
                  {registerMutation.isPending || updateMutation.isPending ? "Saving..." : isRegistering ? "Submit Application" : "Save Changes"}
                </button>
                <button
                  onClick={() => { setIsRegistering(false); setIsEditing(false); }}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {registerMutation.isError && (
                <p className="text-xs text-red-600 mt-3">Failed to submit. Please check your details and try again.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl space-y-4">
            {/* Status card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Application Status</h2>
                <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", getStatusColor(ngo!.status))}>
                  {formatStatus(ngo!.status)}
                </span>
              </div>
              {ngo!.rejectionReason && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-red-700 mb-1">Rejection reason</p>
                  <p className="text-sm text-red-600">{ngo!.rejectionReason}</p>
                </div>
              )}
              {ngo!.status === "REJECTED" && ngo!.resubmissionCount < 3 && (
                <button
                  onClick={() => resubmitMutation.mutate()}
                  disabled={resubmitMutation.isPending}
                  className="text-sm text-brand-green hover:underline disabled:opacity-50"
                >
                  {resubmitMutation.isPending ? "Resubmitting..." : "Resubmit application →"}
                </button>
              )}
            </div>

            {/* Details card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Organisation Details</h2>
                <button onClick={handleEditStart} className="text-xs text-brand-green hover:underline font-medium">
                  Edit
                </button>
              </div>
              <div className="space-y-4">
                {ngo!.logoUrl && (
                  <div className="flex justify-center mb-2">
                    <img src={ngo!.logoUrl} alt={ngo!.name} className="w-20 h-20 rounded-full object-cover border border-gray-100" />
                  </div>
                )}
                {[
                  { label: "Name", value: ngo!.name },
                  { label: "Email", value: ngo!.email },
                  { label: "Phone", value: ngo!.phone },
                  { label: "Category", value: formatStatus(ngo!.category) },
                  { label: "Description", value: ngo!.description },
                  { label: "Mission", value: ngo!.mission },
                  { label: "Website", value: ngo!.website },
                  { label: "Address", value: `${ngo!.address}, ${ngo!.city}, ${ngo!.province} ${ngo!.postalCode}` },
                ]
                  .filter((f) => f.value)
                  .map((field) => (
                    <div key={field.label} className="flex gap-4">
                      <p className="text-xs font-medium text-gray-400 w-24 flex-shrink-0 mt-0.5">{field.label}</p>
                      <p className="text-sm text-gray-700 flex-1">{field.value}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
