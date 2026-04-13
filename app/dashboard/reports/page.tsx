"use client";

import { Download, FileText, PieChart, Printer, TrendingUp, Wallet } from "lucide-react";

import { auditTrail, reportCards, vatSummary } from "@/lib/mock-data";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Reports & VAT</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Financial summaries and tax reporting</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
          >
            <Download className="h-4 w-4" />
            Export All
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {reportCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-[var(--border)] bg-white p-6 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--ink-soft)]">{card.title}</span>
              <FileText className="h-5 w-5 text-[var(--brand)]" />
            </div>
            <div className="mt-4 text-2xl font-semibold text-[var(--ink)]">{card.value}</div>
            <div className="mt-2 text-sm text-[var(--ink-soft)]">{card.detail}</div>
            <button
              type="button"
              className="mt-4 text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-dark)]"
            >
              View Report →
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* VAT Summary */}
        <div className="rounded-2xl border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border)] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[var(--ink)]">VAT Summary</h2>
                <p className="text-sm text-[var(--ink-soft)]">{vatSummary.month}</p>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10">
                  <TrendingUp className="h-5 w-5 text-[var(--brand)]" />
                </div>
                <div>
                  <div className="text-sm text-[var(--ink-soft)]">Output Tax</div>
                  <div className="text-xs text-[var(--ink-soft)]">Sales VAT collected</div>
                </div>
              </div>
              <span className="text-lg font-semibold text-[var(--ink)]">{vatSummary.outputTax}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-2)]/10">
                  <Wallet className="h-5 w-5 text-[var(--brand-2)]" />
                </div>
                <div>
                  <div className="text-sm text-[var(--ink-soft)]">Input Tax</div>
                  <div className="text-xs text-[var(--ink-soft)]">Purchase VAT paid</div>
                </div>
              </div>
              <span className="text-lg font-semibold text-[var(--ink)]">{vatSummary.inputTax}</span>
            </div>
            <div className="flex items-center justify-between bg-[var(--bg-elevated)] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10">
                  <PieChart className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div>
                  <div className="font-medium text-[var(--ink)]">Net Payable</div>
                  <div className="text-xs text-[var(--ink-soft)]">Due to IRD</div>
                </div>
              </div>
              <span className="text-xl font-semibold text-[var(--ink)]">{vatSummary.netPayable}</span>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="rounded-2xl border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border)] px-6 py-4">
            <h2 className="font-semibold text-[var(--ink)]">Audit Trail</h2>
            <p className="text-sm text-[var(--ink-soft)]">Recent activity log</p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {auditTrail.map((entry, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-xs font-bold text-[var(--brand)]">
                    {entry.actor.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-[var(--ink-soft)]">{entry.actor}</div>
                    <div className="mt-1 text-sm font-medium text-[var(--ink)]">{entry.action}</div>
                    <div className="mt-1 text-xs text-[var(--ink-soft)]">{entry.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--border)] px-6 py-3">
            <button className="text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-dark)]">
              View full timeline →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
