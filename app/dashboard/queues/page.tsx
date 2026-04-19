"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, FileWarning, Users } from "lucide-react";
import { useEffect, useState } from "react";

async function fetchSnapshot() {
  const res = await fetch("/api/analytics");
  const json = await res.json();
  return json.data;
}

export default function QueuesPage() {
  const [snapshot, setSnapshot] = useState<{
    overdue?: number;
    pendingApprovals?: number;
    blocked?: number;
    unmatched?: number;
  } | null>(null);

  useEffect(() => {
    fetchSnapshot().then(setSnapshot);
  }, []);

  const queueItems = [
    {
      title: "Overdue Invoices",
      count: `${snapshot?.overdue || 0} accounts`,
      owner: "Revenue desk",
      href: "/dashboard/invoices",
      icon: FileWarning,
      color: "text-[var(--danger)]",
      bg: "bg-[var(--danger)]/10",
    },
    {
      title: "Pending Approvals",
      count: `${snapshot?.pendingApprovals || 0} waiting`,
      owner: "Finance Controller",
      href: "/dashboard/expenses",
      icon: Clock,
      color: "text-[var(--accent)]",
      bg: "bg-[var(--accent)]/10",
    },
    {
      title: "Blocked Entries",
      count: `${snapshot?.blocked || 0} items`,
      owner: "Operations",
      href: "/dashboard/expenses",
      icon: FileWarning,
      color: "text-[var(--accent)]",
      bg: "bg-[var(--accent)]/10",
    },
    {
      title: "Bank Exceptions",
      count: `${snapshot?.unmatched || 0} lines`,
      owner: "Operations",
      href: "/dashboard/reconciliation",
      icon: CheckCircle,
      color: "text-[var(--brand)]",
      bg: "bg-[var(--brand)]/10",
    },
  ];

  const total =
    (snapshot?.overdue || 0) +
    (snapshot?.pendingApprovals || 0) +
    (snapshot?.blocked || 0) +
    (snapshot?.unmatched || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Approval Queues</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Items requiring your attention</p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[#111f36] to-[#1b3a6b] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <div className="text-3xl font-semibold">{total}</div>
            <div className="text-white/70">Total items across all queues</div>
          </div>
        </div>
      </div>

      {/* Queue Cards */}
      <div className="grid gap-4">
        {queueItems.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <div className="font-semibold text-[var(--ink)]">{item.title}</div>
                <div className="mt-1 text-sm text-[var(--ink-soft)]">
                  {item.count} • Owner: {item.owner}
                </div>
              </div>
            </div>
            <Link
              href={item.href}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111f36] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
            >
              Open
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
