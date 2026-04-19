"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Download,
  Eye,
  FileWarning,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from "lucide-react";

import { expensePolicies } from "@/lib/mock-data";
import type { ExpenseRecord, ExpenseStatus } from "@/lib/types";
import { ExpenseModal } from "@/components/modals/ExpenseModal";

async function fetchExpenses() {
  const res = await fetch("/api/expenses");
  const json = await res.json();
  if (json.error) return [];
  return json.data?.data || [];
}

async function patchExpense(id: string, status: string) {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  return json.data;
}

export default function ExpensesPage() {
  const [items, setItems] = useState<ExpenseRecord[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let active = true;
    fetchExpenses().then((records) => { if (active) setItems(records); });
    return () => { active = false; };
  }, []);

  const setStatus = async (id: string, status: ExpenseStatus) => {
    setBusy(id);
    await patchExpense(id, status);
    const updated = await fetchExpenses();
    setItems(updated);
    setBusy(null);
  };

  const handleCreated = () => {
    setShowCreate(false);
    fetchExpenses().then(setItems);
  };

  const stats = [
    { label: "Pending", value: items.filter((i) => i.status === "pending_approval").length, amount: "Rs. 0", color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
    { label: "Blocked", value: items.filter((i) => i.status === "blocked").length, amount: "Rs. 0", color: "text-[var(--danger)]", bg: "bg-[var(--danger)]/10" },
    { label: "Approved", value: items.filter((i) => i.status === "approved").length, amount: "Rs. 0", color: "text-[var(--brand-2)]", bg: "bg-[var(--brand-2)]/10" },
    { label: "This Month", value: items.length, amount: "Rs. 0", color: "text-[var(--brand)]", bg: "bg-[var(--brand)]/10" },
  ];

  return (
    <div className="space-y-6">
      {showCreate && <ExpenseModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--ink-soft)]">{stat.label}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${stat.bg} ${stat.color}`}>{stat.value}</span>
            </div>
            <div className="mt-3 text-2xl font-semibold text-[var(--ink)]">{stat.amount}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Policies */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold text-[var(--ink)]">Active Policies</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Rules applied to expenses</p>
          <div className="mt-4 space-y-3">
            {expensePolicies.map((policy) => (
              <div key={policy.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)]/10">
                    <AlertTriangle className="h-4 w-4 text-[var(--brand)]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--ink)]">{policy.title}</div>
                    <div className="mt-1 text-xs text-[var(--ink-soft)]">{policy.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="mt-4 w-full rounded-xl border border-[var(--border)] bg-white py-2.5 text-sm font-medium text-[var(--brand)] transition hover:bg-[var(--bg-elevated)]">
            Manage Policies
          </button>
        </div>

        {/* Approval Queue */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border)] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 gap-3">
                  <div className="relative flex-1 lg:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
                    <input placeholder="Search expenses..." className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)]" />
                  </div>
                  <select className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Blocked</option>
                    <option>Approved</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]">
                    <Download className="h-4 w-4" />Export
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
                  >
                    <Plus className="h-4 w-4" />Log Expense
                  </button>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-[var(--border)]">
              {items.map((expense) => {
                const blocked = expense.status === "blocked";
                const approving = busy === expense.id;

                return (
                  <div key={expense.id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[var(--ink-soft)]">{expense.id}</span>
                          <span className="text-xs text-[var(--ink-soft)]">•</span>
                          <span className="text-xs text-[var(--ink-soft)]">{expense.bs_date} BS</span>
                        </div>
                        <div className="mt-1 font-semibold text-[var(--ink)]">{expense.employee} • {expense.category}</div>
                        <div className="mt-2 flex items-center gap-2">
                          {blocked ? <FileWarning className="h-4 w-4 text-[var(--danger)]" /> : <Clock className="h-4 w-4 text-[var(--accent)]" />}
                          <span className={`text-sm font-medium ${blocked ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}>{expense.status}</span>
                        </div>
                        <div className="mt-1 text-sm text-[var(--ink-soft)]">{(expense as unknown as Record<string, unknown>).policy_title as string || expense.policy_id || ""}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-[var(--ink)]">NPR {Number(expense.amount).toLocaleString()}</div>
                        <div className={`mt-1 text-xs font-medium ${expense.receipt_url ? "text-[var(--brand-2)]" : "text-[var(--danger)]"}`}>
                          Receipt: {expense.receipt_url ? "Attached" : "Missing"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                      <div className="flex items-center gap-2">
                        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button disabled={approving} onClick={() => setStatus(expense.id, "approved")} className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-2)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-2)]/90 disabled:opacity-50">
                          <Check className="h-4 w-4" />Approve
                        </button>
                        <button disabled={approving} onClick={() => setStatus(expense.id, blocked ? "rejected" : "blocked")} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-elevated)] disabled:opacity-50">
                          <X className="h-4 w-4" />{blocked ? "Reject" : "Block"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
