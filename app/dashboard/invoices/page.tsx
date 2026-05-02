"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Download,
  Eye,
  FileDigit,
  MoreHorizontal,
  Plus,
  Printer,
  Search,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import type { InvoiceRecord, InvoiceStatus } from "@/lib/types";
import { InvoiceModal } from "@/components/modals/InvoiceModal";

interface StatusActionDialogState {
  isOpen: boolean;
  invoiceId: string | null;
  invoiceNumber: string | null;
  action: "delete" | null;
}

async function fetchInvoices() {
  const res = await fetch("/api/invoices");
  const json = await res.json();
  if (json.error) return [];
  return json.data?.data || [];
}

async function patchInvoiceStatus(id: string, status: InvoiceStatus) {
  const res = await fetch(`/api/invoices/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.data;
}

async function deleteInvoice(id: string) {
  const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.data;
}

const statusColors = {
  paid: { bg: "bg-[var(--brand-2)]/10", text: "text-[var(--brand-2)]" },
  overdue: { bg: "bg-[var(--danger)]/10", text: "text-[var(--danger)]" },
  pending: { bg: "bg-[var(--accent)]/10", text: "text-[var(--accent)]" },
  draft: { bg: "bg-[var(--ink-soft)]/10", text: "text-[var(--ink-soft)]" },
  rejected: { bg: "bg-red-100", text: "text-red-600" },
};

export default function InvoicesPage() {
  const [items, setItems] = useState<InvoiceRecord[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "All">("All");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<StatusActionDialogState>({
    isOpen: false,
    invoiceId: null,
    invoiceNumber: null,
    action: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await fetchInvoices();
      setItems(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const lower = query.trim().toLowerCase();
      const matchesQuery =
        lower.length === 0 ||
        item.id.toLowerCase().includes(lower) ||
        ((item as unknown as Record<string, unknown>).client_name as string | undefined)?.toLowerCase().includes(lower);
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filtered.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(filtered.map((i) => i.id)));
  };

  const handleDeleteClick = (invoice: InvoiceRecord) => {
    setConfirmDialog({
      isOpen: true,
      invoiceId: invoice.id,
      invoiceNumber: invoice.id,
      action: "delete",
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.invoiceId || confirmDialog.action !== "delete") return;

    setActionLoading(true);
    try {
      await deleteInvoice(confirmDialog.invoiceId);
      await loadInvoices();
      setConfirmDialog({ isOpen: false, invoiceId: null, invoiceNumber: null, action: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invoice");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    try {
      await patchInvoiceStatus(invoiceId, newStatus);
      await loadInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleExport = () => {
    const csv = [
      ["Invoice ID", "Client", "Date", "Status", "Amount", "VAT"],
      ...filtered.map((i) => [
        i.id,
        (i as unknown as Record<string, unknown>).client_name || i.client_id,
        i.bs_date,
        i.status,
        i.amount,
        i.vat,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Total Invoices", value: items.length, color: "text-[var(--brand)]", bg: "bg-[var(--brand)]/10" },
    {
      label: "Paid",
      value: items.filter((i) => i.status === "paid").length,
      color: "text-[var(--brand-2)]",
      bg: "bg-[var(--brand-2)]/10",
    },
    {
      label: "Overdue",
      value: items.filter((i) => i.status === "overdue").length,
      color: "text-[var(--danger)]",
      bg: "bg-[var(--danger)]/10",
    },
    {
      label: "Pending",
      value: items.filter((i) => i.status === "pending").length,
      color: "text-[var(--accent)]",
      bg: "bg-[var(--accent)]/10",
    },
  ];

  return (
    <div className="space-y-6">
      {showCreateModal && (
        <InvoiceModal
          onClose={() => {
            setShowCreateModal(false);
            setSelectedInvoice(null);
          }}
          onCreated={() => {
            setShowCreateModal(false);
            setSelectedInvoice(null);
            loadInvoices();
          }}
          initialData={selectedInvoice || undefined}
        />
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Delete Invoice</h3>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Are you sure you want to delete invoice <span className="font-semibold">{confirmDialog.invoiceNumber}</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog({ isOpen: false, invoiceId: null, invoiceNumber: null, action: null })}
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
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Invoices</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Manage and track your invoices</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedInvoice(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
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

      {/* Main Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white">
        {/* Toolbar */}
        <div className="border-b border-[var(--border)] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 gap-3">
              <div className="relative flex-1 lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search invoices..."
                  className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | "All")}
                className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              >
                <option value="All">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex gap-2">
              {selectedItems.size > 0 && (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </>
              )}
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/50">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-[var(--border)]"
                  />
                </th>
                <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Invoice</th>
                <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Client</th>
                <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Date</th>
                <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Status</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--ink-soft)]">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[var(--ink-soft)]">
                    Loading invoices...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[var(--ink-soft)]">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <tr key={invoice.id} className="transition hover:bg-[var(--bg-elevated)]">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(invoice.id)}
                        onChange={() => toggleSelect(invoice.id)}
                        className="h-4 w-4 rounded border-[var(--border)]"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)]/10">
                          <FileDigit className="h-4 w-4 text-[var(--brand)]" />
                        </div>
                        <span className="font-medium text-[var(--ink)]">{invoice.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-[var(--ink)]">
                        {((invoice as unknown as Record<string, unknown>).client_name as string) || invoice.client_id}
                      </div>
                      <div className="text-xs text-[var(--ink-soft)]">
                        PAN: {((invoice as unknown as Record<string, unknown>).client_pan as string) || ""}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[var(--ink)]">{invoice.bs_date}</div>
                      <div className="text-xs text-[var(--ink-soft)]">BS</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusColors[invoice.status as keyof typeof statusColors]?.bg || statusColors.draft.bg
                          } ${statusColors[invoice.status as keyof typeof statusColors]?.text || statusColors.draft.text}`}
                        >
                          {invoice.status}
                        </span>
                        {(invoice.status === "draft" || invoice.status === "pending") && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(invoice.id, "paid")}
                              className="flex h-6 w-6 items-center justify-center rounded text-[var(--brand-2)] transition hover:bg-[var(--brand-2)]/10"
                              title="Mark as paid"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(invoice.id, "rejected")}
                              className="flex h-6 w-6 items-center justify-center rounded text-red-600 transition hover:bg-red-100"
                              title="Reject invoice"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-semibold text-[var(--ink)]">NPR {Number(invoice.amount).toLocaleString()}</div>
                      <div className="text-xs text-[var(--ink-soft)]">VAT: NPR {Number(invoice.vat).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--border)] hover:text-[var(--ink)]"
                          title="View invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(invoice)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-red-100 hover:text-red-600"
                          title="Delete invoice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
          <div className="text-sm text-[var(--ink-soft)]">
            Showing {filtered.length} of {items.length} invoices
          </div>
        </div>
      </div>
    </div>
  );
}
