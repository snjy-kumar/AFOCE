"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Download, Eye, HelpCircle, Link2, Plus, Search, Trash2, X } from "lucide-react";

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
  matched_invoice_id?: string | null;
  matched_expense_id?: string | null;
}

async function fetchBankLines() {
  const res = await fetch("/api/bank-lines");
  const json = await res.json();
  if (json.error) return [];
  return json.data?.data || [];
}

async function updateBankLineState(id: string, state: BankLineState) {
  const res = await fetch(`/api/bank-lines/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.data;
}

async function deleteBankLine(id: string) {
  const res = await fetch(`/api/bank-lines/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.data;
}

const stateColors = {
  matched: { bg: "bg-[var(--brand-2)]/10", text: "text-[var(--brand-2)]", label: "Matched" },
  needs_review: { bg: "bg-[var(--accent)]/10", text: "text-[var(--accent)]", label: "Needs Review" },
  unmatched: { bg: "bg-[var(--danger)]/10", text: "text-[var(--danger)]", label: "Unmatched" },
};

export default function ReconciliationPage() {
  const [lines, setLines] = useState<BankLine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<BankLineState | "All">("All");
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadBankLines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBankLines();
      setLines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bank lines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBankLines();
  }, [loadBankLines]);

  const filtered = useMemo(() => {
    return lines.filter((line) => {
      const stateMatch = stateFilter === "All" || line.state === stateFilter;
      const searchLower = searchQuery.toLowerCase();
      const searchMatch =
        line.id.toLowerCase().includes(searchLower) ||
        (line.description?.toLowerCase().includes(searchLower) ?? false) ||
        line.date.includes(searchLower);
      return stateMatch && searchMatch;
    });
  }, [lines, stateFilter, searchQuery]);

  const handleStateChange = async (lineId: string, newState: BankLineState) => {
    setActionLoading(true);
    try {
      await updateBankLineState(lineId, newState);
      await loadBankLines();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update state");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (lineId: string) => {
    if (!confirm("Are you sure you want to delete this bank transaction?")) return;
    setActionLoading(true);
    try {
      await deleteBankLine(lineId);
      await loadBankLines();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transaction");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Date", "Description", "Amount", "State", "Matched ID"],
      ...filtered.map((l) => [l.date, l.description || "", l.amount, l.state, l.match || ""]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bank-reconciliation.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const matchedCount = lines.filter((l) => l.state === "matched").length;
  const needsReviewCount = lines.filter((l) => l.state === "needs_review").length;
  const unmatchedCount = lines.filter((l) => l.state === "unmatched").length;
  const totalAmount = lines.reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="space-y-6">
      {showImport && (
        <BankImportModal
          onClose={() => setShowImport(false)}
          onImported={() => {
            setShowImport(false);
            loadBankLines();
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Bank Reconciliation</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Match bank statements with transactions</p>
        </div>
        <button
          type="button"
          onClick={() => setShowImport(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
        >
          <Plus className="h-4 w-4" />
          Import Statement
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Matched</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--brand-2)]">{matchedCount}</div>
          <div className="mt-2 text-xs text-[var(--ink-soft)]">Reconciled transactions</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Needs Review</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--accent)]">{needsReviewCount}</div>
          <div className="mt-2 text-xs text-[var(--ink-soft)]">Pending review</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Unmatched</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--danger)]">{unmatchedCount}</div>
          <div className="mt-2 text-xs text-[var(--ink-soft)]">Not reconciled</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Total Amount</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">NPR {totalAmount.toLocaleString()}</div>
          <div className="mt-2 text-xs text-[var(--ink-soft)]">Sum of all transactions</div>
        </div>
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
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)]"
                />
              </div>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value as BankLineState | "All")}
                className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              >
                <option value="All">All Status</option>
                <option value="matched">Matched</option>
                <option value="needs_review">Needs Review</option>
                <option value="unmatched">Unmatched</option>
              </select>
            </div>
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

        {/* Transactions */}
        <div className="divide-y divide-[var(--border)]">
          {loading ? (
            <div className="px-4 py-12 text-center text-[var(--ink-soft)]">
              Loading transactions...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <HelpCircle className="mx-auto h-12 w-12 text-[var(--ink-soft)]" />
              <h3 className="mt-4 text-lg font-semibold text-[var(--ink)]">No transactions found</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {searchQuery || stateFilter !== "All" ? "Try adjusting your filters" : "Import bank statements to get started"}
              </p>
            </div>
          ) : (
            filtered.map((line) => {
              const stateInfo = stateColors[line.state as keyof typeof stateColors];
              return (
                <div key={line.id} className="p-5 hover:bg-[var(--bg-elevated)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[var(--ink-soft)]">{line.id}</span>
                        <span className="text-xs text-[var(--ink-soft)]">•</span>
                        <span className="text-xs text-[var(--ink-soft)]">{line.date}</span>
                      </div>
                      <div className="mt-1 font-semibold text-[var(--ink)]">{line.description || "—"}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stateInfo.bg} ${stateInfo.text}`}>
                          {stateInfo.label}
                        </span>
                        {line.confidence && (
                          <span className="text-xs text-[var(--ink-soft)]">
                            Confidence: {(line.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-[var(--ink)]">NPR {line.amount.toLocaleString()}</div>
                      {line.matched_invoice_id && (
                        <div className="mt-1 text-xs text-[var(--brand-2)]">
                          Invoice: {line.matched_invoice_id}
                        </div>
                      )}
                      {line.matched_expense_id && (
                        <div className="mt-1 text-xs text-[var(--brand-2)]">
                          Expense: {line.matched_expense_id}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                    <div className="flex items-center gap-2">
                      <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]" title="View details">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(line.id)}
                        disabled={actionLoading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                        title="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {line.state !== "matched" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStateChange(line.id, "matched")}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-2)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-2)]/90 disabled:opacity-50"
                            title="Mark as matched"
                          >
                            <Check className="h-4 w-4" />
                            Match
                          </button>
                          {line.state === "unmatched" && (
                            <button
                              type="button"
                              onClick={() => handleStateChange(line.id, "needs_review")}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-elevated)] disabled:opacity-50"
                              title="Mark for review"
                            >
                              <Link2 className="h-4 w-4" />
                              Review
                            </button>
                          )}
                        </>
                      )}
                      {line.state === "matched" && (
                        <button
                          type="button"
                          onClick={() => handleStateChange(line.id, "unmatched")}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-elevated)] disabled:opacity-50"
                          title="Unmatch transaction"
                        >
                          <X className="h-4 w-4" />
                          Unmatch
                        </button>
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
  );
}
