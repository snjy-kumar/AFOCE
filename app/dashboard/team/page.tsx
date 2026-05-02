"use client";

import { Edit, Mail, Plus, Search, Shield, Trash2, UserCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TeamInviteModal } from "@/components/modals/TeamInviteModal";
import type { TeamMember, UserRole, UserStatus } from "@/lib/types";

interface RoleAgg {
  name: string;
  permissions: number;
  members: number;
}

interface ConfirmDialogState {
  isOpen: boolean;
  memberId: string | null;
  memberEmail: string | null;
  action: "delete" | null;
}

async function fetchTeam() {
  const res = await fetch("/api/team");
  const json = await res.json();
  if (json.error) return { members: [], roles: [] };
  const members = json.data?.data || [];
  const roleMap: Record<string, number> = {};
  for (const m of members) {
    roleMap[m.role] = (roleMap[m.role] || 0) + 1;
  }
  const roles: RoleAgg[] = [
    { name: "Finance Admin", permissions: 12, members: roleMap["finance_admin"] || 0 },
    { name: "Manager", permissions: 8, members: roleMap["manager"] || 0 },
    { name: "Team Member", permissions: 4, members: roleMap["team_member"] || 0 },
  ];
  return { members, roles };
}

async function updateMemberRole(id: string, role: UserRole) {
  const res = await fetch(`/api/team/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.data;
}

async function deleteMember(id: string) {
  const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.data;
}

const roleColors = {
  finance_admin: { bg: "bg-purple-100", text: "text-purple-600", label: "Finance Admin" },
  manager: { bg: "bg-blue-100", text: "text-blue-600", label: "Manager" },
  team_member: { bg: "bg-green-100", text: "text-green-600", label: "Team Member" },
};

const statusColors = {
  active: { bg: "bg-[var(--brand-2)]/10", text: "text-[var(--brand-2)]", label: "Active" },
  inactive: { bg: "bg-[var(--ink-soft)]/10", text: "text-[var(--ink-soft)]", label: "Inactive" },
  pending: { bg: "bg-[var(--accent)]/10", text: "text-[var(--accent)]", label: "Pending" },
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<RoleAgg[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [showInvite, setShowInvite] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    memberId: null,
    memberEmail: null,
    action: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTeam();
      setMembers(data.members);
      setRoles(data.roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const filtered = useMemo(() => {
    return members.filter((member) => {
      const roleMatch = roleFilter === "All" || member.role === roleFilter;
      const searchLower = searchQuery.toLowerCase();
      const searchMatch =
        member.email.toLowerCase().includes(searchLower) ||
        (member.full_name?.toLowerCase().includes(searchLower) ?? false) ||
        (member.department?.toLowerCase().includes(searchLower) ?? false);
      return roleMatch && searchMatch;
    });
  }, [members, roleFilter, searchQuery]);

  const handleDeleteClick = (member: TeamMember) => {
    setConfirmDialog({
      isOpen: true,
      memberId: member.id,
      memberEmail: member.email,
      action: "delete",
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.memberId || confirmDialog.action !== "delete") return;

    setActionLoading(true);
    try {
      await deleteMember(confirmDialog.memberId);
      await loadTeam();
      setConfirmDialog({ isOpen: false, memberId: null, memberEmail: null, action: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete member");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    setActionLoading(true);
    try {
      await updateMemberRole(memberId, newRole);
      await loadTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = members.filter((m) => m.status === "active").length;
  const pendingCount = members.filter((m) => m.status === "pending").length;

  return (
    <div className="space-y-6">
      {showInvite && (
        <TeamInviteModal
          onClose={() => setShowInvite(false)}
          onInvited={() => {
            setShowInvite(false);
            loadTeam();
          }}
        />
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Remove Team Member</h3>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Are you sure you want to remove <span className="font-semibold">{confirmDialog.memberEmail}</span> from the team? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog({ isOpen: false, memberId: null, memberEmail: null, action: null })}
                className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Team Members</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Manage team members and permissions</p>
        </div>
        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
        >
          <Plus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Total Members</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{members.length}</div>
          <div className="mt-2 text-xs text-[var(--ink-soft)]">{activeCount} active</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Pending Invites</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--accent)]">{pendingCount}</div>
          <div className="mt-2 text-xs text-[var(--ink-soft)]">Awaiting acceptance</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Admin Users</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{roles[0]?.members || 0}</div>
          <div className="mt-2 text-xs text-[var(--ink-soft)]">Full access</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "All")}
          className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
        >
          <option value="All">All Roles</option>
          <option value="finance_admin">Finance Admin</option>
          <option value="manager">Manager</option>
          <option value="team_member">Team Member</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/50">
                <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Name</th>
                <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Email</th>
                <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Role</th>
                <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Department</th>
                <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Status</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--ink-soft)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--ink-soft)]">
                    Loading team members...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--ink-soft)]">
                    No team members found
                  </td>
                </tr>
              ) : (
                filtered.map((member) => {
                  const roleInfo = roleColors[member.role as keyof typeof roleColors];
                  const statusInfo = statusColors[member.status as keyof typeof statusColors];
                  return (
                    <tr key={member.id} className="hover:bg-[var(--bg-elevated)]">
                      <td className="px-4 py-4">
                        <div className="font-medium text-[var(--ink)]">{member.full_name || "—"}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-[var(--ink-soft)]">
                          <Mail className="h-4 w-4" />
                          {member.email}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                          disabled={actionLoading}
                          className={`rounded-lg px-3 py-1 text-sm font-semibold ${roleInfo?.bg} ${roleInfo?.text} border-0 outline-none cursor-pointer disabled:opacity-50`}
                        >
                          <option value="finance_admin">Finance Admin</option>
                          <option value="manager">Manager</option>
                          <option value="team_member">Team Member</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 text-[var(--ink-soft)]">{member.department || "—"}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo?.bg} ${statusInfo?.text}`}>
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(member)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-red-100 hover:text-red-600"
                            title="Remove member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Overview */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="font-semibold text-[var(--ink)]">Role Overview</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Team members by role and permissions</p>
        <div className="mt-6 space-y-4">
          {roles.map((role) => (
            <div key={role.name} className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-[var(--brand)]" />
                <div>
                  <div className="font-medium text-[var(--ink)]">{role.name}</div>
                  <div className="text-xs text-[var(--ink-soft)]">{role.permissions} permissions</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-[var(--ink)]">{role.members}</div>
                <div className="text-xs text-[var(--ink-soft)]">members</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
