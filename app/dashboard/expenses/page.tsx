"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, FileWarning, XCircle } from "lucide-react";

import { expensePolicies } from "@/lib/mock-data";
import {
  getExpenses,
  updateExpenseStatus,
  type ExpenseRecord,
  type ExpenseStatus,
} from "@/lib/services/mock-finance-service";

export default function ExpensesPage() {
  const [items, setItems] = useState<ExpenseRecord[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getExpenses().then((records) => {
      if (active) {
        setItems(records);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setStatus = async (id: string, status: ExpenseStatus) => {
    setBusy(id);
    const next = await updateExpenseStatus(id, status);
    setItems(next);
    setBusy(null);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <aside className="space-y-4">
        <div className="dashboard-panel-dark rounded-[1.6rem] p-6 text-white">
          <div className="eyebrow text-white/75 before:bg-white/30">Policy Engine</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
            Approval flow with enforceable expense controls.
          </h1>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Actions below are fully interactive in demo mode and run through the mock service
            state layer.
          </p>
        </div>

        <div className="dashboard-panel rounded-[1.6rem] p-6">
          <div className="text-sm font-semibold text-[var(--ink)]">Active policies</div>
          <div className="mt-4 space-y-3">
            {expensePolicies.map((policy) => (
              <div key={policy.title} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <div className="text-sm font-semibold text-[var(--ink)]">{policy.title}</div>
                <div className="mt-1 text-xs leading-6 text-[var(--ink-soft)]">{policy.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="dashboard-panel rounded-[1.6rem] p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[var(--ink)]">Approval queue</div>
          <button className="rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]">
            Log expense
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((expense) => {
            const blocked = expense.status === "Blocked";
            const approving = busy === expense.id;
            return (
              <div key={expense.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[var(--ink-soft)]">
                      {expense.id} | {expense.bsDate} BS
                    </div>
                    <div className="mt-1 text-lg font-semibold text-[var(--ink)]">
                      {expense.employee} | {expense.category}
                    </div>
                    <div className="mt-1 text-xs text-[var(--ink-soft)]">{expense.policy}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold tracking-[-0.03em] text-[var(--ink)]">{expense.amount}</div>
                    <div className="text-xs text-[var(--ink-soft)]">{expense.receipt}</div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--ink)]">
                    {blocked ? (
                      <FileWarning className="h-4 w-4 text-[var(--danger)]" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-[var(--accent)]" />
                    )}
                    {expense.status}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={approving}
                      onClick={() => setStatus(expense.id, "Approved")}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--panel-strong)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      disabled={approving}
                      onClick={() => setStatus(expense.id, blocked ? "Rejected" : "Blocked")}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] disabled:opacity-60"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {blocked ? "Reject" : "Block"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
