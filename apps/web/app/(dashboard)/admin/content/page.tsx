"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/shared/Header";
import { updateApi } from "@/lib/api";
import { formatRelativeTime, getStatusColor, cn } from "@/lib/utils";
import type { NGOUpdate, PaginatedResponse } from "@/types";
import { Flag, Eye, FileText } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";

export default function ContentPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("PUBLISHED");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-content", statusFilter, flaggedOnly],
    queryFn: async () => {
      const response = await updateApi.adminGetAll({
        status: statusFilter || undefined,
        isFlagged: flaggedOnly ? "true" : undefined,
      });
      return response.data.data as PaginatedResponse<NGOUpdate>;
    },
  });

  const flagMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      updateApi.flag(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      setFlaggingId(null);
      setFlagReason("");
    },
  });

  const updates = data?.items ?? [];

  return (
    <AdminGuard permission="canManageContent">
      <div className="flex flex-col flex-1">
        <Header title="Content Moderation" subtitle="Review and moderate NGO posts and updates" />

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-1.5">
              {["PUBLISHED", "DRAFT", "ARCHIVED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    statusFilter === status
                      ? "bg-brand-green text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300",
                  )}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => setFlaggedOnly(!flaggedOnly)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                flaggedOnly ? "bg-red-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300",
              )}
            >
              <Flag className="w-3 h-3" />
              Flagged only
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : updates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <FileText className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No content found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className={cn(
                    "bg-white rounded-xl border overflow-hidden hover:shadow-sm transition-shadow",
                    update.isFlagged ? "border-red-200" : "border-gray-100",
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-medium text-gray-900">{update.title}</p>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getStatusColor(update.status))}>
                            {update.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                            {update.type.replace(/_/g, " ")}
                          </span>
                          {update.isFlagged && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Flagged</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-xs text-gray-500">{update.ngo.name}</p>
                          <span className="text-gray-300">·</span>
                          <p className="text-xs text-gray-400">{formatRelativeTime(update.publishedAt ?? update.createdAt)}</p>
                          <span className="text-gray-300">·</span>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Eye className="w-3 h-3" />{update.viewsCount} views
                          </p>
                        </div>
                        {update.isFlagged && update.flaggedReason && (
                          <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            <p className="text-xs text-red-700">
                              <span className="font-medium">Flag reason: </span>{update.flaggedReason}
                            </p>
                          </div>
                        )}
                      </div>
                      {!update.isFlagged && (
                        <button
                          onClick={() => setFlaggingId(update.id)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex-shrink-0"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          Flag
                        </button>
                      )}
                    </div>

                    {flaggingId === update.id && (
                      <div className="mt-4 space-y-2">
                        <textarea
                          value={flagReason}
                          onChange={(e) => setFlagReason(e.target.value)}
                          placeholder="Enter flag reason (minimum 10 characters)..."
                          rows={2}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { if (flagReason.trim().length >= 10) { flagMutation.mutate({ id: update.id, reason: flagReason }); } }}
                            disabled={flagReason.trim().length < 10 || flagMutation.isPending}
                            className="px-3.5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            {flagMutation.isPending ? "Flagging..." : "Confirm Flag"}
                          </button>
                          <button onClick={() => { setFlaggingId(null); setFlagReason(""); }} className="px-3.5 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
