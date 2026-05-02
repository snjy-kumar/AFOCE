"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Download,
  Eye,
  FileWarning,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { expensePolicies } from "@/lib/mock-data";
import type { ExpenseRecord, ExpenseStatus } from "@/lib/types";
import { ExpenseModal } from "@/components/modals/ExpenseModal";

interface ConfirmDialogState {
  isOpen: boolean;
  expenseId: string | null;
  expenseAmount: number | null;
  action: "delete" | null;
}

async function fetchExpenses() {
  const res = await fetch("/api/expenses");
  const json = await res.json();
  if (json.error) return [];
  return json.data?.data || [];
}

async function updateExpenseStatus(id: string, status: ExpenseStatus) {
  const res = await fetch(`/api/expenses/${id}/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: status }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.data;
}

async function deleteExpense(id: string) {
  const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.data;
}

const statusColors = {
  pending_approval: { bg: "bg-[var(--accent)]/10", text: "text-[var(--accent)]", icon: Clock },
  manager_review: { bg: "bg-blue-100", text: "text-blue-600", icon: Clock },
  blocked: { bg: "bg-[var(--danger)]/10", text: "text-[var(--danger)]", icon: FileWarning },
  approved: { bg: "bg-[var(--brand-2)]/10", text: "text-[var(--brand-2)]", icon: Check },
  rejected: { bg: "bg-red-100", text: "text-red-600", icon: X },
};

export default function ExpensesPage() {
  const [items, setItems] = useState<ExpenseRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "All">("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    expenseId: null,
    expenseAmount: null,
    action: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await fetchExpenses();
      setItems(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const typeMatch = statusFilter === "All" || item.status === statusFilter;
      const searchLower = searchQuery.toLowerCase();
      const searchMatch =
        item.employee.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower);
      return typeMatch && searchMatch;
    });
  }, [items, statusFilter, searchQuery]);

  const handleDeleteClick = (expense: ExpenseRecord) => {
    setConfirmDialog({
      isOpen: true,
      expenseId: expense.id,
      expenseAmount: expense.amount,
      action: "delete",
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.expenseId || confirmDialog.action !== "delete") return;

    setActionLoading(true);
    try {
      await deleteExpense(confirmDialog.expenseId);
      await loadExpenses();
      setConfirmDialog({ isOpen: false, expenseId: null, expenseAmount: null, action: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete expense");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (expenseId: string, newStatus: ExpenseStatus) => {
    try {
      setActionLoading(true);
      await updateExpenseStatus(expenseId, newStatus);
      await loadExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ["ID", "Employee", "Category", "Amount", "Date", "Status"],
      ...filtered.map((e) => [e.id, e.employee, e.category, e.amount, e.bs_date, e.status]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Pending", value: items.filter((i) => i.status === "pending_approval").length, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
    { label: "Blocked", value: items.filter((i) => i.status === "blocked").length, color: "text-[var(--danger)]", bg: "bg-[var(--danger)]/10" },
    { label: "Approved", value: items.filter((i) => i.status === "approved").length, color: "text-[var(--brand-2)]", bg: "bg-[var(--brand-2)]/10" },
    { label: "Total", value: items.length, color: "text-[var(--brand)]", bg: "bg-[var(--brand)]/10" },
  ];

  return (
    <div className="space-y-6">
      {showCreateModal && (
        <ExpenseModal
          onClose={() => {
            setShowCreateModal(false);
            setSelectedExpense(null);
          }}
          onCreated={() => {
            setShowCreateModal(false);
            setSelectedExpense(null);
            loadExpenses();
          }}
          initialData={selectedExpense || undefined}
        />
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Delete Expense</h3>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Are you sure you want to delete this expense for NPR {confirmDialog.expenseAmount?.toLocaleString()}? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog({ isOpen: false, expenseId: null, expenseAmount: null, action: null })}
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
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Expenses</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Review and approve employee expenses</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedExpense(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
        >
          <Plus className="h-4 w-4" />
          Log Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--ink-soft)]">{stat.label}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${stat.bg} ${stat.color}`}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

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
                    <input
                      placeholder="Search expenses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)]"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ExpenseStatus | "All")}
                    className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                  >
                    <option value="All">All Status</option>
                    <option value="pending_approval">Pending</option>
                    <option value="manager_review">Manager Review</option>
                    <option value="blocked">Blocked</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-[var(--border)]">
              {loading ? (
                <div className="px-4 py-12 text-center text-[var(--ink-soft)]">
                  Loading expenses...
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-12 text-center text-[var(--ink-soft)]">
                  No expenses found
                </div>
              ) : (
                filtered.map((expense) => {
                  const StatusIcon = statusColors[expense.status as keyof typeof statusColors]?.icon || Clock;
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
                            <StatusIcon className="h-4 w-4" style={{ color: statusColors[expense.status as keyof typeof statusColors]?.text.split("-")[2] }} />
                            <span
                              className={`text-sm font-medium ${statusColors[expense.status as keyof typeof statusColors]?.text || "text-[var(--ink-soft)]"}`}
                            >
                              {expense.status.replace(/_/g, " ")}
                            </span>
                          </div>
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
                          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]" title="View details">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(expense)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-red-100 hover:text-red-600"
                            title="Delete expense"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          {(expense.status === "pending_approval" || expense.status === "manager_review") && (
                            <>
                              <button
                                disabled={actionLoading}
                                onClick={() => handleStatusChange(expense.id, "approved")}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-2)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-2)]/90 disabled:opacity-50"
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                disabled={actionLoading}
                                onClick={() => handleStatusChange(expense.id, "blocked")}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-elevated)] disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                                Block
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
