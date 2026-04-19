"use client";

import { Edit, Mail, MoreHorizontal, Plus, Search, ShieldCheck, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { TeamInviteModal } from "@/components/modals/TeamInviteModal";

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  department: string | null;
  status: string;
  last_active: string | null;
}

interface RoleAgg { name: string; permissions: number; members: number; }

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

async function patchMember(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/team/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json.data;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<RoleAgg[]>([]);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    let active = true;
    fetchTeam().then(({ members: m, roles: r }) => {
      if (active) { setMembers(m); setRoles(r); }
    });
    return () => { active = false; };
  }, []);

  const handleInvited = () => {
    setShowInvite(false);
    fetchTeam().then(({ members: m, roles: r }) => { setMembers(m); setRoles(r); });
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await patchMember(id, { status: newStatus });
    fetchTeam().then(({ members: m, roles: r }) => { setMembers(m); setRoles(r); });
  };

  const formatRole = (role: string) => {
    return role === "finance_admin" ? "Finance Admin" : role === "manager" ? "Manager" : "Team Member";
  };

  return (
    <div className="space-y-6">
      {showInvite && <TeamInviteModal onClose={() => setShowInvite(false)} onInvited={handleInvited} />}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Team Members</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Manage team access and permissions</p>
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

      {/* Roles Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((role) => (
          <div key={role.name} className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10">
                <ShieldCheck className="h-5 w-5 text-[var(--brand)]" />
              </div>
              <div>
                <div className="font-semibold text-[var(--ink)]">{role.name}</div>
                <div className="text-xs text-[var(--ink-soft)]">
                  {role.permissions} permissions • {role.members} members
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            placeholder="Search team members..."
            className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)]"
          />
        </div>
        <select className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]">
          <option>All Roles</option>
          <option>Finance Admin</option>
          <option>Manager</option>
          <option>Team Member</option>
        </select>
      </div>

      {/* Team Members Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/50">
                <th className="px-6 py-3 font-medium text-[var(--ink-soft)]">Member</th>
                <th className="px-6 py-3 font-medium text-[var(--ink-soft)]">Role</th>
                <th className="px-6 py-3 font-medium text-[var(--ink-soft)]">Department</th>
                <th className="px-6 py-3 font-medium text-[var(--ink-soft)]">Status</th>
                <th className="px-6 py-3 font-medium text-[var(--ink-soft)]">Last Active</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {members.map((member) => (
                <tr key={member.id} className="transition hover:bg-[var(--bg-elevated)]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                        {(member.full_name || member.email || "U").split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--ink)]">{member.full_name || "—"}</div>
                        <div className="text-xs text-[var(--ink-soft)]">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-[var(--ink)]">{formatRole(member.role)}</span>
                  </td>
                  <td className="px-6 py-4 text-[var(--ink-soft)]">{member.department || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      member.status === "active" ? "bg-[var(--brand-2)]/10 text-[var(--brand-2)]" : "bg-[var(--accent)]/10 text-[var(--accent)]"
                    }`}>
                      {member.status === "active" && <UserCheck className="h-3 w-3" />}
                      {member.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--ink-soft)]">{member.last_active || "Never"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(member.id, member.status)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--border)] hover:text-[var(--ink)]"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--border)] hover:text-[var(--ink)]">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
