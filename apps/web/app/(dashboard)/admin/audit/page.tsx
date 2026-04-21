"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/shared/Header";
import { adminApi } from "@/lib/api";
import { formatDateTime, cn } from "@/lib/utils";
import type { AuditLog, PaginatedResponse } from "@/types";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  NGO_APPROVED: "bg-green-100 text-green-700",
  NGO_REJECTED: "bg-red-100 text-red-700",
  NGO_SUSPENDED: "bg-amber-100 text-amber-700",
  USER_SUSPENDED: "bg-red-100 text-red-700",
  USER_REACTIVATED: "bg-green-100 text-green-700",
  DONATION_COMPLETED: "bg-green-100 text-green-700",
  DONATION_REFUNDED: "bg-amber-100 text-amber-700",
  PLEDGE_FULFILLED: "bg-green-100 text-green-700",
  PLEDGE_CANCELLED: "bg-red-100 text-red-700",
  UPDATE_FLAGGED: "bg-red-100 text-red-700",
  ADMIN_LOGIN: "bg-blue-100 text-blue-700",
};

export default function AuditLogPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", actionFilter, page],
    queryFn: async () => {
      const response = await adminApi.getAuditLogs({
        action: actionFilter || undefined,
        page,
        limit: 20,
      });
      return response.data.data as PaginatedResponse<AuditLog>;
    },
  });

  const logs = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Audit Log"
        subtitle="Tamper-evident record of all significant platform actions"
      />

      <div className="flex-1 p-8 overflow-y-auto">
        {/* Filter */}
        <div className="flex gap-3 mb-6">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
          >
            <option value="">All actions</option>
            <option value="NGO_APPROVED">NGO Approved</option>
            <option value="NGO_REJECTED">NGO Rejected</option>
            <option value="NGO_SUSPENDED">NGO Suspended</option>
            <option value="USER_SUSPENDED">User Suspended</option>
            <option value="USER_REACTIVATED">User Reactivated</option>
            <option value="DONATION_COMPLETED">Donation Completed</option>
            <option value="DONATION_REFUNDED">Donation Refunded</option>
            <option value="PLEDGE_FULFILLED">Pledge Fulfilled</option>
            <option value="PLEDGE_CANCELLED">Pledge Cancelled</option>
            <option value="UPDATE_FLAGGED">Update Flagged</option>
            <option value="ADMIN_LOGIN">Admin Login</option>
          </select>
        </div>

        {/* Logs */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
              >
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No audit log entries found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Log row */}
                <div
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedId(expandedId === log.id ? null : log.id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap",
                        ACTION_COLORS[log.action] ??
                          "bg-gray-100 text-gray-700",
                      )}
                    >
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <div>
                      <p className="text-sm text-gray-700">
                        {log.actor ? (
                          <>
                            <span className="font-medium">
                              {log.actor.firstName} {log.actor.lastName}
                            </span>
                            <span className="text-gray-400 mx-1">·</span>
                            <span className="text-gray-500">
                              {log.actor.role}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500">System</span>
                        )}
                      </p>
                      {log.notes && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </span>
                    {expandedId === log.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === log.id && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Entity Type
                        </p>
                        <p className="text-sm text-gray-700">
                          {log.entityType}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Entity ID
                        </p>
                        <p className="text-xs text-gray-500 font-mono break-all">
                          {log.entityId}
                        </p>
                      </div>
                      {log.ipAddress && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            IP Address
                          </p>
                          <p className="text-sm text-gray-700 font-mono">
                            {log.ipAddress}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Actor Role
                        </p>
                        <p className="text-sm text-gray-700">{log.actorRole}</p>
                      </div>
                    </div>

                    {/* State changes */}
                    {(log.previousState || log.newState) && (
                      <div className="grid grid-cols-2 gap-4">
                        {log.previousState && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Previous State
                            </p>
                            <pre className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-auto">
                              {JSON.stringify(log.previousState, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.newState && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              New State
                            </p>
                            <pre className="text-xs bg-brand-green-lt border border-green-100 rounded-lg p-3 overflow-auto">
                              {JSON.stringify(log.newState, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  Showing {logs.length} of {meta.total} entries
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!meta.hasPreviousPage}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">
                    {page} / {meta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!meta.hasNextPage}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
