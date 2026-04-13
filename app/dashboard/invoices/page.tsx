"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Eye,
  FileDigit,
  Filter,
  MoreHorizontal,
  Plus,
  Printer,
  Search,
  Send,
  Trash2,
} from "lucide-react";

import { getInvoices, type InvoiceRecord, type InvoiceStatus } from "@/lib/services/mock-finance-service";

export default function InvoicesPage() {
  const [items, setItems] = useState<InvoiceRecord[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "All">("All");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    getInvoices().then((records) => {
      if (active) {
        setItems(records);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const lower = query.trim().toLowerCase();
      const matchesQuery =
        lower.length === 0 ||
        item.id.toLowerCase().includes(lower) ||
        item.client.toLowerCase().includes(lower) ||
        item.pan.includes(lower);
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedItems(next);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filtered.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filtered.map((i) => i.id)));
    }
  };

  const stats = [
    {
      label: "Total Invoices",
      value: items.length,
      amount: "Rs. 449,860",
      color: "text-[var(--brand)]",
      bg: "bg-[var(--brand)]/10",
    },
    {
      label: "Paid",
      value: items.filter((i) => i.status === "Paid").length,
      amount: "Rs. 113,000",
      color: "text-[var(--brand-2)]",
      bg: "bg-[var(--brand-2)]/10",
    },
    {
      label: "Overdue",
      value: items.filter((i) => i.status === "Overdue").length,
      amount: "Rs. 45,200",
      color: "text-[var(--danger)]",
      bg: "bg-[var(--danger)]/10",
    },
    {
      label: "Pending",
      value: items.filter((i) => i.status === "Pending").length,
      amount: "Rs. 78,500",
      color: "text-[var(--accent)]",
      bg: "bg-[var(--accent)]/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[var(--border)] bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--ink-soft)]">{stat.label}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${stat.bg} ${stat.color}`}>
                {stat.value}
              </span>
            </div>
            <div className="mt-3 text-2xl font-semibold text-[var(--ink)]">{stat.amount}</div>
          </div>
        ))}
      </div>

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
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search invoices..."
                  className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as InvoiceStatus | "All")}
                className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Pending">Pending</option>
                <option value="Draft">Draft</option>
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
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
              >
                <Plus className="h-4 w-4" />
                Create Invoice
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
              {filtered.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="transition hover:bg-[var(--bg-elevated)]"
                >
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
                    <div className="font-medium text-[var(--ink)]">{invoice.client}</div>
                    <div className="text-xs text-[var(--ink-soft)]">PAN: {invoice.pan}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-[var(--ink)]">{invoice.bsDate}</div>
                    <div className="text-xs text-[var(--ink-soft)]">BS</div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        invoice.status === "Paid"
                          ? "bg-[var(--brand-2)]/10 text-[var(--brand-2)]"
                          : invoice.status === "Overdue"
                            ? "bg-[var(--danger)]/10 text-[var(--danger)]"
                            : invoice.status === "Pending"
                              ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                              : "bg-[var(--ink-soft)]/10 text-[var(--ink-soft)]"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="font-semibold text-[var(--ink)]">{invoice.amount}</div>
                    <div className="text-xs text-[var(--ink-soft)]">VAT: {invoice.vat}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--border)] hover:text-[var(--ink)]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--border)] hover:text-[var(--ink)]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
          <div className="text-sm text-[var(--ink-soft)]">
            Showing {filtered.length} of {items.length} invoices
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)]"
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white"
            >
              1
            </button>
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)]"
            >
              2
            </button>
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
