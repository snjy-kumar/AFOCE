"use client";

import { Edit, MoreHorizontal, Plus, Search, ShieldCheck, ToggleLeft, Trash2 } from "lucide-react";

const policies = [
  {
    id: "POL-001",
    name: "Receipt Enforcement",
    description: "Any expense above Rs. 5,000 requires a verified attachment before posting.",
    category: "Expenses",
    status: "Active",
    triggers: 142,
  },
  {
    id: "POL-002",
    name: "Approval Routing",
    description: "Team leads approve to Rs. 20,000. Finance controller approves to Rs. 75,000.",
    category: "Approvals",
    status: "Active",
    triggers: 89,
  },
  {
    id: "POL-003",
    name: "CFO Escalation",
    description: "Travel, marketing, and advance payments above threshold route to CFO.",
    category: "Approvals",
    status: "Active",
    triggers: 23,
  },
  {
    id: "POL-004",
    name: "Invoice Numbering",
    description: "Gapless IRD-aligned invoice numbering with BS date context.",
    category: "Invoicing",
    status: "Active",
    triggers: 1248,
  },
  {
    id: "POL-005",
    name: "VAT Calculation",
    description: "Automatic 13% VAT calculation on all taxable invoices.",
    category: "Invoicing",
    status: "Active",
    triggers: 1248,
  },
];

export default function PoliciesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Policy Rules</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Configure business rules and automation</p>
        </div>
        <button
          type="button"
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
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">12</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Expense Rules</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">4</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Invoice Rules</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">5</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Triggers This Month</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">2,750</div>
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
          <div
            key={policy.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/10">
                <ShieldCheck className="h-5 w-5 text-[var(--brand)]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--ink)]">{policy.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      policy.status === "Active"
                        ? "bg-[var(--brand-2)]/10 text-[var(--brand-2)]"
                        : "bg-[var(--ink-soft)]/10 text-[var(--ink-soft)]"
                    }`}
                  >
                    {policy.status}
                  </span>
                </div>
                <div className="mt-1 text-sm text-[var(--ink-soft)]">{policy.description}</div>
                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--ink-soft)]">
                  <span className="rounded-full bg-[var(--bg-elevated)] px-2.5 py-0.5 font-medium">
                    {policy.category}
                  </span>
                  <span>{policy.triggers.toLocaleString()} triggers</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
              >
                <ToggleLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
