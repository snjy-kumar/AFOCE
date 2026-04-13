"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("Afoce!234");
  const [confirm, setConfirm] = useState("Afoce!234");
  const [done, setDone] = useState(false);

  return (
    <div className="animated-rise">
      <div className="eyebrow">Reset password</div>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
        Issue a fresh credential and re-enter the workspace.
      </h1>
      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
        The token and delivery mechanics are mocked for now. The UX shell is ready for a real
        reset flow.
      </p>

      <div className="mt-5 rounded-[1.75rem] surface p-5">
        {!done ? (
          <>
            <label className="block">
              <div className="mb-2 text-sm font-semibold text-[var(--ink)]">New password</div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </label>
            <label className="mt-5 block">
              <div className="mb-2 text-sm font-semibold text-[var(--ink)]">Confirm password</div>
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </label>

            <button
              type="button"
              onClick={() => setDone(true)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            >
              Save new password
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="rounded-[1.2rem] border border-[var(--border)] bg-white/75 p-4 text-sm leading-7 text-[var(--ink-soft)]">
            Password updated. The next step in a real system would be session invalidation and
            redirecting you into secure login.
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-[var(--ink-soft)]">
        Back to{" "}
        <Link href="/login" className="font-semibold text-[var(--brand)]">
          sign in
        </Link>
      </p>
    </div>
  );
}
