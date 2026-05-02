"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getCurrentBsDate } from "@/lib/utils/date";
import type { InvoiceRecord } from "@/lib/types";

interface Client {
  id: string;
  name: string;
  pan: string;
}

interface Props {
  onClose: () => void;
  onCreated: (invoice: unknown) => void;
  initialData?: InvoiceRecord;
}

export function InvoiceModal({ onClose, onCreated, initialData }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_id: initialData?.client_id || "",
    bs_date: initialData?.bs_date || getCurrentBsDate(),
    amount: initialData?.amount?.toString() || "",
    due_days: initialData?.due_days?.toString() || "30",
  });

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((json) => setClients(json.data?.data || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id || !form.amount) return;

    setLoading(true);
    setError(null);

    // Convert BS date to AD for storage
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

    const url = initialData ? `/api/invoices/${initialData.id}` : "/api/invoices";
    const method = initialData ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: form.client_id,
        bs_date: form.bs_date,
        ad_date,
        amount: parseFloat(form.amount),
        due_days: parseInt(form.due_days),
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

        <h2 className="text-lg font-semibold text-[var(--ink)]">{initialData ? "Edit Invoice" : "Create Invoice"}</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{initialData ? "Update invoice details" : "Issue a new VAT invoice to a client"}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Client</label>
            <select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              disabled={!!initialData}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] disabled:opacity-50"
              required
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} (PAN: {c.pan})</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Amount (NPR)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="10000"
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Due Days</label>
            <select
              value={form.due_days}
              onChange={(e) => setForm({ ...form, due_days: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
            >
              <option value="15">15 days</option>
              <option value="30">30 days</option>
              <option value="45">45 days</option>
              <option value="60">60 days</option>
            </select>
          </div>

          {form.amount && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--ink-soft)]">Subtotal</span>
                <span className="font-medium text-[var(--ink)]">NPR {parseFloat(form.amount || "0").toLocaleString()}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-[var(--ink-soft)]">VAT (13%)</span>
                <span className="font-medium text-[var(--ink)]">NPR {Math.round(parseFloat(form.amount || "0") * 0.13).toLocaleString()}</span>
              </div>
              <div className="mt-2 flex justify-between font-semibold">
                <span className="text-[var(--ink)]">Total</span>
                <span className="text-[var(--ink)]">NPR {Math.round(parseFloat(form.amount || "0") * 1.13).toLocaleString()}</span>
              </div>
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
              {loading ? (initialData ? "Updating..." : "Creating...") : initialData ? "Update Invoice" : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
