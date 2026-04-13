"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  CreditCard,
  FileText,
  Gauge,
  Landmark,
  ListTodo,
  Search,
  Settings2,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Logo from "@/components/brand/Logo";
import { dashboardNav } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  "/dashboard": Gauge,
  "/dashboard/invoices": FileText,
  "/dashboard/expenses": CreditCard,
  "/dashboard/reconciliation": WalletCards,
  "/dashboard/reports": Landmark,
  "/dashboard/queues": ListTodo,
  "/dashboard/settings": Settings2,
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="icon-rail fixed inset-y-4 left-4 z-40 hidden w-[88px] rounded-[2rem] text-white xl:flex xl:flex-col">
      <div className="border-b border-white/10 px-4 py-5">
        <Logo href="/dashboard" muted compact />
      </div>

      <div className="px-3 pt-4">
        <button
          type="button"
          title="Search"
          className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white/80 transition hover:bg-white/12"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-4">
        {dashboardNav.map((item) => {
          const active = pathname === item.href;
          const Icon = iconMap[item.href] ?? Gauge;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={cn(
                "relative flex h-12 items-center justify-center rounded-2xl border transition",
                active
                  ? "border-white bg-white text-[var(--panel-strong)] shadow-[0_8px_24px_rgba(255,255,255,0.18)]"
                  : "border-white/10 bg-white/6 text-white/75 hover:bg-white/12",
              )}
            >
              {active ? (
                <span className="absolute -right-1 h-6 w-1 rounded-full bg-[var(--accent)]" />
              ) : null}
              <Icon className={cn("h-6 w-6", active ? "text-[var(--brand-dark)]" : "text-white/80")} />
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(175,122,39,0.2)] text-xs font-semibold text-[var(--accent)]">
            SM
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center text-white/65">
          <ChartNoAxesCombined className="h-4 w-4" />
        </div>
      </div>
    </aside>
  );
}
