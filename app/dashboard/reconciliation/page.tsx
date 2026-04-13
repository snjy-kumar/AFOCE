"use client";

import { useEffect, useState } from "react";

import {
  getBankLines,
  markBankLine,
  type BankLineRecord,
} from "@/lib/services/mock-finance-service";

export default function ReconciliationPage() {
  const [lines, setLines] = useState<BankLineRecord[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getBankLines().then((records) => {
      if (active) {
        setLines(records);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const updateState = async (id: string, state: BankLineRecord["state"]) => {
    setBusy(id);
    const next = await markBankLine(id, state);
    setLines(next);
    setBusy(null);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
      <aside className="dashboard-panel-dark rounded-[1.6rem] p-6 text-white">
        <div className="eyebrow text-white/75 before:bg-white/30">Bank Reconciliation</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
          Match statement movement with ledger events.
        </h1>
        <p className="mt-3 text-sm leading-7 text-white/70">
          This demo supports interactive review state transitions so operational flows can be
          validated before backend integration.
        </p>
      </aside>

      <section className="dashboard-panel rounded-[1.6rem] p-6">
        <div className="text-sm font-semibold text-[var(--ink)]">Statement lines with matching status</div>
        <div className="mt-4 space-y-3">
          {lines.map((line) => {
            const rowBusy = busy === line.id;
            return (
              <div key={line.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[var(--ink-soft)]">
                      {line.id} | {line.date} BS
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[var(--ink)]">{line.description}</div>
                    <div className="mt-1 text-xs text-[var(--ink-soft)]">
                      Suggested link: {line.match} | Confidence: {line.confidence}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-[var(--ink)]">{line.amount}</div>
                    <div className="text-xs text-[var(--ink-soft)]">{line.state}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 border-t border-[var(--border)] pt-3">
                  <button
                    disabled={rowBusy}
                    onClick={() => updateState(line.id, "Matched")}
                    className="rounded-full bg-[var(--panel-strong)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Mark matched
                  </button>
                  <button
                    disabled={rowBusy}
                    onClick={() => updateState(line.id, "Needs review")}
                    className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] disabled:opacity-60"
                  >
                    Needs review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
