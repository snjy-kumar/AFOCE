"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">Reset password</h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Create a new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {!done ? (
          <>
            <label className="block">
              <div className="mb-2 text-sm font-medium text-[var(--ink)]">New password</div>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pr-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
                >
                  {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="block">
              <div className="mb-2 text-sm font-medium text-[var(--ink)]">Confirm password</div>
              <input
                type={visible ? "text" : "password"}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save new password"}
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
      </form>

      <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
        Back to{" "}
        <Link href="/login" className="font-medium text-[var(--brand)]">
          sign in
        </Link>
      </p>
    </div>
  );
}
