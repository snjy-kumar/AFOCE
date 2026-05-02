"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, Loader2, CheckCircle, XCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Logo from "@/components/brand/Logo";

function VerifyLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "signup";
  const next = searchParams.get("next") ?? "/dashboard";

  async function handleVerify() {
    if (!token_hash) {
      setStatus("error");
      setErrorMessage("No verification token found in the link.");
      return;
    }

    setStatus("verifying");
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery" | "magiclink" | "email_change",
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("success");
      setTimeout(() => {
        router.push(next);
      }, 2000);
    }
  }

  // Auto-trigger if we think it's safe (optional), 
  // but better to have a button to prevent automated email scanners from consuming the token.
  
  return (
    <div className="w-full max-w-md">
      {/* Icon badge */}
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20">
        <ShieldCheck className="h-7 w-7 text-[var(--brand)]" />
      </div>

      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
        Finalize Verification
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        To protect your account, please click the button below to confirm your email and sign in.
      </p>

      <div className="mt-8 space-y-4">
        {status === "idle" && (
          <button
            onClick={handleVerify}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            Confirm Email & Sign In
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {status === "verifying" && (
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white/70 px-4 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--brand)]" />
            <p className="text-sm text-[var(--ink-soft)]">
              Verifying your secure link…
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex items-start gap-3 rounded-xl border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 px-4 py-4">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-2)]" />
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">
                Email confirmed!
              </p>
              <p className="mt-0.5 text-sm text-[var(--ink-soft)]">
                Redirecting you to your account…
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-600">
                Verification failed
              </p>
              <p className="mt-0.5 text-sm text-red-500/80">
                {errorMessage ?? "The link is invalid or has expired."}
              </p>
            </div>
          </div>
        )}

        {(status === "error" || status === "idle") && (
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--brand)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyLinkPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#fcf8f0_0%,#f6ece0_100%)]">
      <header className="border-b border-[var(--border)] px-6 py-4">
        <Logo href="/" />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyLinkContent />
        </Suspense>
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--ink-soft)]/60">
        Secure Verification System
      </footer>
    </div>
  );
}
