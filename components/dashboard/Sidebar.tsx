"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Gauge,
  HelpCircle,
  Landmark,
  ListTodo,
  Building2,
  PieChart,
  Bell,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Logo from "@/components/brand/Logo";
import { createClient } from "@/utils/supabase/client";

const mainNavItems: Array<{
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
}> = [
  {
    href: "/dashboard",
    label: "Command Center",
    short: "Overview",
    icon: Gauge,
  },
  {
    href: "/dashboard/invoices",
    label: "Smart Invoicing",
    short: "Invoices",
    icon: FileText,
  },
  {
    href: "/dashboard/expenses",
    label: "Policy Engine",
    short: "Expenses",
    icon: CreditCard,
  },
  {
    href: "/dashboard/reconciliation",
    label: "Bank Reconciliation",
    short: "Bank",
    icon: WalletCards,
  },
  {
    href: "/dashboard/reports",
    label: "Reports & VAT",
    short: "Reports",
    icon: Landmark,
  },
  {
    href: "/dashboard/queues",
    label: "Approvals Queue",
    short: "Queues",
    icon: ListTodo,
  },
];

const secondaryNavItems: Array<{
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
}> = [
  {
    href: "/dashboard/clients",
    label: "Clients & Vendors",
    short: "Clients",
    icon: Building2,
  },
  {
    href: "/dashboard/team",
    label: "Team Members",
    short: "Team",
    icon: Users,
  },
  {
    href: "/dashboard/policies",
    label: "Policy Rules",
    short: "Policies",
    icon: ShieldCheck,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    short: "Analytics",
    icon: PieChart,
  },
  {
    href: "/dashboard/settings",
    label: "Workspace Settings",
    short: "Settings",
    icon: Settings2,
  },
];

const roleLabels: Record<string, string> = {
  finance_admin: "Finance Admin",
  manager: "Manager",
  team_member: "Team Member",
};

const STORAGE_KEY = "afoce-sidebar-collapsed";

interface UserProfile {
  full_name?: string | null;
  email?: string;
  role?: string;
  avatar_url?: string | null;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCollapsed(stored === "true");
    }
  }, []);

  useEffect(() => {
    const isDemo =
      typeof window !== "undefined" &&
      localStorage.getItem("demo_session") === "true";

    if (isDemo) {
      setUserProfile({
        full_name: "Demo User",
        email: "demo@afoce.com",
        role: "finance_admin",
        avatar_url: null,
      });
      return;
    }

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, role, avatar_url")
        .eq("id", user.id)
        .single();
      setUserProfile({
        full_name: data?.full_name ?? null,
        email: user.email,
        role: data?.role ?? undefined,
        avatar_url: data?.avatar_url ?? null,
      });
    }
    loadUser();
  }, [supabase]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    document.documentElement.classList.toggle("sidebar-collapsed", next);
  };

  const displayName =
    userProfile?.full_name || userProfile?.email?.split("@")[0] || "User";

  const displayRole = roleLabels[userProfile?.role ?? ""] || "Team Member";

  const initials = (userProfile?.full_name || userProfile?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--border)] bg-[var(--panel)] transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo href="/dashboard" compact asChild />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[var(--ink)]">
                AFOCE
              </span>
              <span className="text-[10px] text-[var(--ink-soft)]">
                Finance Suite
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="shrink-0 border-b border-[var(--border)] p-3">
        <button
          type="button"
          title="Search"
          className={clsx(
            "flex h-10 w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--ink-soft)] transition hover:border-[var(--brand)]",
            collapsed && "justify-center px-0",
          )}
        >
          <Search className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Search...</span>}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className={clsx("mb-2", collapsed && "hidden")}>
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
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[var(--panel-strong)] text-white"
                    : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.short}</span>}
              </Link>
            );
          })}
        </div>

        <div className={clsx("mt-6 mb-2", collapsed && "hidden")}>
          <span className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            Management
          </span>
        </div>
        <div className="space-y-1">
          {secondaryNavItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[var(--panel-strong)] text-white"
                    : "text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.short}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-[var(--border)] p-3">
        <div
          className={clsx(
            "mb-3 grid gap-2",
            collapsed ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          <button
            type="button"
            title="Notifications"
            className={clsx(
              "flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--ink)] transition hover:bg-[var(--bg)]",
              !collapsed && "gap-2 px-3",
            )}
          >
            <Bell className="h-4 w-4" />
            {!collapsed && <span className="text-xs font-semibold">3</span>}
          </button>
          <button
            type="button"
            title="Help"
            className={clsx(
              "flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--ink)] transition hover:bg-[var(--bg)]",
              collapsed && "hidden",
            )}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/settings/profile"
            title="Profile settings"
            className={clsx(
              "flex min-w-0 flex-1 items-center gap-2 rounded-xl p-1 transition hover:bg-white",
              collapsed && "justify-center",
            )}
          >
            {/* Avatar */}
            <div
              className={clsx(
                "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--brand)] text-sm font-bold text-white transition hover:bg-[var(--brand-dark)]",
                collapsed && "h-10 w-full rounded-xl",
              )}
            >
              {userProfile?.avatar_url ? (
                <Image
                  src={userProfile.avatar_url}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Name + role */}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[var(--ink)]">
                  {displayName}
                </div>
                <div className="truncate text-xs text-[var(--ink-soft)]">
                  {displayRole}
                </div>
              </div>
            )}
          </Link>

          {/* Collapse toggle — always visible */}
          <button
            type="button"
            onClick={toggle}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--ink-soft)] transition hover:bg-[var(--bg)] hover:text-[var(--ink)]"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
