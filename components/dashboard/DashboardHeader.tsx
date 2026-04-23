"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
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
import { adToBsDateWithDay, getCurrentBsYear, getCurrentBsMonth } from "@/lib/utils/date";
import { InvoiceModal } from "@/components/modals/InvoiceModal";
import { ExpenseModal } from "@/components/modals/ExpenseModal";
import { ClientModal } from "@/components/modals/ClientModal";
import { PolicyModal } from "@/components/modals/PolicyModal";

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

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface SearchRouteItem {
  label: string;
  path: string;
  keywords: string[];
}

interface SearchContentItem {
  id: string;
  type: "invoice" | "expense" | "client" | "policy";
  label: string;
  sublabel: string;
  path: string;
}

type HeaderPanel = "profile" | "notifications" | "export" | "quick-add" | null;
type ExportEntity = "invoices" | "expenses" | "clients" | "bank_lines";
type ExportFormat = "csv" | "pdf" | "xlsx";
type QuickAddType = "invoice" | "expense" | "client" | "policy" | null;

const EXPORT_ENTITIES: Array<{ value: ExportEntity; label: string }> = [
  { value: "invoices", label: "Invoices" },
  { value: "expenses", label: "Expenses" },
  { value: "clients", label: "Clients" },
  { value: "bank_lines", label: "Bank Lines" },
];

const EXPORT_FORMATS: Array<{ value: ExportFormat; label: string }> = [
  { value: "csv", label: "CSV" },
  { value: "pdf", label: "PDF" },
  { value: "xlsx", label: "Excel (.xlsx)" },
];

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "demo-1",
    title: "Invoice approved",
    message: "Invoice INV-2081-014 marked as paid.",
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    title: "Expense needs review",
    message: "Travel expense NPR 62,000 moved to manager review.",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "demo-3",
    title: "Daily sync complete",
    message: "Bank lines imported and reconciled.",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

const SEARCH_ROUTES: SearchRouteItem[] = [
  { label: "Dashboard Home", path: "/dashboard", keywords: ["home", "overview", "command center"] },
  { label: "Invoices", path: "/dashboard/invoices", keywords: ["billing", "invoice"] },
  { label: "Expenses", path: "/dashboard/expenses", keywords: ["spend", "cost", "claims"] },
  { label: "Reconciliation", path: "/dashboard/reconciliation", keywords: ["bank", "matching", "lines"] },
  { label: "Reports", path: "/dashboard/reports", keywords: ["vat", "audit", "summary"] },
  { label: "Approvals", path: "/dashboard/queues", keywords: ["queue", "pending"] },
  { label: "Clients & Vendors", path: "/dashboard/clients", keywords: ["contacts", "vendors", "customers"] },
  { label: "Team Members", path: "/dashboard/team", keywords: ["users", "members"] },
  { label: "Policy Rules", path: "/dashboard/policies", keywords: ["rules", "compliance"] },
  { label: "Analytics", path: "/dashboard/analytics", keywords: ["metrics", "charts"] },
  { label: "Settings", path: "/dashboard/settings", keywords: ["config", "preferences"] },
  { label: "Profile Settings", path: "/dashboard/settings/profile", keywords: ["profile", "account"] },
  { label: "Security Settings", path: "/dashboard/settings/security", keywords: ["security", "password", "access"] },
];

