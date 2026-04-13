"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Gauge,
  HelpCircle,
  Landmark,
  ListTodo,
  LogOut,
  MessageSquare,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  WalletCards,
  Building2,
  PieChart,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Logo from "@/components/brand/Logo";
import { dashboardNav } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const mainNavItems: Array<{ href: string; label: string; short: string; icon: LucideIcon }> = [
  { href: "/dashboard", label: "Command Center", short: "Overview", icon: Gauge },
  { href: "/dashboard/invoices", label: "Smart Invoicing", short: "Invoices", icon: FileText },
  { href: "/dashboard/expenses", label: "Policy Engine", short: "Expenses", icon: CreditCard },
  { href: "/dashboard/reconciliation", label: "Bank Reconciliation", short: "Bank", icon: WalletCards },
  { href: "/dashboard/reports", label: "Reports & VAT", short: "Reports", icon: Landmark },
  { href: "/dashboard/queues", label: "Approvals Queue", short: "Queues", icon: ListTodo },
];

const secondaryNavItems: Array<{ href: string; label: string; short: string; icon: LucideIcon }> = [
  { href: "/dashboard/clients", label: "Clients & Vendors", short: "Clients", icon: Building2 },
  { href: "/dashboard/team", label: "Team Members", short: "Team", icon: Users },
  { href: "/dashboard/policies", label: "Policy Rules", short: "Policies", icon: ShieldCheck },
  { href: "/dashboard/analytics", label: "Analytics", short: "Analytics", icon: PieChart },
  { href: "/dashboard/settings", label: "Workspace Settings", short: "Settings", icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--border)] bg-[var(--panel)] transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo href="/dashboard" compact />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[var(--ink)]">AFOCE</span>
              <span className="text-[10px] text-[var(--ink-soft)]">Finance Suite</span>
            </div>
          )}
        </Link>
      </div>

      {/* Search */}
      <div className="shrink-0 border-b border-[var(--border)] p-3">
        <button
          type="button"
          title="Search"
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--ink-soft)] transition hover:border-[var(--brand)]",
            collapsed && "justify-center px-0"
          )}
        >
          <Search className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Search...</span>}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className={cn("mb-2", collapsed && "hidden")}>
          <span className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            Main
          </span>
        </div>
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[var(--panel-strong)] text-white"
                    : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.short}</span>}
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className={cn("mt-6 mb-2", collapsed && "hidden")}>
          <span className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            Management
          </span>
        </div>
        <div className="space-y-1">
          {secondaryNavItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[var(--panel-strong)] text-white"
                    : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.short}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="shrink-0 border-t border-[var(--border)] p-3">
        {/* Quick Actions */}
        <div className={cn("mb-3 grid gap-2", collapsed ? "grid-cols-1" : "grid-cols-2")}>
          <button
            type="button"
            title="Notifications"
            className={cn(
              "flex h-10 items-center justify-center rounded-xl border border-[#d4cbbf] bg-white text-[#0f2037] transition hover:bg-[#f4ede1]",
              !collapsed && "gap-2 px-3"
            )}
          >
            <Bell className="h-4 w-4" />
            {!collapsed && <span className="text-xs font-semibold">3</span>}
          </button>
          <button
            type="button"
            title="Help"
            className={cn(
              "flex h-10 items-center justify-center rounded-xl border border-[#d4cbbf] bg-white text-[#0f2037] transition hover:bg-[#f4ede1]",
              collapsed && "hidden"
            )}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>

        {/* User & Toggle */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#2248a7] text-sm font-bold text-white transition hover:bg-[#1b3985]",
              collapsed && "w-full"
            )}
          >
            SM
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[var(--ink)]">Sanjay Malla</div>
              <div className="truncate text-xs text-[var(--ink-soft)]">Finance Admin</div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
