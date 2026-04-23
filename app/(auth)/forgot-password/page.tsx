"use client";

import Link from "next/link";
import { ArrowRight, Clock, Mail } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendReset() {
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/confirm?type=recovery&next=/reset-password`,
      },
    );

    if (resetError) {
      if (
        resetError.message.toLowerCase().includes("too many") ||
        resetError.message.includes("429")
      ) {
        setError("Too many requests — please wait a moment and try again.");
      } else {
        setError(resetError.message);
      }
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
        Forgot password
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <div className="mt-6 space-y-4">
        {!sent ? (
          <>
            <label className="block">
              <div className="mb-2 text-sm font-medium text-[var(--ink)]">
                Work email
              </div>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSendReset();
                  }}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
                />
              </div>
            </label>

            <button
              type="button"
              onClick={handleSendReset}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-70"
            >
              {loading ? "Sending…" : "Send reset link"}
              <ArrowRight className="h-4 w-4" />
            </button>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            {/* Success card */}
            <div className="rounded-xl border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/8 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-2)]/20">
                  <Mail className="h-4 w-4 text-[var(--brand-2)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--ink)]">
                    Reset link sent
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    We've emailed a password reset link to{" "}
                    <span className="font-medium text-[var(--ink)]">
                      {email}
                    </span>
                    . Check your inbox — and your spam folder if you don't see
                    it within a minute.
                  </p>
                </div>
              </div>
            </div>

            {/* Expiry notice */}
            <div className="flex items-center gap-2.5 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/8 px-4 py-3">
              <Clock className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              <p className="text-sm text-[var(--ink-soft)]">
                This link will expire in{" "}
                <span className="font-medium text-[var(--ink)]">1 hour</span>.
                If it expires, you can{" "}
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="font-medium text-[var(--brand)] hover:underline"
                >
                  request a new one
                </button>
                .
              </p>
            </div>
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
