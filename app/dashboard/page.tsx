"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  DollarSign,
  FileWarning,
  Receipt,
  TrendingUp,
  Wallet,
  Building2,
  CreditCard,
  BarChart3,
} from "lucide-react";

import type { ExpenseStatus } from "@/lib/services/mock-finance-service";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { MetricChart } from "@/components/dashboard/MetricChart";
import { VATWidget } from "@/components/dashboard/VATWidget";
import { ExpenseRow } from "@/components/dashboard/ExpenseRow";
import { CardSkeleton, TableSkeleton } from "@/components/dashboard/Skeleton";
import { createClient } from "@/utils/supabase/client";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatCurrency(value: number): string {
  return `Rs. ${Math.round(value).toLocaleString()}`;
}

function toExpenseStatus(status: string): ExpenseStatus {
  if (status === "manager_review") return "Manager review";
  if (status === "blocked") return "Blocked";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending approval";
}

interface RecentActivityItem {
  id: string;
  time: string;
  title: string;
  detail: string;
}

export default function DashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [snapshot, setSnapshot] = useState({
    overdue: 0,
    pendingApprovals: 0,
    blocked: 0,
    unmatched: 0,
  });
  const [invoices, setInvoices] = useState<
    Array<{ id: string; client: string; amount: string; status: string }>
  >([]);
  const [expenses, setExpenses] = useState<
    Array<{
      id: string;
      employee: string;
      category: string;
      amount: string;
      bsDate: string;
      status: ExpenseStatus;
      policy: string;
      receipt: "Attached" | "Missing";
    }>
  >([]);
  const [totals, setTotals] = useState({
    receivables: 0,
    payables: 0,
    cashPosition: 0,
    vatPayable: 0,
  });
  const [vatCard, setVatCard] = useState({
    outputTax: formatCurrency(0),
    inputTax: formatCurrency(0),
    netPayable: formatCurrency(0),
    month: "Current month",
    dueDays: 4,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<Array<{ label: string; value: number; color: string }>>([]);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const supabase = createClient();
      const isDemo =
        typeof window !== "undefined" &&
        localStorage.getItem("demo_session") === "true";

      if (isDemo) {
        setUserName("Demo User");
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      } else if (user.email) {
        setUserName(user.email.split("@")[0]);
      }

      const [invoiceRes, expenseRes, bankRes] = await Promise.all([
        fetch("/api/invoices?page=1&pageSize=100&sortBy=created_at&sortOrder=desc", { cache: "no-store" }),
        fetch("/api/expenses?page=1&pageSize=100&sortBy=created_at&sortOrder=desc", { cache: "no-store" }),
        fetch("/api/bank-lines?page=1&pageSize=100", { cache: "no-store" }),
      ]);

      const [invoiceJson, expenseJson, bankJson] = await Promise.all([
        invoiceRes.json(),
        expenseRes.json(),
        bankRes.json(),
      ]);

      const invoiceRows = ((invoiceJson.data?.data || []) as Array<{
        id: string;
        amount: number;
        vat: number;
        status: string;
        created_at: string;
        created_by?: string;
        client?: { name?: string };
      }>).filter((row) => row.created_by === user.id);

      const expenseRows = ((expenseJson.data?.data || []) as Array<{
        id: string;
        employee: string;
        category: string;
        amount: number;
        bs_date: string;
        status: string;
        created_at: string;
        created_by?: string;
        receipt_url: string | null;
      }>).filter((row) => row.created_by === user.id);

      const bankRows = ((bankJson.data?.data || []) as Array<{
        id: string;
        state: string;
        amount: number;
        created_at: string;
        created_by?: string;
      }>).filter((row) => row.created_by === user.id);

      if (!active) return;

      const nextSnapshot = {
        overdue: invoiceRows.filter((entry) => entry.status === "overdue").length,
        pendingApprovals: expenseRows.filter(
          (entry) => entry.status === "pending_approval" || entry.status === "manager_review",
        ).length,
        blocked: expenseRows.filter((entry) => entry.status === "blocked").length,
        unmatched: bankRows.filter((entry) => entry.state !== "matched").length,
      };

      const invoiceTotal = invoiceRows.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
      const expenseTotal = expenseRows.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
      const outputTax = invoiceRows.reduce((sum, entry) => sum + Number(entry.vat || 0), 0);

      const monthMap = new Map<string, number>();
      for (const invoice of invoiceRows) {
        const label = new Date(invoice.created_at).toLocaleString("en-US", { month: "short" });
        monthMap.set(label, (monthMap.get(label) || 0) + Number(invoice.amount || 0) + Number(invoice.vat || 0));
      }
      const trendBars = Array.from(monthMap.entries())
        .slice(-3)
        .map(([label, value]) => ({ label, value, color: "bg-[var(--brand)]" }));

      const activity = [
        ...invoiceRows.map((row) => ({
          id: `inv-${row.id}`,
          createdAt: row.created_at,
          title: `Invoice ${row.id}`,
          detail: `${formatCurrency(Number(row.amount || 0) + Number(row.vat || 0))} created`,
        })),
        ...expenseRows.map((row) => ({
          id: `exp-${row.id}`,
          createdAt: row.created_at,
          title: `Expense ${row.id}`,
          detail: `${formatCurrency(Number(row.amount || 0))} in ${row.category}`,
        })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4)
        .map((item) => ({
          id: item.id,
          time: new Date(item.createdAt).toLocaleDateString(),
          title: item.title,
          detail: item.detail,
        }));

      setSnapshot(nextSnapshot);
      setInvoices(
        invoiceRows.slice(0, 5).map((row) => ({
          id: row.id,
          client: row.client?.name || "Unknown",
          amount: formatCurrency(Number(row.amount || 0) + Number(row.vat || 0)),
          status: row.status,
        })),
      );
      setExpenses(
        expenseRows.slice(0, 3).map((row) => ({
          id: row.id,
          employee: row.employee,
          category: row.category,
          amount: formatCurrency(Number(row.amount || 0)),
          bsDate: row.bs_date,
          status: toExpenseStatus(row.status),
          policy: row.status === "blocked" ? "Blocked by policy rule" : "Within allowed policy",
          receipt: row.receipt_url ? "Attached" : "Missing",
        })),
      );
      setTotals({
        receivables: invoiceTotal,
        payables: expenseTotal,
        cashPosition: invoiceTotal - expenseTotal,
        vatPayable: outputTax,
      });
      setVatCard({
        outputTax: formatCurrency(outputTax),
        inputTax: formatCurrency(0),
        netPayable: formatCurrency(outputTax),
        month: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
        dueDays: 4,
      });
      setRevenueBreakdown(trendBars.length > 0 ? trendBars : [{ label: "Now", value: 0, color: "bg-[var(--brand)]" }]);
      setRecentActivity(activity);
      setLoading(false);
    };

    setLoading(true);
    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const metrics = loading
    ? []
    : [
        {
          label: "Cash Position",
          value: formatCurrency(totals.cashPosition),
          change: `${snapshot.unmatched} to reconcile`,
          trend: "up" as const,
          icon: Wallet,
          color: "text-[var(--brand-2)]",
          bg: "bg-[var(--brand-2)]/10",
        },
        {
          label: "Receivables",
          value: formatCurrency(totals.receivables),
          change: `${snapshot.overdue} overdue`,
          trend: "warning" as const,
          icon: DollarSign,
          color: "text-[var(--accent)]",
          bg: "bg-[var(--accent)]/10",
        },
        {
          label: "Payables",
          value: formatCurrency(totals.payables),
          change: `${snapshot.pendingApprovals} awaiting review`,
          trend: "neutral" as const,
          icon: CreditCard,
          color: "text-[var(--brand)]",
          bg: "bg-[var(--brand)]/10",
        },
        {
          label: "VAT Payable",
          value: formatCurrency(totals.vatPayable),
          change: "Current month",
          trend: "neutral" as const,
          icon: Receipt,
          color: "text-[var(--ink-soft)]",
          bg: "bg-[var(--ink-soft)]/10",
        },
      ];

  const quickActions = [
    { label: "Create Invoice", href: "/dashboard/invoices", icon: Receipt },
    { label: "Log Expense", href: "/dashboard/expenses", icon: CreditCard },
    { label: "Add Client", href: "/dashboard/clients", icon: Building2 },
    { label: "View Reports", href: "/dashboard/reports", icon: BarChart3 },
  ];

  const quickAccess = [
    { title: "Overdue", href: "/dashboard/invoices?filter=overdue", count: `${snapshot.overdue} items` },
    { title: "Approvals", href: "/dashboard/expenses", count: `${snapshot.pendingApprovals} pending` },
    { title: "Blocked", href: "/dashboard/queues", count: `${snapshot.blocked} blocked` },
    { title: "Reconcile", href: "/dashboard/reconciliation", count: `${snapshot.unmatched} open` },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[#111f36] to-[#1b3a6b] p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {getGreeting()}, {userName}
            </h1>
            <p className="mt-1 text-white/70">
              Here&apos;s what&apos;s happening with your finances today.
            </p>
          </div>
          <div className="flex gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
              >
                <action.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : metrics.map((metric) => (
              <StatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={metric.icon}
                color={metric.color}
                bgColor={metric.bg}
              />
            ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Action Queues */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[var(--ink)]">Action Required</h2>
                  <p className="text-sm text-[var(--ink-soft)]">Items that need your attention</p>
                </div>
                <Link
                  href="/dashboard/queues"
                  className="text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-dark)]"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {snapshot.overdue > 0 && (
                <QueueItem
                  icon={AlertCircle}
                  iconBg="bg-[var(--danger)]/10"
                  iconColor="text-[var(--danger)]"
                  title="Overdue Invoices"
                  description={`${snapshot.overdue} invoices need collection follow-up`}
                  href="/dashboard/invoices?filter=overdue"
                />
              )}
              {snapshot.pendingApprovals > 0 && (
                <QueueItem
                  icon={Clock}
                  iconBg="bg-[var(--accent)]/10"
                  iconColor="text-[var(--accent)]"
                  title="Pending Approvals"
                  description={`${snapshot.pendingApprovals} items waiting for review`}
                  href="/dashboard/expenses"
                />
              )}
              {snapshot.blocked > 0 && (
                <QueueItem
                  icon={FileWarning}
                  iconBg="bg-[var(--accent)]/10"
                  iconColor="text-[var(--accent)]"
                  title="Blocked Entries"
                  description={`${snapshot.blocked} policy violations detected`}
                  href="/dashboard/queues"
                />
              )}
              {snapshot.unmatched > 0 && (
                <QueueItem
                  icon={Wallet}
                  iconBg="bg-[var(--brand)]/10"
                  iconColor="text-[var(--brand)]"
                  title="Unmatched Bank Lines"
                  description={`${snapshot.unmatched} reconciliation exceptions`}
                  href="/dashboard/reconciliation"
                />
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border)] px-6 py-4">
            <h2 className="font-semibold text-[var(--ink)]">Recent Activity</h2>
            <p className="text-sm text-[var(--ink-soft)]">Latest transactions</p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentActivity.length === 0 && !loading && (
              <div className="px-6 py-8 text-sm text-[var(--ink-soft)]">No recent activity for this user.</div>
            )}
            {recentActivity.map((event) => (
              <div key={event.id} className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[var(--brand-2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-2)]">
                    {event.time}
                  </span>
                </div>
                <div className="mt-2 text-sm font-medium text-[var(--ink)]">{event.title}</div>
                <div className="mt-1 text-xs text-[var(--ink-soft)]">{event.detail}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--border)] px-6 py-3">
            <Link
              href="/dashboard/reports"
              className="text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-dark)]"
            >
              View full timeline →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access & Recent Invoices & VAT */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Access */}
        <DashboardCard title="Quick Access" subtitle="Key action areas">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {quickAccess.map((item) => (
                <Link
                  key={item.title + item.href}
                  href={item.href}
                  className="flex flex-col rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--brand)] hover:bg-[var(--bg-elevated)]"
                >
                  <span className="text-sm font-medium text-[var(--ink)]">{item.title}</span>
                  <span className="mt-1 text-xs text-[var(--ink-soft)]">{item.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </DashboardCard>

        {/* Revenue Chart */}
        <DashboardCard title="Revenue Trend" subtitle="Last 3 months">
          <div className="p-6">
            <MetricChart data={revenueBreakdown} height={100} />
          </div>
        </DashboardCard>

        {/* VAT Widget */}
        <VATWidget
          outputTax={vatCard.outputTax}
          inputTax={vatCard.inputTax}
          netPayable={vatCard.netPayable}
          month={vatCard.month}
          dueDays={vatCard.dueDays}
          loading={loading}
        />
      </div>

      {/* Recent Invoices & Expenses */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices Table */}
        <DashboardCard
          title="Recent Invoices"
          subtitle="Latest issued invoices"
          action={
            <Link
              href="/dashboard/invoices"
              className="text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-dark)]"
            >
              View all
            </Link>
          }
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/50">
                  <th className="px-6 py-3 font-medium text-[var(--ink-soft)]">Invoice</th>
                  <th className="px-6 py-3 font-medium text-[var(--ink-soft)]">Client</th>
                  <th className="px-6 py-3 text-right font-medium text-[var(--ink-soft)]">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-3">
                          <div className="h-4 w-20 animate-pulse rounded bg-[var(--border)]" />
                        </td>
                        <td className="px-6 py-3">
                          <div className="h-4 w-28 animate-pulse rounded bg-[var(--border)]" />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="h-4 w-16 ml-auto animate-pulse rounded bg-[var(--border)]" />
                        </td>
                      </tr>
                    ))
                  : invoices.map((invoice) => (
                      <tr key={invoice.id} className="transition hover:bg-[var(--bg-elevated)]">
                        <td className="px-6 py-3">
                          <span className="font-medium text-[var(--ink)]">{invoice.id}</span>
                        </td>
                        <td className="px-6 py-3 text-[var(--ink-soft)]">{invoice.client}</td>
                        <td className="px-6 py-3 text-right font-medium text-[var(--ink)]">
                          {invoice.amount}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        {/* Recent Expenses */}
        <DashboardCard
          title="Recent Expenses"
          subtitle="Awaiting approval"
          action={
            <Link
              href="/dashboard/expenses"
              className="text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-dark)]"
            >
              View all
            </Link>
          }
        >
          {loading ? (
            <TableSkeleton rows={2} />
          ) : expenses.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-[var(--ink-soft)]">
              No pending expenses
            </div>
          ) : (
            expenses.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

function QueueItem({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-6 py-4 transition hover:bg-[var(--bg-elevated)]"
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <div className="font-medium text-[var(--ink)]">{title}</div>
          <div className="text-sm text-[var(--ink-soft)]">{description}</div>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-[var(--ink-soft)]" />
    </Link>
  );
}
