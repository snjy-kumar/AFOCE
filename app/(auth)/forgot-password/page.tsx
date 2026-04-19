"use client";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendReset() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

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
              onClick={handleSendReset}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send reset link"}
              <ArrowRight className="h-4 w-4" />
            </button>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
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