export default function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const title = pathTitles[pathname] ?? "Dashboard";
  const currentBsYear = getCurrentBsYear();
  const currentBsMonth = getCurrentBsMonth();
  const [user, setUser] = useState<UserData | null>(null);
  const [openPanel, setOpenPanel] = useState<HeaderPanel>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportEntity, setExportEntity] = useState<ExportEntity>("invoices");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [quickAddType, setQuickAddType] = useState<QuickAddType>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchContentResults, setSearchContentResults] = useState<SearchContentItem[]>([]);
  const [searchingContent, setSearchingContent] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const isDemo =
    typeof window !== "undefined" &&
    localStorage.getItem("demo_session") === "true";

  const refreshAfterCreate = useCallback(() => {
    setQuickAddType(null);
    router.refresh();
  }, [router]);

  const loadUnreadCount = useCallback(async () => {
    if (isDemo) {
      setUnreadCount(DEMO_NOTIFICATIONS.filter((item) => !item.read).length);
      return;
    }

    const res = await fetch("/api/notifications?unread=true", { cache: "no-store" });
    if (!res.ok) return;

    const json = await res.json();
    setUnreadCount(json.data?.count || 0);
  }, [isDemo]);

  const loadNotifications = useCallback(async () => {
    if (isDemo) {
      setNotifications(DEMO_NOTIFICATIONS);
      return;
    }

    setLoadingNotifications(true);
    const res = await fetch("/api/notifications?page=1&pageSize=6", { cache: "no-store" });
    const json = await res.json();
    setLoadingNotifications(false);

    if (json.error) return;

    const rows = (json.data?.notifications || []) as Array<{
      id: string;
      title: string;
      message: string;
      read?: boolean;
      created_at: string;
    }>;

    setNotifications(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        read: row.read ?? false,
        created_at: row.created_at,
      })),
    );
  }, [isDemo]);

  const markNotificationRead = useCallback(
    async (notificationId: string) => {
      if (isDemo) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notificationId
              ? {
                  ...item,
                  read: true,
                }
              : item,
          ),
        );
        setUnreadCount((current) => Math.max(0, current - 1));
        return;
      }

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                read: true,
              }
            : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    },
    [isDemo],
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (!isDemo) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    }

    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
  }, [isDemo]);

  const filteredSearchRoutes = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return SEARCH_ROUTES.filter((item) => {
      const inLabel = item.label.toLowerCase().includes(normalized);
      const inKeywords = item.keywords.some((keyword) => keyword.toLowerCase().includes(normalized));
      return inLabel || inKeywords;
    });
  }, [searchQuery]);

  const searchContent = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchContentResults([]);
      return;
    }

    setSearchingContent(true);
    try {
      const params = new URLSearchParams({ search: query.trim() });
      const res = await fetch(`/api/search?${params.toString()}`);
      const json = await res.json();

      if (json.error) {
        setSearchContentResults([]);
        return;
      }

      const results: SearchContentItem[] = (json.data?.results || []).map((item: {
        id: string;
        type: "invoice" | "expense" | "client" | "policy";
        label: string;
        sublabel: string;
        path: string;
      }) => ({
        id: item.id,
        type: item.type,
        label: item.label,
        sublabel: item.sublabel,
        path: item.path,
      }));

      setSearchContentResults(results);
    } catch {
      setSearchContentResults([]);
    } finally {
      setSearchingContent(false);
    }
  }, []);

  const goToSearchResult = useCallback(
    (path: string) => {
      setSearchExpanded(false);
      setSearchQuery("");
      router.push(path);
    },
    [router],
  );

  const exportData = useCallback(async () => {
    setExporting(true);

    try {
      const params = new URLSearchParams({
        entity: exportEntity,
        format: exportFormat,
      });
      const res = await fetch(`/api/export?${params.toString()}`);

      if (!res.ok) {
        setExporting(false);
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const fallback = `${exportEntity}_export.${exportFormat}`;
      const filename = match?.[1] || fallback;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setOpenPanel(null);
    } finally {
      setExporting(false);
    }
  }, [exportEntity, exportFormat]);

  const togglePanel = useCallback((panel: Exclude<HeaderPanel, null>) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  }, []);

  useEffect(() => {
    if (isDemo) {
      setUser({
        user: { id: "demo", email: "demo@afoce.com" },
        full_name: "Demo User",
        avatar_url: null,
      });
      void loadUnreadCount();
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
    void loadUnreadCount();
  }, [supabase, isDemo, loadUnreadCount]);

  useEffect(() => {
    if (openPanel === "notifications") {
      void loadNotifications();
    }
  }, [openPanel, loadNotifications]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPanel(null);
        setSearchExpanded(false);
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!searchExpanded) return;
    searchInputRef.current?.focus();
  }, [searchExpanded]);

  useEffect(() => {
    const outsideClickHandler = (event: MouseEvent) => {
      if (!searchContainerRef.current) return;
      if (searchContainerRef.current.contains(event.target as Node)) return;
      setSearchExpanded(false);
      setSearchQuery("");
    };

    window.addEventListener("mousedown", outsideClickHandler);
    return () => window.removeEventListener("mousedown", outsideClickHandler);
  }, []);

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
              FY {currentBsYear}/{String(currentBsYear + 1).slice(-2)}
            </span>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">
            {currentBsMonth} close in progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div ref={searchContainerRef} className="relative hidden md:block">
            {!searchExpanded ? (
              <button
                type="button"
                onClick={() => setSearchExpanded(true)}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
              >
                <Command className="h-4 w-4" />
                Search
              </button>
            ) : (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-50 w-80">
                <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-sm transition">
                  <Command className="h-4 w-4 text-[var(--ink-soft)]" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      searchContent(event.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                      }
                    }}
                    placeholder="Search pages, invoices, clients..."
                    className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)]"
                  />
                </div>

                {(searchQuery.trim() || searchContentResults.length > 0) && (
                  <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-[var(--border)] bg-white shadow-lg">
                    {filteredSearchRoutes.length > 0 && (
                      <div className="border-b border-[var(--border)]">
                        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                          Pages
                        </p>
                        {filteredSearchRoutes.slice(0, 4).map((item) => (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() => goToSearchResult(item.path)}
                            className="block w-full px-3 py-2 text-left text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg)]"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <div>
                      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                        Content
                      </p>
                      {searchingContent ? (
                        <p className="px-3 py-2 text-xs text-[var(--ink-soft)]">Searching...</p>
                      ) : searchContentResults.length === 0 && !searchQuery.trim() ? (
                        <p className="px-3 py-2 text-xs text-[var(--ink-soft)]">Type to search invoices, expenses, clients...</p>
                      ) : searchContentResults.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-[var(--ink-soft)]">No results found</p>
                      ) : (
                        searchContentResults.slice(0, 6).map((item) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            type="button"
                            onClick={() => goToSearchResult(item.path)}
                            className="block w-full px-3 py-2 text-left text-sm transition hover:bg-[var(--bg)]"
                          >
                            <span className="font-medium text-[var(--ink)]">{item.label}</span>
                            <span className="text-[var(--ink-soft)]"> — {item.sublabel}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => togglePanel("notifications")}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--danger)]" />
                <span className="absolute -right-1 -top-1 rounded-full bg-[var(--danger)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {Math.min(unreadCount, 9)}
                </span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => togglePanel("export")}
            className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)] sm:inline-flex"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={() => togglePanel("quick-add")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Add</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Avatar + Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => togglePanel("profile")}
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

            {openPanel === "profile" && (
              <>
                {/* Backdrop to close menu on outside click */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenPanel(null)}
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
                    onClick={() => setOpenPanel(null)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--ink-soft)] transition hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                  >
                    <User className="h-4 w-4 shrink-0" />
                    Profile Settings
                  </Link>
                  <Link
                    href="/dashboard/settings/security"
                    onClick={() => setOpenPanel(null)}
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

            {openPanel === "notifications" && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenPanel(null)} />
                <div className="absolute right-0 top-12 z-50 w-[360px] rounded-xl border border-[var(--border)] bg-white shadow-lg">
                  <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">Notifications</p>
                      <p className="text-xs text-[var(--ink-soft)]">{unreadCount} unread</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-xs font-medium text-[var(--brand)] transition hover:opacity-80"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <p className="px-4 py-4 text-sm text-[var(--ink-soft)]">Loading...</p>
                    ) : notifications.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-[var(--ink-soft)]">No notifications yet.</p>
                    ) : (
                      <>
                        {notifications.slice(0, 5).map((item) => (
                          <div key={item.id} className="border-b border-[var(--border)] px-4 py-3 last:border-b-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[var(--ink)]">{item.title}</p>
                                <p className="mt-1 text-xs text-[var(--ink-soft)]">{item.message}</p>
                                <p className="mt-1 text-[11px] text-[var(--ink-soft)]">
                                  {adToBsDateWithDay(new Date(item.created_at))}
                                </p>
                              </div>
                              {!item.read && (
                                <button
                                  type="button"
                                  onClick={() => void markNotificationRead(item.id)}
                                  className="shrink-0 rounded-lg border border-[var(--border)] px-2 py-1 text-xs text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {notifications.length > 5 && (
                          <Link
                            href="/dashboard/notifications"
                            onClick={() => setOpenPanel(null)}
                            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-[var(--brand)] transition hover:opacity-80"
                          >
                            See all {notifications.length} notifications
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {openPanel === "export" && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenPanel(null)} />
                <div className="absolute right-0 top-12 z-50 w-[320px] rounded-xl border border-[var(--border)] bg-white p-4 shadow-lg">
                  <p className="text-sm font-semibold text-[var(--ink)]">Export Data</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">Download current data in your preferred format.</p>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Entity</label>
                      <select
                        value={exportEntity}
                        onChange={(event) => setExportEntity(event.target.value as ExportEntity)}
                        className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                      >
                        {EXPORT_ENTITIES.map((entity) => (
                          <option key={entity.value} value={entity.value}>
                            {entity.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Format</label>
                      <select
                        value={exportFormat}
                        onChange={(event) => setExportFormat(event.target.value as ExportFormat)}
                        className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                      >
                        {EXPORT_FORMATS.map((format) => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={exporting}
                    onClick={() => void exportData()}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {exporting ? "Exporting..." : "Download"}
                  </button>
                </div>
              </>
            )}

            {openPanel === "quick-add" && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenPanel(null)} />
                <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-[var(--border)] bg-white py-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenPanel(null);
                      setQuickAddType("invoice");
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-[var(--ink-soft)] transition hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                  >
                    New Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenPanel(null);
                      setQuickAddType("expense");
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-[var(--ink-soft)] transition hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                  >
                    New Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenPanel(null);
                      setQuickAddType("client");
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-[var(--ink-soft)] transition hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                  >
                    New Client/Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenPanel(null);
                      setQuickAddType("policy");
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-[var(--ink-soft)] transition hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                  >
                    New Policy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {quickAddType === "invoice" && (
        <InvoiceModal onClose={() => setQuickAddType(null)} onCreated={refreshAfterCreate} />
      )}
      {quickAddType === "expense" && (
        <ExpenseModal onClose={() => setQuickAddType(null)} onCreated={refreshAfterCreate} />
      )}
      {quickAddType === "client" && (
        <ClientModal onClose={() => setQuickAddType(null)} onCreated={refreshAfterCreate} />
      )}
      {quickAddType === "policy" && (
        <PolicyModal onClose={() => setQuickAddType(null)} onCreated={refreshAfterCreate} />
      )}
    </header>
  );
}
