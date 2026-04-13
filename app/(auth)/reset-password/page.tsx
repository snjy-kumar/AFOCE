"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("Afoce!234");
  const [confirm, setConfirm] = useState("Afoce!234");
  const [done, setDone] = useState(false);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">Reset password</h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Create a new password for your account.
      </p>

      <div className="mt-6 space-y-4">
        {!done ? (
          <>
            <label className="block">
              <div className="mb-2 text-sm font-medium text-[var(--ink)]">New password</div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </label>
            <label className="block">
              <div className="mb-2 text-sm font-medium text-[var(--ink)]">Confirm password</div>
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </label>

            <button
              type="button"
              onClick={() => setDone(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            >
              Save new password
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-white p-4 text-sm text-[var(--ink-soft)]">
            Password updated successfully.
            <Link
              href="/login"
              className="mt-3 inline-flex items-center gap-1.5 font-medium text-[var(--brand)]"
            >
              Continue to sign in
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
        Back to{" "}
        <Link href="/login" className="font-medium text-[var(--brand)]">
          sign in
        </Link>
      </p>
    </div>
  );
}
