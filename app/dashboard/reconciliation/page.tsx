"use client";

import { useEffect, useState } from "react";
import { Check, Download, Eye, HelpCircle, Link2, Plus, Search } from "lucide-react";

import type { BankLineState } from "@/lib/types";
import { BankImportModal } from "@/components/modals/BankImportModal";

interface BankLine {
  id: string;
  date: string;
  description: string | null;
  amount: number;
  confidence: number | null;
  state: BankLineState;
  match?: string;
}

async function fetchBankLines() {
  const res = await fetch("/api/bank-lines");
  const json = await res.json();
  if (json.error) return [];
  return json.data?.data || [];
}

async function patchBankLine(id: string, state: BankLineState) {
  const apiState = state === "matched" ? "matched" : state === "needs_review" ? "needs_review" : "unmatched";
  const res = await fetch(`/api/bank-lines/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: apiState }),
  });
  const json = await res.json();
  return json.data;
}

export default function ReconciliationPage() {
  const [lines, setLines] = useState<BankLine[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    let active = true;
    fetchBankLines().then((data) => { if (active) setLines(data); });
    return () => { active = false; };
  }, []);

  const updateState = async (id: string, state: BankLineState) => {
    setBusy(id);
    await patchBankLine(id, state);
    const updated = await fetchBankLines();
    setLines(updated);
    setBusy(null);
  };

  const handleImported = () => {
    setShowImport(false);
    fetchBankLines().then(setLines);
  };

  const matchedLines = lines.filter((l) => l.state === "matched");
  const needsReviewLines = lines.filter((l) => l.state === "needs_review");
  const totalAmount = lines.reduce((s, l) => s + l.amount, 0);
  const matchedAmount = matchedLines.reduce((s, l) => s + l.amount, 0);
  const needsReviewAmount = needsReviewLines.reduce((s, l) => s + l.amount, 0);

  const stats = [
    { label: "Matched", value: matchedLines.length, amount: `Rs. ${matchedAmount.toLocaleString()}`, color: "text-[var(--brand-2)]", bg: "bg-[var(--brand-2)]/10" },
    { label: "Needs Review", value: needsReviewLines.length, amount: `Rs. ${needsReviewAmount.toLocaleString()}`, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
    { label: "Total Lines", value: lines.length, amount: `Rs. ${totalAmount.toLocaleString()}`, color: "text-[var(--brand)]", bg: "bg-[var(--brand)]/10" },
  ];

  return (
    <div className="space-y-6">
      {showImport && <BankImportModal onClose={() => setShowImport(false)} onImported={handleImported} />}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
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
              <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]">
                <Download className="h-4 w-4" />Export
              </button>
              <button
                type="button"
                onClick={() => setShowImport(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
              >
                <Plus className="h-4 w-4" />Import Statement
              </button>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="divide-y divide-[var(--border)]">
          {lines.map((line) => {
            const rowBusy = busy === line.id;
            const isMatched = line.state === "matched";
            const needsReview = line.state === "needs_review";

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
                        Suggested: <span className="font-medium text-[var(--ink)]">{line.match || "—"}</span>
                      </span>
                      <span className="text-xs text-[var(--ink-soft)]">•</span>
                      <span className="text-xs font-medium text-[var(--brand)]">{line.confidence ? `${line.confidence}% confidence` : "No match"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-[var(--ink)]">NPR {Number(line.amount).toLocaleString()}</div>
                    <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isMatched ? "bg-[var(--brand-2)]/10 text-[var(--brand-2)]"
                      : needsReview ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "bg-[var(--ink-soft)]/10 text-[var(--ink-soft)]"
                    }`}>
                      {isMatched ? "Matched" : needsReview ? "Needs Review" : "Unmatched"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]">
                    <Eye className="h-4 w-4" />
                  </button>

                  <div className="flex gap-2">
                    <button
                      disabled={rowBusy}
                      onClick={() => updateState(line.id, "matched")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-2)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-2)]/90 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />Match
                    </button>
                    <button
                      disabled={rowBusy}
                      onClick={() => updateState(line.id, "needs_review")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-elevated)] disabled:opacity-50"
                    >
                      <HelpCircle className="h-4 w-4" />Review
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
