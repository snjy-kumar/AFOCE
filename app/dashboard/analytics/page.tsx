"use client";

import { BarChart3, Download, TrendingDown, TrendingUp, Wallet } from "lucide-react";

const monthlyData = [
  { month: "Poush", revenue: 2840000, expenses: 1890000, profit: 950000 },
  { month: "Magh", revenue: 3120000, expenses: 2010000, profit: 1110000 },
  { month: "Falgun", revenue: 2980000, expenses: 2150000, profit: 830000 },
  { month: "Chaitra", revenue: 3450000, expenses: 2280000, profit: 1170000 },
  { month: "Baisakh", revenue: 3890000, expenses: 2450000, profit: 1440000 },
];

const metrics = [
  {
    label: "Revenue",
    value: "Rs. 3.89M",
    change: "+12.8%",
    trend: "up" as const,
    icon: TrendingUp,
    color: "text-[var(--brand-2)]",
    bg: "bg-[var(--brand-2)]/10",
  },
  {
    label: "Expenses",
    value: "Rs. 2.45M",
    change: "+7.5%",
    trend: "up" as const,
    icon: TrendingDown,
    color: "text-[var(--danger)]",
    bg: "bg-[var(--danger)]/10",
  },
  {
    label: "Gross Profit",
    value: "Rs. 1.44M",
    change: "+23.1%",
    trend: "up" as const,
    icon: Wallet,
    color: "text-[var(--brand)]",
    bg: "bg-[var(--brand)]/10",
  },
  {
    label: "Profit Margin",
    value: "37%",
    change: "+3.2%",
    trend: "up" as const,
    icon: BarChart3,
    color: "text-[var(--accent)]",
    bg: "bg-[var(--accent)]/10",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Analytics</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Financial insights and trends</p>
        </div>
        <div className="flex gap-2">
          <select className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
            <option>This Fiscal Year</option>
          </select>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${metric.bg}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
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
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold text-[var(--ink)]">Revenue Trend</h2>
          <p className="text-sm text-[var(--ink-soft)]">Monthly revenue for current fiscal year</p>
          <div className="mt-6 space-y-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[var(--ink)]">{data.month}</span>
                  <span className="text-[var(--ink-soft)]">{(data.revenue / 1000000).toFixed(2)}M</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                  <div
                    className="h-2 rounded-full bg-[var(--brand)]"
                    style={{ width: `${(data.revenue / 4000000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profit Margin */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold text-[var(--ink)]">Profit Margin</h2>
          <p className="text-sm text-[var(--ink-soft)]">Revenue vs Expenses comparison</p>
          <div className="mt-6 space-y-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[var(--ink)]">{data.month}</span>
                  <span className="text-[var(--brand-2)]">{((data.profit / data.revenue) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex gap-1">
                  <div
                    className="h-2 rounded-full bg-[var(--brand)]"
                    style={{ width: `${(data.revenue / 4000000) * 100}%` }}
                  />
                  <div
                    className="h-2 rounded-full bg-[var(--accent)]"
                    style={{ width: `${(data.expenses / 4000000) * 100}%` }}
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
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="font-semibold text-[var(--ink)]">Key Insights</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
            <div className="text-sm font-medium text-[var(--ink)]">Top Revenue Source</div>
            <div className="mt-2 text-lg font-semibold text-[var(--brand)]">Consulting Services</div>
            <div className="mt-1 text-xs text-[var(--ink-soft)]">Rs. 1.89M (48.6%)</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
            <div className="text-sm font-medium text-[var(--ink)]">Highest Expense Category</div>
            <div className="mt-2 text-lg font-semibold text-[var(--accent)]">Staff Costs</div>
            <div className="mt-1 text-xs text-[var(--ink-soft)]">Rs. 980K (40%)</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
            <div className="text-sm font-medium text-[var(--ink)]">Collection Rate</div>
            <div className="mt-2 text-lg font-semibold text-[var(--brand-2)]">94.2%</div>
            <div className="mt-1 text-xs text-[var(--ink-soft)]">Up from 89.1% last month</div>
          </div>
        </div>
      </div>
    </div>
  );
}
