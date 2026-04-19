"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getCurrentBsDate } from "@/lib/utils/date";

interface Props {
  onClose: () => void;
  onCreated: (expense: unknown) => void;
}

const CATEGORIES = [
  "Travel", "Meals & Entertainment", "Office Supplies", "Software & Subscriptions",
  "Utilities", "Rent", "Equipment", "Professional Services", "Marketing", "Other",
];

export function ExpenseModal({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    employee: "",
    category: CATEGORIES[0],
    amount: "",
    bs_date: getCurrentBsDate(),
    receipt_url: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employee || !form.amount) return;

    setLoading(true);
    setError(null);

    const bsDateStr = form.bs_date;
    const [month, year] = bsDateStr.split(" ");
    const monthIdx = ["Baisakh","Jestha","Ashadh","Shrawan","Bhadra","Ashwin","Kartik","Mangsir","Poush","Magh","Falgun","Chaitra"].indexOf(month);
    const bsYear = parseInt(year);
    const BS_2081_START = new Date("2024-04-14");
    const BS_2081_MONTH_DAYS = [30,31,32,31,31,30,30,29,30,29,30,30];
    const BS_2082_MONTH_DAYS = [30,31,32,31,32,30,30,30,29,30,29,30];
    let totalDays = 0;
    for (let y = 2081; y < bsYear; y++) totalDays += y % 4 === 0 ? 366 : 365;
    const monthDays = bsYear === 2081 ? BS_2081_MONTH_DAYS : BS_2082_MONTH_DAYS;
    for (let m = 0; m < monthIdx; m++) totalDays += monthDays[m];
    const adDate = new Date(BS_2081_START);
    adDate.setDate(adDate.getDate() + totalDays);
    const ad_date = adDate.toISOString().split("T")[0];

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee: form.employee,
        category: form.category,
        amount: parseFloat(form.amount),
        bs_date: form.bs_date,
        ad_date,
        receipt_url: form.receipt_url || null,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (json.error) {
      setError(json.error.message);
      return;
    }

    onCreated(json.data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold text-[var(--ink)]">Log Expense</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Record a new business expense for approval</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Employee Name</label>
            <input
              value={form.employee}
              onChange={(e) => setForm({ ...form, employee: e.target.value })}
              placeholder="Ram Prasad"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Amount (NPR)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="5000"
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">BS Date</label>
              <input
                value={form.bs_date}
                onChange={(e) => setForm({ ...form, bs_date: e.target.value })}
                placeholder="Baisakh 2081"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Receipt URL (optional)</label>
            <input
              value={form.receipt_url}
              onChange={(e) => setForm({ ...form, receipt_url: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
            />
          </div>

          {form.amount && parseFloat(form.amount) > 50000 && (
            <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-xs text-[var(--accent)]">
              Expenses over NPR 50,000 require manager review before approval.
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f] disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Log Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
