"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/shared/Header";
import { userApi } from "@/lib/api";
import { formatDate, getStatusColor, cn } from "@/lib/utils";
import type { User, PaginatedResponse } from "@/types";
import { Search, UserX, UserCheck, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminGuard } from "@/components/admin/AdminGuard";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [suspendNotes, setSuspendNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, roleFilter],
    queryFn: async () => {
      const response = await userApi.getAll({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      return response.data.data as PaginatedResponse<User>;
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      userApi.suspend(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSuspendingId(null);
      setSuspendNotes("");
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => userApi.reactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const users = data?.items ?? [];

  return (
    <AdminGuard permission="canManageUsers">
      <div className="flex flex-col flex-1">
        <Header title="User Management" subtitle="View and manage platform users" />

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Filters */}
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent focus:bg-white transition-all"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all"
            >
              <option value="">All roles</option>
              <option value="DONOR">Donors</option>
              <option value="NGO">NGO</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <Users className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">User</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">Role</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">Joined</th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-green-lt flex items-center justify-center flex-shrink-0">
                            <span className="text-brand-green text-xs font-semibold">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{user.role}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                          {user.isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {suspendingId === user.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={suspendNotes}
                                onChange={(e) => setSuspendNotes(e.target.value)}
                                placeholder="Reason (optional)"
                                className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-green w-36"
                              />
                              <button
                                onClick={() => suspendMutation.mutate({ id: user.id, notes: suspendNotes })}
                                disabled={suspendMutation.isPending}
                                className="text-xs px-2.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setSuspendingId(null)}
                                className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : user.isActive && user.id !== currentUser?.id ? (
                            <button
                              onClick={() => setSuspendingId(user.id)}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => reactivateMutation.mutate(user.id)}
                              disabled={reactivateMutation.isPending}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
