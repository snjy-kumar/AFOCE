"use client";

import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  color: string;
  bg: string;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

async function fetchAnalytics() {
  const res = await fetch("/api/analytics");
  const json = await res.json();
  if (json.error) return null;
  return json.data as { metrics: Metric[]; monthlyData: MonthlyData[] } | null;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [period, setPeriod] = useState("This Month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnalytics();
      if (data) {
        setMetrics(data.metrics);
        setMonthlyData(data.monthlyData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExport = () => {
    const csv = [
      ["Month", "Revenue", "Expenses", "Profit", "Margin %"],
      ...monthlyData.map((m) => [
        m.month,
        m.revenue,
        m.expenses,
        m.profit,
        m.revenue > 0 ? ((m.profit / m.revenue) * 100).toFixed(1) : "0",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Analytics</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Financial insights and trends</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
            <option>This Fiscal Year</option>
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Total Revenue</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">NPR {(totalRevenue / 1000000).toFixed(2)}M</div>
          <div className="mt-2 text-xs text-[var(--brand-2)]">+12.5% from last period</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Total Expenses</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">NPR {(totalExpenses / 1000000).toFixed(2)}M</div>
          <div className="mt-2 text-xs text-[var(--accent)]">+5.2% from last period</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Net Profit</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--brand-2)]">NPR {(totalProfit / 1000000).toFixed(2)}M</div>
          <div className="mt-2 text-xs text-[var(--brand-2)]">+18.3% from last period</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Profit Margin</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{profitMargin}%</div>
          <div className="mt-2 text-xs text-[var(--brand-2)]">+2.1% from last period</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-[var(--border)] bg-white p-5 animate-pulse">
              <div className="h-4 w-24 rounded bg-[var(--border)]" />
              <div className="mt-4 h-8 w-32 rounded bg-[var(--border)]" />
              <div className="mt-2 h-3 w-20 rounded bg-[var(--border)]" />
            </div>
          ))
        ) : metrics.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-[var(--border)] bg-white p-12 text-center">
            <p className="text-[var(--ink-soft)]">No metrics available</p>
          </div>
        ) : (
          metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${metric.bg}`}>
                  {metric.trend === "up" ? (
                    <TrendingUp className={`h-5 w-5 ${metric.color}`} />
                  ) : (
                    <TrendingDown className={`h-5 w-5 ${metric.color}`} />
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    metric.trend === "up" ? "bg-[var(--brand-2)]/10 text-[var(--brand-2)]" : "bg-[var(--danger)]/10 text-[var(--danger)]"
                  }`}
                >
                  {metric.change}
                </span>
              </div>
              <div className="mt-4 text-2xl font-semibold text-[var(--ink)]">{metric.value}</div>
              <div className="mt-1 text-sm text-[var(--ink-soft)]">{metric.label}</div>
            </div>
          ))
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold text-[var(--ink)]">Revenue Trend</h2>
          <p className="text-sm text-[var(--ink-soft)]">Monthly revenue for current period</p>
          <div className="mt-6 space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="h-3 w-20 rounded bg-[var(--border)]" />
                  <div className="h-2 w-full rounded-full bg-[var(--border)]" />
                </div>
              ))
            ) : monthlyData.length === 0 ? (
              <div className="py-8 text-center text-[var(--ink-soft)]">No data available</div>
            ) : (
              monthlyData.map((data) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[var(--ink)]">{data.month}</span>
                    <span className="text-[var(--ink-soft)]">NPR {(data.revenue / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                    <div
                      className="h-2 rounded-full bg-[var(--brand)]"
                      style={{ width: `${Math.min((data.revenue / Math.max(...monthlyData.map((m) => m.revenue))) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Profit Margin */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold text-[var(--ink)]">Profit Margin</h2>
          <p className="text-sm text-[var(--ink-soft)]">Revenue vs Expenses comparison</p>
          <div className="mt-6 space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="h-3 w-20 rounded bg-[var(--border)]" />
                  <div className="h-2 w-full rounded-full bg-[var(--border)]" />
                </div>
              ))
            ) : monthlyData.length === 0 ? (
              <div className="py-8 text-center text-[var(--ink-soft)]">No data available</div>
            ) : (
              <>
                {monthlyData.map((data) => (
                  <div key={data.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[var(--ink)]">{data.month}</span>
                      <span className="text-[var(--brand-2)]">{data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : "0"}%</span>
                    </div>
                    <div className="flex gap-1">
                      <div
                        className="h-2 rounded-full bg-[var(--brand)]"
                        style={{ width: `${(data.revenue / Math.max(...monthlyData.map((m) => m.revenue + m.expenses))) * 100}%` }}
                      />
                      <div
                        className="h-2 rounded-full bg-[var(--accent)]"
                        style={{ width: `${(data.expenses / Math.max(...monthlyData.map((m) => m.revenue + m.expenses))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-4 flex items-center gap-4 text-xs text-[var(--ink-soft)]">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[var(--brand)]" />
                    Revenue
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[var(--accent)]" />
                    Expenses
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
