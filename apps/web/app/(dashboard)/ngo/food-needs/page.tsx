"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/shared/Header";
import { foodNeedApi, ngoApi } from "@/lib/api";
import { formatDate, getStatusColor, cn } from "@/lib/utils";
import type { FoodNeed, NGODashboard, PaginatedResponse } from "@/types";
import { Plus, Package, AlertTriangle, X } from "lucide-react";

const CATEGORIES = [
  { value: "CANNED_GOODS", label: "Canned Goods" },
  { value: "GRAINS", label: "Grains" },
  { value: "PASTA", label: "Pasta" },
  { value: "CONDIMENTS", label: "Condiments" },
  { value: "BEVERAGES", label: "Beverages" },
  { value: "OTHER", label: "Other" },
];

type FoodNeedForm = {
  title: string;
  description: string;
  itemName: string;
  itemCategory: string;
  unit: string;
  quantityRequired: string;
  deadline: string;
  dropOffAddress: string;
  dropOffInstructions: string;
  isUrgent: boolean;
};

const EMPTY_FORM: FoodNeedForm = {
  title: "",
  description: "",
  itemName: "",
  itemCategory: "CANNED_GOODS",
  unit: "",
  quantityRequired: "",
  deadline: "",
  dropOffAddress: "",
  dropOffInstructions: "",
  isUrgent: false,
};

export default function NGOFoodNeedsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [form, setForm] = useState<FoodNeedForm>(EMPTY_FORM);

  // Get NGO ID first
  const { data: dashboardData } = useQuery({
    queryKey: ["ngo-dashboard"],
    queryFn: async () => {
      const response = await ngoApi.getDashboard();
      return response.data.data as NGODashboard;
    },
  });

  const ngoId = dashboardData?.ngo?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["ngo-food-needs", ngoId, statusFilter],
    queryFn: async () => {
      const response = await foodNeedApi.getByNGO(ngoId!, {
        status: statusFilter,
      });
      return response.data.data as PaginatedResponse<FoodNeed>;
    },
    enabled: !!ngoId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      foodNeedApi.create({
        ...form,
        quantityRequired: parseInt(form.quantityRequired),
        deadline: form.deadline || undefined,
        dropOffAddress: form.dropOffAddress || undefined,
        dropOffInstructions: form.dropOffInstructions || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngo-food-needs"] });
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => foodNeedApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngo-food-needs"] });
      queryClient.refetchQueries({ queryKey: ["ngo-food-needs"] });
    },
  });

  const needs = data?.items ?? [];

  const update = (field: keyof FoodNeedForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Food Needs"
        subtitle="Post and manage your food item requests"
      />

      <div className="flex-1 p-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {["OPEN", "FULFILLED", "CLOSED", "EXPIRED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === s
                    ? "bg-brand-green text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300",
                )}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white text-sm rounded-lg hover:bg-brand-green-dk transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post Food Need
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Post New Food Need
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="Canned Chickpeas Needed"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.itemName}
                    onChange={(e) => update("itemName", e.target.value)}
                    placeholder="Chickpeas"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.itemCategory}
                    onChange={(e) => update("itemCategory", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => update("unit", e.target.value)}
                    placeholder="cans"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Quantity Required <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.quantityRequired}
                    onChange={(e) => update("quantityRequired", e.target.value)}
                    placeholder="50"
                    min="1"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="More details about this need..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => update("deadline", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Drop Off Address
                  </label>
                  <input
                    type="text"
                    value={form.dropOffAddress}
                    onChange={(e) => update("dropOffAddress", e.target.value)}
                    placeholder="If different from main address"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Drop Off Instructions
                </label>
                <input
                  type="text"
                  value={form.dropOffInstructions}
                  onChange={(e) =>
                    update("dropOffInstructions", e.target.value)
                  }
                  placeholder="e.g. Ring the bell at the side entrance"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isUrgent}
                  onChange={(e) => update("isUrgent", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                />
                <span className="text-sm text-gray-700">
                  Mark as urgent — appears prominently in donor feed
                </span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="px-5 py-2.5 bg-brand-green text-white text-sm rounded-lg hover:bg-brand-green-dk disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? "Posting..." : "Post Food Need"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>

            {createMutation.isError && (
              <p className="text-sm text-red-600 mt-3">
                Failed to post food need. Please check your details.
              </p>
            )}
          </div>
        )}

        {/* Food needs list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"
              >
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : needs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No {statusFilter.toLowerCase()} food needs
            </p>
            {statusFilter === "OPEN" && (
              <button
                onClick={() => setShowForm(true)}
                className="text-sm text-brand-green hover:underline mt-2 inline-block"
              >
                Post your first food need →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {needs.map((need) => (
              <div
                key={need.id}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {need.title}
                      </p>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          getStatusColor(need.status),
                        )}
                      >
                        {need.status}
                      </span>
                      {need.isUrgent && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3" />
                          Urgent
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      {need.itemName} · {need.itemCategory.replace(/_/g, " ")} ·{" "}
                      {need.quantityFulfilled}/{need.quantityRequired}{" "}
                      {need.unit} pledged
                    </p>

                    {/* Progress bar */}
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 max-w-xs">
                      <div
                        className="bg-brand-green h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (need.quantityFulfilled / need.quantityRequired) *
                              100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    {need.deadline && (
                      <p className="text-xs text-gray-400 mt-1">
                        Deadline: {formatDate(need.deadline)}
                      </p>
                    )}
                  </div>

                  {need.status === "OPEN" && (
                    <button
                      onClick={() => closeMutation.mutate(need.id)}
                      disabled={closeMutation.isPending}
                      className="text-xs px-3 py-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex-shrink-0 ml-4"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
