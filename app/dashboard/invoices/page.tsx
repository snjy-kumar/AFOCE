"use client";

import { useEffect, useMemo, useState } from "react";
import { FileDigit, Plus, Search } from "lucide-react";

import { getInvoices, type InvoiceRecord, type InvoiceStatus } from "@/lib/services/mock-finance-service";

export default function InvoicesPage() {
  const [items, setItems] = useState<InvoiceRecord[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "All">("All");

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

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="dashboard-panel rounded-[1.6rem] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Smart Invoicing</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
              Gapless sequencing and VAT-ready drafting.
            </h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--panel-strong)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            <Plus className="h-4 w-4" />
            Create invoice
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <label className="relative grow">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search invoice, client, PAN"
              className="w-full rounded-xl border border-[var(--border)] bg-white pl-9 pr-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as InvoiceStatus | "All")}
            className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
          >
            <option>All</option>
            <option>Paid</option>
            <option>Overdue</option>
            <option>Pending</option>
            <option>Draft</option>
          </select>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-[var(--border)] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => (
                <tr key={invoice.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileDigit className="h-4 w-4 text-[var(--brand)]" />
                      <span className="text-xs font-semibold text-[var(--ink)]">{invoice.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-[var(--ink)]">{invoice.client}</div>
                    <div className="text-xs text-[var(--ink-soft)]">PAN {invoice.pan}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--ink-soft)]">{invoice.bsDate}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ink)]">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-semibold text-[var(--ink)]">{invoice.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="dashboard-panel-dark rounded-[1.6rem] p-6 text-white">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/55">Invoice health</div>
          <div className="mt-4 space-y-3">
            <MiniStat label="Total invoices" value={String(items.length)} />
            <MiniStat label="Overdue" value={String(items.filter((item) => item.status === "Overdue").length)} />
            <MiniStat label="Pending" value={String(items.filter((item) => item.status === "Pending").length)} />
            <MiniStat label="Drafts" value={String(items.filter((item) => item.status === "Draft").length)} />
          </div>
        </div>
        <div className="dashboard-panel rounded-[1.6rem] p-6">
          <div className="text-sm font-semibold text-[var(--ink)]">Backend-ready structure</div>
          <ul className="mt-3 space-y-2 text-xs text-[var(--ink-soft)]">
            <li>Data loaded from async service (`getInvoices()`)</li>
            <li>UI state isolated for filters/search</li>
            <li>Ready to swap service with API route/client SDK</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/10 px-4 py-3">
      <div className="text-xs text-white/62">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{value}</div>
    </div>
  );
}
