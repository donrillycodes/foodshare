"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/shared/Header";
import { updateApi, ngoApi } from "@/lib/api";
import { formatRelativeTime, getStatusColor, cn } from "@/lib/utils";
import type { NGOUpdate, NGODashboard, PaginatedResponse } from "@/types";
import { Plus, FileText, Eye, Pin, X } from "lucide-react";
import { NGOGuard } from "@/components/ngo/NGOGuard";

const UPDATE_TYPES = [
  { value: "IMPACT_STORY", label: "Impact Story" },
  { value: "CAMPAIGN_UPDATE", label: "Campaign Update" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "THANK_YOU", label: "Thank You" },
];

type UpdateForm = {
  title: string;
  body: string;
  summary: string;
  type: string;
  isPinned: boolean;
  coverImageUrl: string;
};

const EMPTY_FORM: UpdateForm = {
  title: "",
  body: "",
  summary: "",
  type: "ANNOUNCEMENT",
  isPinned: false,
  coverImageUrl: "",
};

const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent focus:bg-white transition-all";

export default function NGOUpdatesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("DRAFT");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<UpdateForm>(EMPTY_FORM);

  const { data: dashboardData } = useQuery({
    queryKey: ["ngo-dashboard"],
    queryFn: async () => {
      const response = await ngoApi.getDashboard();
      return response.data.data as NGODashboard;
    },
  });

  const ngoId = dashboardData?.ngo?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["ngo-updates", ngoId, statusFilter],
    queryFn: async () => {
      const response = await updateApi.getByNGO(ngoId!, { status: statusFilter });
      return response.data.data as PaginatedResponse<NGOUpdate>;
    },
    enabled: !!ngoId,
  });

  const createMutation = useMutation({
    mutationFn: () => updateApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngo-updates"] });
      queryClient.refetchQueries({ queryKey: ["ngo-updates"] });
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
  });

  const createAndPublishMutation = useMutation({
    mutationFn: async () => {
      const response = await updateApi.create(form);
      const newUpdate = response.data.data.update;
      await updateApi.publish(newUpdate.id);
      return newUpdate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngo-updates"] });
      queryClient.refetchQueries({ queryKey: ["ngo-updates"] });
      setShowForm(false);
      setForm(EMPTY_FORM);
      setStatusFilter("PUBLISHED");
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => updateApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngo-updates"] });
      queryClient.refetchQueries({ queryKey: ["ngo-updates"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => updateApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngo-updates"] });
      queryClient.refetchQueries({ queryKey: ["ngo-updates"] });
    },
  });

  const updates = data?.items ?? [];
  const update = (field: keyof UpdateForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <NGOGuard>
      <div className="flex flex-col flex-1">
        <Header title="Updates" subtitle="Share impact stories and announcements with donors" />

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1.5">
              {["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-green text-white text-xs font-medium rounded-lg hover:bg-brand-green-dk transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Write Update
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Write New Update</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Title <span className="text-red-500">*</span></label>
                    <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Your update headline" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Type <span className="text-red-500">*</span></label>
                    <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
                      {UPDATE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Summary</label>
                  <input type="text" value={form.summary} onChange={(e) => update("summary", e.target.value)} placeholder="Short preview shown in the donor feed" className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Content <span className="text-red-500">*</span></label>
                  <textarea value={form.body} onChange={(e) => update("body", e.target.value)} placeholder="Write your full update here..." rows={5} className={cn(inputClass, "resize-none")} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Cover Image URL</label>
                  <input type="url" value={form.coverImageUrl} onChange={(e) => update("coverImageUrl", e.target.value)} placeholder="https://example.com/image.jpg" className={inputClass} />
                  <p className="text-xs text-gray-400 mt-1">Direct file upload will be available when Firebase Storage is integrated</p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.isPinned} onChange={(e) => update("isPinned", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green" />
                  <span className="text-sm text-gray-700">Pin to top of NGO profile</span>
                </label>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => createAndPublishMutation.mutate()}
                  disabled={createAndPublishMutation.isPending || !form.title || !form.body}
                  className="px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:bg-brand-green-dk disabled:opacity-50 transition-colors"
                >
                  {createAndPublishMutation.isPending ? "Publishing..." : "Publish Now"}
                </button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !form.title || !form.body}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="px-4 py-2 bg-white text-gray-500 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {(createMutation.isError || createAndPublishMutation.isError) && (
                <p className="text-xs text-red-600 mt-3">Failed to save. Please check your details and try again.</p>
              )}
            </div>
          )}

          {/* List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : updates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <FileText className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No {statusFilter.toLowerCase()} updates</p>
              {statusFilter === "DRAFT" && (
                <button onClick={() => setShowForm(true)} className="text-xs text-brand-green hover:underline mt-2 inline-block">
                  Write an update →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {updates.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {item.coverImageUrl && (
                        <img src={item.coverImageUrl} alt={item.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.isPinned && <Pin className="w-3 h-3 text-brand-green" />}
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getStatusColor(item.status))}>
                            {item.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                            {item.type.replace(/_/g, " ")}
                          </span>
                        </div>
                        {item.summary && (
                          <p className="text-xs text-gray-500 mt-0.5">{item.summary}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">{formatRelativeTime(item.publishedAt ?? item.createdAt)}</span>
                          {item.status === "PUBLISHED" && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {item.viewsCount} views
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {item.status === "DRAFT" && (
                        <button
                          onClick={() => publishMutation.mutate(item.id)}
                          disabled={publishMutation.isPending}
                          className="text-xs px-3 py-1.5 bg-brand-green text-white rounded-lg hover:bg-brand-green-dk transition-colors disabled:opacity-50"
                        >
                          Publish
                        </button>
                      )}
                      {item.status !== "ARCHIVED" && (
                        <button
                          onClick={() => archiveMutation.mutate(item.id)}
                          disabled={archiveMutation.isPending}
                          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NGOGuard>
  );
}
