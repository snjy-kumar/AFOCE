"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Command,
  Download,
  Plus,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

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
  "/dashboard/settings/profile": "Profile Settings",
  "/dashboard/settings/security": "Security Settings",
};

interface UserData {
  email?: string;
  user?: { id: string; email: string };
  full_name?: string | null;
  avatar_url?: string | null;
}

export default function DashboardHeader() {
  const pathname = usePathname();
  const title = pathTitles[pathname] ?? "Dashboard";
  const [user, setUser] = useState<UserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  const isDemo =
    typeof window !== "undefined" &&
    localStorage.getItem("demo_session") === "true";

  useEffect(() => {
    if (isDemo) {
      setUser({
        user: { id: "demo", email: "demo@afoce.com" },
        full_name: "Demo User",
        avatar_url: null,
      });
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;

      const authUser = { id: data.user.id, email: data.user.email || "" };
      setUser({ user: authUser });

      // Load profile data for display name and avatar
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          setUser({
            user: authUser,
            full_name: profile?.full_name ?? null,
            avatar_url: profile?.avatar_url ?? null,
          });
        });
    });
  }, [supabase, isDemo]);

  async function handleLogout() {
    if (isDemo) {
      localStorage.removeItem("demo_session");
      localStorage.removeItem("demo_data");
      document.cookie = "demo_user=; path=/; max-age=0";
    } else {
      await supabase.auth.signOut();
    }
    window.location.href = "/login";
  }

  const displayName =
    user?.full_name || user?.user?.email?.split("@")[0] || "User";

  const initials = (user?.full_name || user?.user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
          <p className="text-sm text-[var(--ink-soft)]">
            Baisakh close in progress
          </p>
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

          {/* Avatar + Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--brand)] text-white transition hover:opacity-90"
            >
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <span className="text-sm font-bold">{initials}</span>
              )}
            </button>

            {menuOpen && (
              <>
                {/* Backdrop to close menu on outside click */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[var(--border)] bg-white py-2 shadow-lg">
                  {/* User info */}
                  <div className="border-b border-[var(--border)] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--brand)] text-white">
                        {user?.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={displayName}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        ) : (
                          <span className="text-xs font-bold">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--ink)]">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-[var(--ink-soft)]">
                          {user?.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation links */}
                  <Link
                    href="/dashboard/settings/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--ink-soft)] transition hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                  >
                    <User className="h-4 w-4 shrink-0" />
                    Profile Settings
                  </Link>
                  <Link
                    href="/dashboard/settings/security"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--ink-soft)] transition hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                  >
                    <Shield className="h-4 w-4 shrink-0" />
                    Security Settings
                  </Link>

                  {/* Sign out */}
                  <div className="mt-1 border-t border-[var(--border)] pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--ink-soft)] transition hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
