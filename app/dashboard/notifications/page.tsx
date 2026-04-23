"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { adToBsDateWithDay } from "@/lib/utils/date";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const isDemo =
    typeof window !== "undefined" &&
    localStorage.getItem("demo_session") === "true";

  useEffect(() => {
    async function load() {
      if (isDemo) {
        setNotifications([
          { id: "1", title: "Invoice approved", message: "Invoice marked as paid", read: false, created_at: new Date().toISOString() },
          { id: "2", title: "Expense needs review", message: "Moved to manager review", read: false, created_at: new Date().toISOString() },
          { id: "3", title: "Daily sync complete", message: "Bank lines imported", read: true, created_at: new Date().toISOString() },
        ]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const res = await fetch("/api/notifications?page=1&pageSize=50");
      const json = await res.json();
      setLoading(false);

      if (json.error) return;
      setNotifications(json.data?.notifications || []);
    }
    load();
  }, [isDemo]);

  const markRead = async (id: string) => {
    if (isDemo) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      return;
    }

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    if (!isDemo) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readNotifications = notifications.filter((n) => n.read);
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Notifications</h1>
          <p className="text-sm text-[var(--ink-soft)]">
            {unreadCount} unread
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-[var(--brand)] hover:opacity-80"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-[var(--ink-soft)]">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="py-12 text-center text-[var(--ink-soft)]">No notifications yet.</div>
      ) : (
        <>
          {unreadNotifications.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-medium text-[var(--ink-soft)]">Unread</h2>
              <div className="space-y-2">
                {unreadNotifications.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-white p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10">
                      <Bell className="h-5 w-5 text-[var(--brand)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--ink)]">{item.title}</p>
                      <p className="text-sm text-[var(--ink-soft)]">{item.message}</p>
                      <p className="mt-1 text-xs text-[var(--ink-soft)]">
                        {adToBsDateWithDay(new Date(item.created_at))}
                      </p>
                    </div>
                    <button
                      onClick={() => markRead(item.id)}
                      className="shrink-0 rounded-lg border border-[var(--border)] p-2 text-[var(--ink-soft)] transition hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {readNotifications.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-[var(--ink-soft)]">Earlier</h2>
              <div className="space-y-2">
                {readNotifications.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 opacity-70"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ink-soft)]/10">
                      <Bell className="h-5 w-5 text-[var(--ink-soft)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--ink)]">{item.title}</p>
                      <p className="text-sm text-[var(--ink-soft)]">{item.message}</p>
                      <p className="mt-1 text-xs text-[var(--ink-soft)]">
                        {adToBsDateWithDay(new Date(item.created_at))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}