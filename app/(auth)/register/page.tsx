"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Mail,
  Phone,
  UserRound,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const DEMO_EMAIL = "demo@afoce.com";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendState, setResendState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [resendError, setResendError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validateForm(): string | null {
    if (!form.fullName.trim()) return "Please enter your full name";
    if (!form.company.trim()) return "Please enter your company name";
    if (!form.email.trim()) return "Please enter your work email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address";
    if (!form.password) return "Please enter a password";
    if (form.password.length < 8)
      return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(form.password))
      return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(form.password))
      return "Password must contain at least one number";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (form.email.toLowerCase() === DEMO_EMAIL.toLowerCase())
      return "This email is reserved for demo. Please use a different email.";
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          company: form.company,
          phone: form.phone || undefined,
        },
      },
    });

    if (signUpError) {
      if (
        signUpError.message.includes("already been registered") ||
        signUpError.message.includes("already exists")
      ) {
        setError("This email is already registered. Please sign in instead.");
      } else if (
        signUpError.message.includes("429") ||
        signUpError.message.toLowerCase().includes("too many")
      ) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleResend() {
    setResendState("sending");
    setResendError(null);

    const supabase = createClient();
    const { error: resendErr } = await supabase.auth.resend({
      type: "signup",
      email: form.email,
    });

    if (resendErr) {
      const msg = resendErr.message.toLowerCase();
      if (msg.includes("too many") || msg.includes("429")) {
        setResendError(
          "Too many requests — please wait a moment before resending.",
        );
      } else {
        setResendError(resendErr.message);
      }
      setResendState("error");
    } else {
      setResendState("sent");
    }
  }

  function handleDemoMode(e: React.MouseEvent) {
    e.preventDefault();
    router.push("/login");
  }

  if (success) {
    return (
      <div className="w-full">
        {/* Success card */}
        <div className="rounded-2xl border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-2)]/20">
              <Mail className="h-6 w-6 text-[var(--brand-2)]" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              We've sent a confirmation link to{" "}
              <span className="font-medium text-[var(--ink)]">
                {form.email}
              </span>
              . Click the link to activate your account.
            </p>
          </div>

          {/* OTP entry shortcut */}
          <Link
            href={`/auth/verify-email?email=${encodeURIComponent(form.email)}`}
            className="mt-5 flex items-center justify-center gap-2.5 rounded-xl border border-[var(--brand)]/20 bg-white/70 px-4 py-3 text-sm font-medium text-[var(--brand)] transition hover:bg-white hover:border-[var(--brand)]/40"
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Enter verification code instead
            <ArrowRight className="ml-auto h-3.5 w-3.5" />
          </Link>

          {/* Resend section */}
          <div className="mt-3 rounded-xl border border-[var(--border)] bg-white/60 px-4 py-3">
            {resendState === "sent" ? (
              <p className="text-center text-sm text-[var(--brand-2)]">
                ✓ A new confirmation email has been sent.
              </p>
            ) : (
              <p className="text-center text-sm text-[var(--ink-soft)]">
                Didn't receive it? Check spam, or{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendState === "sending"}
                  className="inline-flex items-center gap-1 font-medium text-[var(--brand)] hover:underline disabled:opacity-60"
                >
                  {resendState === "sending" ? (
                    <>
                      <RotateCcw className="h-3 w-3 animate-spin" />
                      sending…
                    </>
                  ) : (
                    "resend confirmation email"
                  )}
                </button>
              </p>
            )}
            {resendState === "error" && resendError && (
              <p className="mt-2 text-center text-xs text-red-500">
                {resendError}
              </p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--brand)]">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
        Create account
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Set up your workspace in just a few steps.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">
              Full name
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]">
                <UserRound className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={form.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                placeholder="John Doe"
                autoComplete="name"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </div>
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">
              Company
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]">
                <Building2 className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
                placeholder="Acme Pvt. Ltd."
                autoComplete="organization"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </div>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">
              Work email
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </div>
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">
              Phone (optional)
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+977-98XXXXXXXX"
                autoComplete="tel"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </div>
          </label>
        </div>

        <label className="block">
          <div className="mb-2 text-sm font-medium text-[var(--ink)]">
            Password
          </div>
          <input
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
          />
          <div className="mt-1.5 text-xs text-[var(--ink-soft)]">
            8+ characters with at least one uppercase letter and one number
          </div>
        </label>

        <label className="block">
          <div className="mb-2 text-sm font-medium text-[var(--ink)]">
            Confirm password
          </div>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) =>
              updateField("confirmPassword", event.target.value)
            }
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
          />
        </label>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-70"
        >
          {loading ? "Creating…" : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/50 px-4 py-3 text-center">
        <button
          type="button"
          onClick={handleDemoMode}
          className="text-sm text-[var(--ink-soft)] hover:text-[var(--brand)]"
        >
          Prefer to try demo first?
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--brand)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
