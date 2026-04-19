"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Password strength requirements
function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  return null;
}

// Visual strength indicator
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {checks.map(({ label, ok }) => (
        <span
          key={label}
          className={[
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition",
            ok
              ? "bg-[var(--brand-2)]/12 text-[var(--brand-2)]"
              : "bg-[var(--ink)]/6 text-[var(--ink-soft)]",
          ].join(" ")}
        >
          <span
            className={[
              "h-1.5 w-1.5 rounded-full",
              ok ? "bg-[var(--brand-2)]" : "bg-[var(--ink-soft)]/40",
            ].join(" ")}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Auto-redirect countdown after success
  useEffect(() => {
    if (!done) return;

    if (countdown <= 0) {
      router.push("/login?success=password_reset");
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [done, countdown, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Validate password strength
    const strengthError = validatePassword(password);
    if (strengthError) {
      setError(strengthError);
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
      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Create a new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {!done ? (
          <>
            {/* New password */}
            <label className="block">
              <div className="mb-2 text-sm font-medium text-[var(--ink)]">
                New password
              </div>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pr-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
                  aria-label={visible ? "Hide password" : "Show password"}
                >
                  {visible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <PasswordStrength password={password} />
            </label>

            {/* Confirm password */}
            <label className="block">
              <div className="mb-2 text-sm font-medium text-[var(--ink)]">
                Confirm password
              </div>
              <input
                type={visible ? "text" : "password"}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className={[
                  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition",
                  confirm && confirm !== password
                    ? "border-[var(--danger)]/50 focus:border-[var(--danger)]"
                    : "border-[var(--border)] focus:border-[var(--brand)]",
                ].join(" ")}
              />
              {confirm && confirm !== password && (
                <p className="mt-1.5 text-xs text-[var(--danger)]">
                  Passwords do not match
                </p>
              )}
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-70"
            >
              {loading ? "Saving…" : "Save new password"}
              <ArrowRight className="h-4 w-4" />
            </button>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </>
        ) : (
          /* ── Success state ── */
          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/8 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-2)]/20">
                  <CheckCircle className="h-4.5 w-4.5 text-[var(--brand-2)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    Password updated successfully
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    Your password has been changed. You'll be redirected to sign
                    in automatically in{" "}
                    <span className="font-medium tabular-nums text-[var(--ink)]">
                      {countdown}s
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            >
              Continue to sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </form>

      {!done && (
        <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
          Back to{" "}
          <Link href="/login" className="font-medium text-[var(--brand)]">
            sign in
          </Link>
        </p>
      )}
    </div>
  );
}
