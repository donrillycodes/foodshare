"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/shared/Header";
import { ngoApi } from "@/lib/api";
import { formatDate, getStatusColor, formatStatus, cn } from "@/lib/utils";
import type { NGO, PaginatedResponse } from "@/types";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Building2, Mail, MapPin, RefreshCw } from "lucide-react";

const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent focus:bg-white transition-all resize-none";

export default function NGOApplicationsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-ngos", statusFilter],
    queryFn: async () => {
      const response = await ngoApi.adminGetAll({ status: statusFilter });
      return response.data.data as PaginatedResponse<NGO>;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => ngoApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ngos"] });
      queryClient.refetchQueries({ queryKey: ["admin-ngos"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => ngoApi.reject(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ngos"] });
      queryClient.refetchQueries({ queryKey: ["admin-ngos"] });
      setRejectingId(null);
      setRejectReason("");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => ngoApi.suspend(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ngos"] });
      queryClient.refetchQueries({ queryKey: ["admin-ngos"] });
      setSuspendingId(null);
      setSuspendReason("");
    },
  });

  const ngos = data?.items ?? [];

  return (
    <AdminGuard permission="canApproveNgos">
      <div className="flex flex-col flex-1">
        <Header title="NGO Applications" subtitle="Review and manage NGO applications" />

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Filter pills */}
          <div className="flex gap-1.5 mb-5">
            {["PENDING", "RESUBMITTED", "APPROVED", "REJECTED", "SUSPENDED"].map((status) => (
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
                {formatStatus(status)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-sm text-red-700">Failed to load NGO applications. Please refresh.</p>
            </div>
          ) : ngos.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <Building2 className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No {formatStatus(statusFilter).toLowerCase()} NGO applications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ngos.map((ngo) => (
                <div key={ngo.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(expandedId === ngo.id ? null : ngo.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-green-lt flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-green font-semibold text-sm">{ngo.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{ngo.name}</p>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getStatusColor(ngo.status))}>
                            {formatStatus(ngo.status)}
                          </span>
                          {ngo.resubmissionCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
                              Resubmission #{ngo.resubmissionCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />{ngo.email}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{ngo.city}, {ngo.province}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{formatDate(ngo.lastSubmittedAt ?? ngo.createdAt)}</span>
                      {expandedId === ngo.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {expandedId === ngo.id && (
                    <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Description</p>
                        <p className="text-sm text-gray-700">{ngo.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Category</p>
                          <p className="text-sm text-gray-700">{formatStatus(ngo.category)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Address</p>
                          <p className="text-sm text-gray-700">{ngo.address}, {ngo.city}</p>
                        </div>
                        {ngo.website && (
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Website</p>
                            <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-green hover:underline">
                              {ngo.website}
                            </a>
                          </div>
                        )}
                        {ngo.manager && (
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Manager</p>
                            <p className="text-sm text-gray-700">{ngo.manager.firstName} {ngo.manager.lastName} — {ngo.manager.email}</p>
                          </div>
                        )}
                      </div>

                      {ngo.rejectionReason && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                          <p className="text-xs font-medium text-red-700 mb-1">Previous rejection reason</p>
                          <p className="text-sm text-red-600">{ngo.rejectionReason}</p>
                        </div>
                      )}

                      {rejectingId === ngo.id && (
                        <div className="space-y-2">
                          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter rejection reason (minimum 10 characters)..." rows={3} className={inputClass} />
                          <div className="flex gap-2">
                            <button onClick={() => { if (rejectReason.trim().length >= 10) { rejectMutation.mutate({ id: ngo.id, reason: rejectReason }); } }} disabled={rejectReason.trim().length < 10 || rejectMutation.isPending} className="px-3.5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                              {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                            <button onClick={() => { setRejectingId(null); setRejectReason(""); }} className="px-3.5 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                          </div>
                        </div>
                      )}

                      {suspendingId === ngo.id && (
                        <div className="space-y-2">
                          <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Enter suspension reason (minimum 10 characters)..." rows={3} className={inputClass} />
                          <div className="flex gap-2">
                            <button onClick={() => { if (suspendReason.trim().length >= 10) { suspendMutation.mutate({ id: ngo.id, reason: suspendReason }); } }} disabled={suspendReason.trim().length < 10 || suspendMutation.isPending} className="px-3.5 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors">
                              {suspendMutation.isPending ? "Suspending..." : "Confirm Suspension"}
                            </button>
                            <button onClick={() => { setSuspendingId(null); setSuspendReason(""); }} className="px-3.5 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                          </div>
                        </div>
                      )}

                      {rejectingId !== ngo.id && suspendingId !== ngo.id && (
                        <div className="flex gap-2 pt-1">
                          {(ngo.status === "PENDING" || ngo.status === "RESUBMITTED") && (
                            <>
                              <button onClick={() => approveMutation.mutate(ngo.id)} disabled={approveMutation.isPending} className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:bg-brand-green-dk disabled:opacity-50 transition-colors">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {approveMutation.isPending ? "Approving..." : "Approve"}
                              </button>
                              <button onClick={() => setRejectingId(ngo.id)} className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                          {ngo.status === "APPROVED" && (
                            <button onClick={() => setSuspendingId(ngo.id)} className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 text-amber-600 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors">
                              <RefreshCw className="w-3.5 h-3.5" />
                              Suspend
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
