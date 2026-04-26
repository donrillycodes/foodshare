"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/shared/Header";
import { adminApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Users, Plus, Trash2, X } from "lucide-react";

interface AdminMember {
  id: string;
  department: string;
  status: string;
  canApproveNgos: boolean;
  canManageUsers: boolean;
  canManageContent: boolean;
  canViewAnalytics: boolean;
  canManageDonations: boolean;
  joinedAt?: string;
  lastActiveAt?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

const DEPARTMENTS = ["OPERATIONS", "VERIFICATION", "CONTENT", "FINANCE", "SUPPORT"];

const PERMISSIONS = [
  { key: "canApproveNgos", label: "Approve NGOs" },
  { key: "canManageUsers", label: "Manage Users" },
  { key: "canManageContent", label: "Manage Content" },
  { key: "canViewAnalytics", label: "View Analytics" },
  { key: "canManageDonations", label: "Manage Donations" },
];

const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent focus:bg-white transition-all";

export default function AdminTeamPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDepartment, setInviteDepartment] = useState("OPERATIONS");
  const [invitePermissions, setInvitePermissions] = useState<Record<string, boolean>>({});
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-team"],
    queryFn: async () => {
      const response = await adminApi.getTeam();
      return response.data.data.members as AdminMember[];
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      adminApi.inviteAdmin({
        email: inviteEmail,
        department: inviteDepartment,
        permissions: invitePermissions,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      setShowInviteForm(false);
      setInviteEmail("");
      setInviteDepartment("OPERATIONS");
      setInvitePermissions({});
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => adminApi.removeAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      setRemovingId(null);
    },
  });

  const members = data ?? [];

  return (
    <AdminGuard>
      <div className="flex flex-col flex-1">
        <Header title="Admin Team" subtitle="Manage your admin team members and their permissions" />

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              {members.length} team member{members.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setShowInviteForm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-green text-white text-xs font-medium rounded-lg hover:bg-brand-green-dk transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Invite Admin
            </button>
          </div>

          {/* Invite form */}
          {showInviteForm && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Invite New Admin</h3>
                <button onClick={() => setShowInviteForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Email address</label>
                    <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="admin@foodshare.ca" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Department</label>
                    <select value={inviteDepartment} onChange={(e) => setInviteDepartment(e.target.value)} className={inputClass}>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept.charAt(0) + dept.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSIONS.map((perm) => (
                      <label key={perm.key} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={invitePermissions[perm.key] ?? false}
                          onChange={(e) => setInvitePermissions({ ...invitePermissions, [perm.key]: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                        />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => inviteMutation.mutate()}
                    disabled={!inviteEmail || inviteMutation.isPending}
                    className="px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:bg-brand-green-dk disabled:opacity-50 transition-colors"
                  >
                    {inviteMutation.isPending ? "Inviting..." : "Send Invitation"}
                  </button>
                  <button onClick={() => setShowInviteForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Members list */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <Users className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No admin team members yet</p>
              <p className="text-xs text-gray-400 mt-1">Invite team members to help manage the platform</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-green-lt flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-green text-xs font-semibold">
                          {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.user.firstName} {member.user.lastName}</p>
                        <p className="text-xs text-gray-400">{member.user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                            {member.department.charAt(0) + member.department.slice(1).toLowerCase()}
                          </span>
                          {member.joinedAt && (
                            <span className="text-xs text-gray-400">Joined {formatDate(member.joinedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {member.user.id !== currentUser?.id && (
                      removingId === member.user.id ? (
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-600">Remove this admin?</p>
                          <button
                            onClick={() => removeMutation.mutate(member.user.id)}
                            disabled={removeMutation.isPending}
                            className="text-xs px-2.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setRemovingId(null)}
                            className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRemovingId(member.user.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>

                  {/* Permission badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {PERMISSIONS.map((perm) => (
                      <span
                        key={perm.key}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium",
                          member[perm.key as keyof AdminMember]
                            ? "bg-brand-green-lt text-brand-green"
                            : "bg-gray-50 text-gray-300 line-through",
                        )}
                      >
                        {perm.label}
                      </span>
                    ))}
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
