"use client";

import { Download, FileText, PieChart, Printer, TrendingUp, Wallet, Calendar, Eye, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { adToBsDateWithDay } from "@/lib/utils/date";

interface VATData {
  month: string;
  output_tax: number;
  input_tax: number;
  net_payable: number;
}

interface AuditEntry {
  id: number;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  actor_email?: string;
}

async function fetchVAT(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  const res = await fetch(`/api/reports/vat?${params}`);
  const json = await res.json();
  if (json.error) return null;
  return json.data;
}

async function fetchAudit(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  const res = await fetch(`/api/reports/audit?${params}`);
  const json = await res.json();
  if (json.error) return [];
  return (json.data || []) as AuditEntry[];
}

export default function ReportsPage() {
  const [vat, setVat] = useState<VATData | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"vat" | "audit">("vat");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "vat") {
        const data = await fetchVAT(fromDate, toDate);
        setVat(data);
      } else {
        const data = await fetchAudit(fromDate, toDate);
        setAudit(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [activeTab, fromDate, toDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async () => {
    if (activeTab === "vat" && vat) {
      const csv = [
        ["Month", "Output Tax", "Input Tax", "Net Payable"],
        ["", vat.output_tax, vat.input_tax, vat.net_payable],
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vat-report.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (activeTab === "audit" && audit.length > 0) {
      const csv = [
        ["ID", "User", "Action", "Entity Type", "Entity ID", "Date"],
        ...audit.map((e) => [e.id, e.actor_email || e.actor_id, e.action, e.entity_type, e.entity_id || "", e.created_at]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit-log.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const totalOutputTax = vat?.output_tax || 0;
  const totalInputTax = vat?.input_tax || 0;
  const netPayable = vat?.net_payable || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Reports</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">VAT, audit logs, and compliance reports</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--ink-soft)]" />
            <span className="text-sm font-medium text-[var(--ink)]">Date Range:</span>
          </div>
          <div className="flex flex-1 gap-3">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              placeholder="From"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              placeholder="To"
            />
            <button
              type="button"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        <button
          type="button"
          onClick={() => setActiveTab("vat")}
          className={`px-4 py-3 text-sm font-medium transition ${
            activeTab === "vat"
              ? "border-b-2 border-[var(--brand)] text-[var(--brand)]"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            VAT Report
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-3 text-sm font-medium transition ${
            activeTab === "audit"
              ? "border-b-2 border-[var(--brand)] text-[var(--brand)]"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Log
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === "vat" ? (
        <div className="space-y-6">
          {/* VAT Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <div className="text-sm font-medium text-[var(--ink-soft)]">Output Tax</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">NPR {totalOutputTax.toLocaleString()}</div>
              <div className="mt-2 text-xs text-[var(--ink-soft)]">Tax collected from sales</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <div className="text-sm font-medium text-[var(--ink-soft)]">Input Tax</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">NPR {totalInputTax.toLocaleString()}</div>
              <div className="mt-2 text-xs text-[var(--ink-soft)]">Tax paid on purchases</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <div className="text-sm font-medium text-[var(--ink-soft)]">Net Payable</div>
              <div className={`mt-2 text-2xl font-semibold ${netPayable > 0 ? "text-[var(--danger)]" : "text-[var(--brand-2)]"}`}>
                NPR {netPayable.toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-[var(--ink-soft)]">{netPayable > 0 ? "Amount due" : "Amount refundable"}</div>
            </div>
          </div>

          {/* VAT Details */}
          {loading ? (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center">
              <p className="text-[var(--ink-soft)]">Loading VAT report...</p>
            </div>
          ) : vat ? (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <h2 className="text-lg font-semibold text-[var(--ink)]">VAT Summary</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <span className="text-[var(--ink-soft)]">Reporting Period</span>
                  <span className="font-semibold text-[var(--ink)]">{vat.month}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <span className="text-[var(--ink-soft)]">Output Tax (Collected)</span>
                  <span className="font-semibold text-[var(--ink)]">NPR {vat.output_tax.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <span className="text-[var(--ink-soft)]">Input Tax (Paid)</span>
                  <span className="font-semibold text-[var(--ink)]">NPR {vat.input_tax.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-4 rounded-lg">
                  <span className="font-semibold text-[var(--ink)]">Net VAT Payable</span>
                  <span className="text-lg font-semibold text-[var(--ink)]">NPR {vat.net_payable.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center">
              <PieChart className="mx-auto h-12 w-12 text-[var(--ink-soft)]" />
              <h3 className="mt-4 text-lg font-semibold text-[var(--ink)]">No data available</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">Try adjusting your date range</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Audit Log */}
          <div className="rounded-2xl border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border)] p-4">
              <h2 className="font-semibold text-[var(--ink)]">Activity Log</h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">All system activities and changes</p>
            </div>

            {loading ? (
              <div className="px-4 py-12 text-center text-[var(--ink-soft)]">
                Loading audit log...
              </div>
            ) : audit.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-[var(--ink-soft)]" />
                <h3 className="mt-4 text-lg font-semibold text-[var(--ink)]">No activities found</h3>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">No audit logs match your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/50">
                      <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">User</th>
                      <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Action</th>
                      <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Entity</th>
                      <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">ID</th>
                      <th className="px-4 py-3 font-medium text-[var(--ink-soft)]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {audit.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[var(--bg-elevated)]">
                        <td className="px-4 py-4">
                          <span className="text-[var(--ink)]">{entry.actor_email || entry.actor_id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            entry.action === "create" ? "bg-[var(--brand-2)]/10 text-[var(--brand-2)]"
                            : entry.action === "update" ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "bg-[var(--danger)]/10 text-[var(--danger)]"
                          }`}>
                            {entry.action}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[var(--ink-soft)]">{entry.entity_type}</td>
                        <td className="px-4 py-4 font-mono text-xs text-[var(--ink-soft)]">{entry.entity_id || "—"}</td>
                        <td className="px-4 py-4 text-[var(--ink-soft)]">{new Date(entry.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
