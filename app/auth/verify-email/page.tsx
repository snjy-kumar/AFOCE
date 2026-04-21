// ============================================================
// /auth/verify-email — 6-digit OTP verification page
// Standalone page (outside (auth) route group) so it keeps its
// own layout while matching the warm-cream auth visual style.
// ============================================================

"use client";

import { Suspense, useState } from "react";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Logo from "@/components/brand/Logo";

// ── Inner component that reads search params ─────────────────
// Must live inside a <Suspense> boundary because useSearchParams
// suspends during SSR in Next.js 16.
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isUnauthorizedAccess, setIsUnauthorizedAccess] = useState(false);

  // Check if user went through registration flow
  React.useEffect(() => {
    const verificationFlow = sessionStorage.getItem("verification_flow_initiated");
    const pendingEmail = sessionStorage.getItem("pending_email_verification");

    // If no registration flow was initiated, deny access
    if (!verificationFlow || !pendingEmail) {
      setIsUnauthorizedAccess(true);
      setError("Please register first to verify your email.");
      return;
    }

    // If email from URL doesn't match registered email, deny access
    if (initialEmail && initialEmail !== pendingEmail) {
      setIsUnauthorizedAccess(true);
      setError("This email doesn't match your registration. Please use the link from your email.");
      return;
    }

    // Use the verified email from registration
    setEmail(pendingEmail);
  }, [initialEmail]);

  // ── Verify OTP ─────────────────────────────────────────────
  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResendMessage(null);

    // Prevent verification if unauthorized access detected
    if (isUnauthorizedAccess) {
      setError("Please register first to verify your email. Redirecting...");
      setTimeout(() => router.push("/register"), 2000);
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the full 6-digit code from your email.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (verifyError) {
      const msg = verifyError.message.toLowerCase();
      if (msg.includes("expired") || msg.includes("invalid") || msg.includes("not found")) {
        setError("That code is invalid or has expired. Request a new one below.");
      } else {
        setError(verifyError.message);
      }
      setLoading(false);
      return;
    }

    // Clear session storage on successful verification
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("verification_flow_initiated");
      sessionStorage.removeItem("pending_email_verification");
    }

    router.push("/dashboard");
  }

  // ── Resend code ────────────────────────────────────────────
  async function handleResend() {
    setError(null);
    setResendMessage(null);

    // Prevent resend if unauthorized access detected
    if (isUnauthorizedAccess) {
      setError("Please register first to verify your email.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setResending(true);
    const supabase = createClient();

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (resendError) {
      if (resendError.message.toLowerCase().includes("too many") || resendError.message.includes("429")) {
        setError("Too many requests — please wait a moment before resending.");
      } else {
        setError(resendError.message);
      }
    } else {
      setResendMessage("A new code has been sent. Check your inbox (and spam folder).");
    }
    setResending(false);
  }

  return (
    <div className="w-full max-w-md">
      {/* Icon badge */}
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20">
        <ShieldCheck className="h-7 w-7 text-[var(--brand)]" />
      </div>

      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
        Verify your email
      </h1>
      {isUnauthorizedAccess && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <p className="mt-2 text-xs text-red-500">Redirecting to registration...</p>
        </div>
      )}

      {!isUnauthorizedAccess && (
        <>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            Enter the 6-digit code sent to your email address.
            Codes expire after <span className="font-medium text-[var(--ink)]">1 hour</span>.
          </p>

          <form onSubmit={handleVerify} className="mt-6 space-y-4">
        {/* Email */}
        <label className="block">
          <div className="mb-2 text-sm font-medium text-[var(--ink)]">Email address</div>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
            <input
              type="email"
              value={email}
              readOnly={!!email}
              onChange={(e) => !email && setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] disabled:bg-[var(--bg)]/50 disabled:text-[var(--ink-soft)]"
              disabled={!!email}
            />
          </div>
          {email && (
            <p className="mt-1.5 text-xs text-[var(--ink-soft)]">
              ✓ Verified email — a confirmation code was sent here
            </p>
          )}
        </label>

        {/* OTP */}
        <label className="block">
          <div className="mb-2 text-sm font-medium text-[var(--ink)]">Verification code</div>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            autoComplete="one-time-code"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-center text-[1.75rem] font-semibold leading-none tracking-[0.55em] text-[var(--ink)] outline-none transition focus:border-[var(--brand)] placeholder:text-[var(--ink-soft)]/40 placeholder:tracking-[0.55em] placeholder:text-2xl"
          />
          <p className="mt-1.5 text-xs text-[var(--ink-soft)]">
            Check your inbox — including the spam folder.
          </p>
        </label>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Resend success */}
        {resendMessage && (
          <div className="rounded-lg border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 px-4 py-3 text-sm text-[var(--brand-2)]">
            {resendMessage}
          </div>
        )}

        {/* Verify button */}
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-70"
        >
          {loading ? "Verifying…" : "Verify email"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* Resend section */}
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-white/60 px-4 py-3 text-center text-sm text-[var(--ink-soft)]">
        Didn't receive a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-medium text-[var(--brand)] hover:underline disabled:opacity-60"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
      </div>

      {/* Back to login */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--ink-soft)] transition hover:text-[var(--brand)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
        </>
      )}
    </div>
  );
}

// ── Page shell (provides Suspense + layout) ──────────────────
export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#fcf8f0_0%,#f6ece0_100%)]">
      {/* Top bar with logo */}
      <header className="border-b border-[var(--border)] px-6 py-4">
        <Logo href="/" />
      </header>

      {/* Centered form card */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md space-y-4">
              <div className="h-14 w-14 animate-pulse rounded-2xl bg-[var(--brand)]/10" />
              <div className="h-8 w-52 animate-pulse rounded-lg bg-[var(--ink)]/10" />
              <div className="h-5 w-72 animate-pulse rounded bg-[var(--ink)]/6" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--ink)]/6" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--ink)]/6" />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </main>

      {/* Bottom bar */}
      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--ink-soft)]/60">
        Encrypted workspace access
      </footer>
    </div>
  );
}
