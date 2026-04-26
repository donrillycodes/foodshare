"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/shared/Header";
import { ngoApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import type { NGODashboard, NGOMember } from "@/types";
import { Users, Plus, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { NGOGuard } from "@/components/ngo/NGOGuard";

const PERMISSIONS = [
  { key: "canPostNeeds", label: "Post Food Needs" },
  { key: "canPostUpdates", label: "Post Updates" },
  { key: "canManagePledges", label: "Manage Pledges" },
  { key: "canViewDonations", label: "View Donations" },
  { key: "canManageMembers", label: "Manage Members" },
];

type InviteForm = {
  email: string; role: string; canPostNeeds: boolean; canPostUpdates: boolean;
  canManagePledges: boolean; canViewDonations: boolean; canManageMembers: boolean;
};

const EMPTY_INVITE: InviteForm = {
  email: "", role: "STAFF", canPostNeeds: false, canPostUpdates: false,
  canManagePledges: false, canViewDonations: false, canManageMembers: false,
};

const MANAGER_DEFAULTS = { canPostNeeds: true, canPostUpdates: true, canManagePledges: true, canViewDonations: true, canManageMembers: false };
const STAFF_DEFAULTS = { canPostNeeds: false, canPostUpdates: false, canManagePledges: false, canViewDonations: false, canManageMembers: false };

const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent focus:bg-white transition-all";

export default function NGOTeamPage() {
  const queryClient = useQueryClient();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [invite, setInvite] = useState<InviteForm>(EMPTY_INVITE);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: dashboardData } = useQuery({
    queryKey: ["ngo-dashboard"],
    queryFn: async () => {
      const response = await ngoApi.getDashboard();
      return response.data.data as NGODashboard;
    },
  });

  const ngoId = dashboardData?.ngo?.id;

  const { data: membersData, isLoading } = useQuery({
    queryKey: ["ngo-members", ngoId],
    queryFn: async () => {
      const response = await ngoApi.getMembers(ngoId!);
      return response.data.data.members as NGOMember[];
    },
    enabled: !!ngoId,
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      ngoApi.inviteMember(ngoId!, {
        email: invite.email,
        role: invite.role,
        permissions: {
          canPostNeeds: invite.canPostNeeds,
          canPostUpdates: invite.canPostUpdates,
          canManagePledges: invite.canManagePledges,
          canViewDonations: invite.canViewDonations,
          canManageMembers: invite.canManageMembers,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngo-members"] });
      queryClient.refetchQueries({ queryKey: ["ngo-members"] });
      setShowInviteForm(false);
      setInvite(EMPTY_INVITE);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => ngoApi.removeMember(ngoId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngo-members"] });
      queryClient.refetchQueries({ queryKey: ["ngo-members"] });
      setRemovingId(null);
    },
  });

  const handleRoleChange = (role: string) => {
    const defaults = role === "MANAGER" ? MANAGER_DEFAULTS : STAFF_DEFAULTS;
    setInvite((f) => ({ ...f, role, ...defaults }));
  };

  const members = membersData ?? [];

  return (
    <NGOGuard>
      <div className="flex flex-col flex-1">
        <Header title="Team" subtitle="Manage your NGO team members and their permissions" />

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
              Invite Member
            </button>
          </div>

          {/* Invite form */}
          {showInviteForm && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Invite Team Member</h3>
                <button onClick={() => setShowInviteForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Email address</label>
                    <input type="email" value={invite.email} onChange={(e) => setInvite((f) => ({ ...f, email: e.target.value }))} placeholder="staff@yourorg.ca" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Role</label>
                    <select value={invite.role} onChange={(e) => handleRoleChange(e.target.value)} className={inputClass}>
                      <option value="MANAGER">Manager</option>
                      <option value="STAFF">Staff</option>
                    </select>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Permissions <span className="text-gray-400 font-normal">— customise what this member can do</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSIONS.map((perm) => (
                      <label key={perm.key} className="flex items-center gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={invite[perm.key as keyof InviteForm] as boolean} onChange={(e) => setInvite((f) => ({ ...f, [perm.key]: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green" />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => inviteMutation.mutate()} disabled={!invite.email || inviteMutation.isPending} className="px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:bg-brand-green-dk disabled:opacity-50 transition-colors">
                    {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                  </button>
                  <button onClick={() => setShowInviteForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
                {inviteMutation.isError && (
                  <p className="text-xs text-red-600">Failed to send invitation. Make sure the user has a FoodShare account first.</p>
                )}
              </div>
            </div>
          )}

          {/* Members list */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <Users className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No team members yet</p>
              <p className="text-xs text-gray-400 mt-1">Invite staff members to help manage your NGO</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                  >
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
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            member.role === "OWNER" ? "bg-brand-green-lt text-brand-green" :
                            member.role === "MANAGER" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"
                          )}>
                            {member.role}
                          </span>
                          {member.joinedAt && (
                            <span className="text-xs text-gray-400">Joined {formatDate(member.joinedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {member.role !== "OWNER" && (
                        removingId === member.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <p className="text-xs text-gray-600">Remove member?</p>
                            <button onClick={() => removeMutation.mutate(member.id)} disabled={removeMutation.isPending} className="text-xs px-2.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">Confirm</button>
                            <button onClick={() => setRemovingId(null)} className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); setRemovingId(member.id); }} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      )}
                      {expandedId === member.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  {expandedId === member.id && (
                    <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Permissions</p>
                      <div className="grid grid-cols-2 gap-2">
                        {PERMISSIONS.map((perm) => (
                          <div key={perm.key} className="flex items-center gap-2">
                            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0", member[perm.key as keyof NGOMember] ? "bg-brand-green" : "bg-gray-200")}>
                              {member[perm.key as keyof NGOMember] && <span className="text-white" style={{ fontSize: "9px" }}>✓</span>}
                            </div>
                            <span className={cn("text-xs", member[perm.key as keyof NGOMember] ? "text-gray-700" : "text-gray-400")}>{perm.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NGOGuard>
  );
}
