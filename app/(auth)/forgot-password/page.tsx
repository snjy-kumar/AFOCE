"use client";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("finance@afoce.demo");
  const [sent, setSent] = useState(false);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">Forgot password</h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Enter your email to receive a reset link.
      </p>

      <div className="mt-6 space-y-4">
        {!sent ? (
          <>
            <label className="block">
              <div className="mb-2 text-sm font-medium text-[var(--ink)]">Work email</div>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
                />
              </div>
            </label>

            <button
              type="button"
              onClick={() => setSent(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            >
              Send reset link
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-white p-4 text-sm text-[var(--ink-soft)]">
            Reset link sent to <span className="font-medium text-[var(--ink)]">{email}</span>.
            <Link
              href="/reset-password"
              className="mt-3 inline-flex items-center gap-1.5 font-medium text-[var(--brand)]"
            >
              Continue to reset
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-[var(--brand)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
