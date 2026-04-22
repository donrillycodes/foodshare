"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/shared/Header";
import { foodPledgeApi, ngoApi } from "@/lib/api";
import { formatDate, getStatusColor, cn } from "@/lib/utils";
import type { FoodPledge, NGODashboard, PaginatedResponse } from "@/types";
import { Heart, CheckCircle, XCircle, Clock } from "lucide-react";
import { NGOGuard } from "@/components/ngo/NGOGuard";

export default function NGOPledgesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: dashboardData } = useQuery({
    queryKey: ["ngo-dashboard"],
    queryFn: async () => {
      const response = await ngoApi.getDashboard();
      return response.data.data as NGODashboard;
    },
  });

  const ngoId = dashboardData?.ngo?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["ngo-pledges", ngoId, statusFilter],
    queryFn: async () => {
      const response = await foodPledgeApi.getByNGO(ngoId!, {
        status: statusFilter,
      });
      return response.data.data as PaginatedResponse<FoodPledge>;
    },
    enabled: !!ngoId,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => foodPledgeApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngo-pledges"] });
      queryClient.refetchQueries({ queryKey: ["ngo-pledges"] });
    },
  });

  const fulfilMutation = useMutation({
    mutationFn: (id: string) => foodPledgeApi.fulfil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngo-pledges"] });
      queryClient.refetchQueries({ queryKey: ["ngo-pledges"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      foodPledgeApi.cancel(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngo-pledges"] });
      queryClient.refetchQueries({ queryKey: ["ngo-pledges"] });
      setCancellingId(null);
      setCancelReason("");
    },
  });

  const pledges = data?.items ?? [];

  return (
    <NGOGuard>
      <div className="flex flex-col flex-1">
        <Header
          title="Food Pledges"
          subtitle="Manage incoming food donation pledges"
        />

        <div className="flex-1 p-8 overflow-y-auto">
          {/* Status filter */}
          <div className="flex gap-2 mb-6">
            {["PENDING", "CONFIRMED", "FULFILLED", "CANCELLED", "EXPIRED"].map(
              (s) => (
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
              ),
            )}
          </div>

          {/* Pledges list */}
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
          ) : pledges.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No {statusFilter.toLowerCase()} pledges
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pledges.map((pledge) => (
                <div
                  key={pledge.id}
                  className="bg-white rounded-xl border border-gray-100 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {pledge.donor.firstName} {pledge.donor.lastName}
                        </p>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            getStatusColor(pledge.status),
                          )}
                        >
                          {pledge.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">
                        {pledge.foodNeed.title} ·{" "}
                        <span className="font-medium">
                          {pledge.quantityPledged} {pledge.foodNeed.unit}
                        </span>
                      </p>

                      {pledge.dropOffDate && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Drop off: {formatDate(pledge.dropOffDate)}
                        </p>
                      )}

                      {pledge.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          "{pledge.notes}"
                        </p>
                      )}

                      {pledge.fulfilledAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Fulfilled on {formatDate(pledge.fulfilledAt)}
                        </p>
                      )}

                      {pledge.cancellationReason && (
                        <p className="text-xs text-red-500 mt-1">
                          Cancelled: {pledge.cancellationReason}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {cancellingId === pledge.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Reason (min 5 chars)"
                            className="text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none w-40"
                          />
                          <button
                            onClick={() => {
                              if (cancelReason.trim().length >= 5) {
                                cancelMutation.mutate({
                                  id: pledge.id,
                                  reason: cancelReason,
                                });
                              }
                            }}
                            disabled={
                              cancelReason.trim().length < 5 ||
                              cancelMutation.isPending
                            }
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setCancellingId(null)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          {pledge.status === "PENDING" && (
                            <button
                              onClick={() => confirmMutation.mutate(pledge.id)}
                              disabled={confirmMutation.isPending}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-green-lt text-brand-green rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Confirm
                            </button>
                          )}
                          {(pledge.status === "PENDING" ||
                            pledge.status === "CONFIRMED") && (
                            <>
                              <button
                                onClick={() => fulfilMutation.mutate(pledge.id)}
                                disabled={fulfilMutation.isPending}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Mark Fulfilled
                              </button>
                              <button
                                onClick={() => setCancellingId(pledge.id)}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            </>
                          )}
                        </>
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
