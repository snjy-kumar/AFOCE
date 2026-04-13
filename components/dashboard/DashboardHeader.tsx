"use client";

import { usePathname } from "next/navigation";
import { Bell, Command, Plus } from "lucide-react";

const pathTitles: Record<string, string> = {
  "/dashboard": "Command Center",
  "/dashboard/invoices": "Smart Invoicing",
  "/dashboard/expenses": "Expense Policy Engine",
  "/dashboard/reconciliation": "Bank Reconciliation",
  "/dashboard/reports": "Reports & VAT",
  "/dashboard/queues": "Action Queues",
  "/dashboard/settings": "Workspace Settings",
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const title = pathTitles[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 px-4 py-4 sm:px-6 xl:px-10">
      <div className="dashboard-panel mx-auto flex max-w-[1500px] items-center justify-between gap-4 rounded-[1.5rem] border px-5 py-3.5">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--ink-soft)]">
            FY 2081/82
          </div>
          <div className="mt-1 truncate text-sm font-semibold tracking-[-0.03em] text-[var(--ink)]">
            {title} | Baisakh close in progress
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-elevated)] lg:inline-flex"
          >
            <Command className="h-4 w-4 text-[var(--brand)]" />
            Search
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--ink)]"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            <Plus className="h-4 w-4" />
            Quick add
          </button>
        </div>
      </div>
    </header>
  );
}
