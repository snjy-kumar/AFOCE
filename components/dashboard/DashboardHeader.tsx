"use client";

import { usePathname } from "next/navigation";
import { Bell, Command, Download, Plus } from "lucide-react";

const pathTitles: Record<string, string> = {
  "/dashboard": "Command Center",
  "/dashboard/invoices": "Invoices",
  "/dashboard/expenses": "Expenses",
  "/dashboard/reconciliation": "Reconciliation",
  "/dashboard/reports": "Reports",
  "/dashboard/queues": "Approvals",
  "/dashboard/clients": "Clients & Vendors",
  "/dashboard/team": "Team Members",
  "/dashboard/policies": "Policy Rules",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const title = pathTitles[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--panel)]">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-[var(--ink)]">{title}</h1>
            <span className="rounded-full bg-[var(--brand-2)]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-2)]">
              FY 2081/82
            </span>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">Baisakh close in progress</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)] md:inline-flex"
          >
            <Command className="h-4 w-4" />
            <span>Search</span>
          </button>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--danger)]" />
          </button>
          <button
            type="button"
            className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)] sm:inline-flex"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </button>
        </div>
      </div>
    </header>
  );
}
