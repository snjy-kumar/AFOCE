"use client";

import { useEffect, useState } from "react";
import { Check, Download, Eye, HelpCircle, Link2, Plus, Search } from "lucide-react";

import {
  getBankLines,
  markBankLine,
  type BankLineRecord,
} from "@/lib/services/mock-finance-service";

export default function ReconciliationPage() {
  const [lines, setLines] = useState<BankLineRecord[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getBankLines().then((records) => {
      if (active) {
        setLines(records);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const updateState = async (id: string, state: BankLineRecord["state"]) => {
    setBusy(id);
    const next = await markBankLine(id, state);
    setLines(next);
    setBusy(null);
  };

  const stats = [
    {
      label: "Matched",
      value: lines.filter((l) => l.state === "Matched").length,
      amount: "Rs. 113,000",
      color: "text-[var(--brand-2)]",
      bg: "bg-[var(--brand-2)]/10",
    },
    {
      label: "Needs Review",
      value: lines.filter((l) => l.state === "Needs review").length,
      amount: "Rs. 20,350",
      color: "text-[var(--accent)]",
      bg: "bg-[var(--accent)]/10",
    },
    {
      label: "Total Lines",
      value: lines.length,
      amount: "Rs. 133,350",
      color: "text-[var(--brand)]",
      bg: "bg-[var(--brand)]/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
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

      {/* Bank Lines */}
      <div className="rounded-2xl border border-[var(--border)] bg-white">
        {/* Toolbar */}
        <div className="border-b border-[var(--border)] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 gap-3">
              <div className="relative flex-1 lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  placeholder="Search transactions..."
                  className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)]"
                />
              </div>
              <select className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]">
                <option>All Status</option>
                <option>Matched</option>
                <option>Needs Review</option>
              </select>
            </div>
            <div className="flex gap-2">
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
                Import Statement
              </button>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="divide-y divide-[var(--border)]">
          {lines.map((line) => {
            const rowBusy = busy === line.id;
            const isMatched = line.state === "Matched";
            const needsReview = line.state === "Needs review";

            return (
              <div key={line.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[var(--ink-soft)]">{line.id}</span>
                      <span className="text-xs text-[var(--ink-soft)]">•</span>
                      <span className="text-xs text-[var(--ink-soft)]">{line.date} BS</span>
                    </div>
                    <div className="mt-1 font-semibold text-[var(--ink)]">{line.description}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-[var(--brand)]" />
                      <span className="text-sm text-[var(--ink-soft)]">
                        Suggested: <span className="font-medium text-[var(--ink)]">{line.match}</span>
                      </span>
                      <span className="text-xs text-[var(--ink-soft)]">•</span>
                      <span className="text-xs font-medium text-[var(--brand)]">{line.confidence} confidence</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-[var(--ink)]">{line.amount}</div>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isMatched
                          ? "bg-[var(--brand-2)]/10 text-[var(--brand-2)]"
                          : needsReview
                            ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "bg-[var(--ink-soft)]/10 text-[var(--ink-soft)]"
                      }`}
                    >
                      {line.state}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <div className="flex gap-2">
                    <button
                      disabled={rowBusy}
                      onClick={() => updateState(line.id, "Matched")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-2)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-2)]/90 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Match
                    </button>
                    <button
                      disabled={rowBusy}
                      onClick={() => updateState(line.id, "Needs review")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-elevated)] disabled:opacity-50"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Review
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
