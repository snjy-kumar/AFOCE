"use client";

import { Edit, MoreHorizontal, Plus, Search, ShieldCheck, ToggleLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PolicyModal } from "@/components/modals/PolicyModal";

interface Policy {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  triggers_count?: number;
}

async function fetchPolicies() {
  const res = await fetch("/api/policies");
  const json = await res.json();
  if (json.error) return [];
  return json.data || [];
}

async function patchPolicy(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/policies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json.data;
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPolicies().then((data) => { if (active) setPolicies(data); });
    return () => { active = false; };
  }, []);

  const handleCreated = () => {
    setShowCreate(false);
    fetchPolicies().then(setPolicies);
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await patchPolicy(id, { status: newStatus });
    fetchPolicies().then(setPolicies);
  };

  const activePolicies = policies.filter((p) => p.status === "active").length;
  const expenseRules = policies.filter((p) => p.category === "expenses").length;
  const invoiceRules = policies.filter((p) => p.category === "invoicing").length;

  return (
    <div className="space-y-6">
      {showCreate && <PolicyModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Policy Rules</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Configure business rules and automation</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
        >
          <Plus className="h-4 w-4" />
          Create Policy
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Active Policies</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{activePolicies}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Expense Rules</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{expenseRules}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Invoice Rules</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{invoiceRules}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Total Policies</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{policies.length}</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            placeholder="Search policies..."
            className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)]"
          />
        </div>
        <select className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]">
          <option>All Categories</option>
          <option>Expenses</option>
          <option>Approvals</option>
          <option>Invoicing</option>
        </select>
      </div>

      {/* Policies List */}
      <div className="space-y-3">
        {policies.map((policy) => (
          <div key={policy.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/10">
                <ShieldCheck className="h-5 w-5 text-[var(--brand)]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--ink)]">{policy.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    policy.status === "active" ? "bg-[var(--brand-2)]/10 text-[var(--brand-2)]" : "bg-[var(--ink-soft)]/10 text-[var(--ink-soft)]"
                  }`}>{policy.status === "active" ? "Active" : "Inactive"}</span>
                </div>
                <div className="mt-1 text-sm text-[var(--ink-soft)]">{policy.description}</div>
                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--ink-soft)]">
                  <span className="rounded-full bg-[var(--bg-elevated)] px-2.5 py-0.5 font-medium">{policy.category}</span>
                  <span>{(policy.triggers_count || 0).toLocaleString()} triggers</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggle(policy.id, policy.status)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
              >
                <ToggleLeft className="h-5 w-5" />
              </button>
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]">
                <Edit className="h-4 w-4" />
              </button>
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
