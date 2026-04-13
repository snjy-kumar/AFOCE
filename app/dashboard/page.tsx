"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";

import { actionQueues, timelineEvents } from "@/lib/mock-data";
import { getDashboardSnapshot, getInvoices } from "@/lib/services/mock-finance-service";

export default function DashboardHomePage() {
  const [snapshot, setSnapshot] = useState({
    overdue: 0,
    pendingApprovals: 0,
    blocked: 0,
    unmatched: 0,
  });
  const [topInvoices, setTopInvoices] = useState<
    Array<{ id: string; client: string; amount: string; status: string }>
  >([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [nextSnapshot, nextInvoices] = await Promise.all([getDashboardSnapshot(), getInvoices()]);
      if (!active) {
        return;
      }

      setSnapshot(nextSnapshot);
      setTopInvoices(nextInvoices.slice(0, 5));
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="dashboard-panel rounded-[1.6rem] p-6">
          <div className="eyebrow">Command Center</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
            Operational visibility with stronger density and decision context.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
            This dashboard is structured to mimic production finance workflows: monitoring,
            action queues, and high-signal exception handling.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Overdue invoices" value={String(snapshot.overdue)} detail="Requires collection follow-up" />
            <MetricCard label="Pending approvals" value={String(snapshot.pendingApprovals)} detail="Waiting for manager/CFO" />
            <MetricCard label="Blocked entries" value={String(snapshot.blocked)} detail="Policy violations detected" />
            <MetricCard label="Unmatched bank lines" value={String(snapshot.unmatched)} detail="Reconciliation review queue" />
          </div>
        </div>

        <div className="dashboard-panel-dark rounded-[1.6rem] p-6 text-white">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-white/52">Cash and tax posture</div>
          <div className="mt-4 space-y-3">
            {[
              { label: "Cash position", value: "Rs. 8.45M" },
              { label: "VAT payable forecast", value: "Rs. 125.7K" },
              { label: "Receivables at risk", value: "Rs. 450K" },
              { label: "Approval SLA", value: "4.2 hrs" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/12 bg-white/10 px-4 py-3">
                <div className="text-xs text-white/60">{item.label}</div>
                <div className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 2xl:grid-cols-[1.1fr_0.9fr_1fr]">
        <div className="dashboard-panel rounded-[1.6rem] p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[var(--ink)]">Action queues</div>
            <TrendingUp className="h-4 w-4 text-[var(--brand)]" />
          </div>
          <div className="mt-4 space-y-3">
            {actionQueues.map((item) => (
              <div key={item.title} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <div className="text-sm font-semibold text-[var(--ink)]">{item.title}</div>
                <div className="mt-1 text-xs text-[var(--ink-soft)]">{item.count} | Owner: {item.owner}</div>
                <Link href={item.href} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)]">
                  Open module
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel rounded-[1.6rem] p-6">
          <div className="text-sm font-semibold text-[var(--ink)]">Recent invoices</div>
          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                <tr>
                  <th className="px-3 py-2.5">Invoice</th>
                  <th className="px-3 py-2.5">Client</th>
                  <th className="px-3 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {topInvoices.map((item) => (
                  <tr key={item.id} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2.5 text-xs font-semibold text-[var(--ink)]">{item.id}</td>
                    <td className="px-3 py-2.5 text-xs text-[var(--ink-soft)]">{item.client}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-semibold text-[var(--ink)]">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-panel rounded-[1.6rem] p-6">
          <div className="text-sm font-semibold text-[var(--ink)]">Immutable activity trail</div>
          <div className="mt-4 space-y-3">
            {timelineEvents.map((event) => (
              <div key={`${event.time}-${event.title}`} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-2)]">{event.time}</div>
                <div className="mt-1 text-sm font-semibold text-[var(--ink)]">{event.title}</div>
                <div className="mt-1 text-xs text-[var(--ink-soft)]">{event.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)]">{value}</div>
      <div className="mt-1 text-xs text-[var(--ink-soft)]">{detail}</div>
    </div>
  );
}
