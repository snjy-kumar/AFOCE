"use client";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("finance@afoce.demo");
  const [sent, setSent] = useState(false);

  return (
    <div className="animated-rise">
      <div className="eyebrow">Password recovery</div>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
        Reset access without losing workflow continuity.
      </h1>
      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
        This mock flow simulates secure reset initiation and leads into a token-based reset
        screen.
      </p>

      <div className="mt-5 rounded-[1.75rem] surface p-5">
        {!sent ? (
          <>
            <label className="block">
              <div className="mb-2 text-sm font-semibold text-[var(--ink)]">Work email</div>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-[1rem] border border-[var(--border)] bg-white px-11 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
                />
              </div>
            </label>

            <button
              type="button"
              onClick={() => setSent(true)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            >
              Send reset link
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[1.2rem] border border-[var(--border)] bg-white/75 p-4 text-sm leading-7 text-[var(--ink-soft)]">
              A reset link was generated for <span className="font-semibold text-[var(--ink)]">{email}</span>.
              In a real flow, this would be emailed securely.
            </div>
            <Link
              href="/reset-password"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]"
            >
              Continue to reset screen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-[var(--ink-soft)]">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-[var(--brand)]">
          Return to sign in
        </Link>
      </p>
    </div>
  );
}
