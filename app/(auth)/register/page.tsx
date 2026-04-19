"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Building2, Mail, Phone, UserRound, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const DEMO_EMAIL = "demo@afoce.com";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address";
    if (!form.password) return "Please enter a password";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(form.password)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(form.password)) return "Password must contain at least one number";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (form.email.toLowerCase() === DEMO_EMAIL.toLowerCase()) return "This email is reserved for demo. Please use a different email.";
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
      if (signUpError.message.includes("already been registered") || signUpError.message.includes("already exists")) {
        setError("This email is already registered. Please sign in instead.");
      } else if (signUpError.message.includes("429") || signUpError.message.toLowerCase().includes("too many")) {
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

  function handleDemoMode(e: React.MouseEvent) {
    e.preventDefault();
    router.push("/login");
  }

  if (success) {
    return (
      <div className="w-full">
        <div className="rounded-2xl border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-2)]/20">
            <Mail className="h-6 w-6 text-[var(--brand-2)]" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">Check your email</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            We've sent a confirmation link to <span className="font-medium text-[var(--ink)]">{form.email}</span>.
            Click the link to activate your account.
          </p>
          <div className="mt-6 rounded-lg border border-[var(--border)] bg-white p-4">
            <p className="text-sm text-[var(--ink-soft)]">
              Didn't receive the email? Check your spam folder, or{" "}
              <button type="button" className="text-[var(--brand)] font-medium hover:underline">
                resend confirmation
              </button>
            </p>
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
      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">Create account</h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Set up your workspace in just a few steps.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">Full name</div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]">
                <UserRound className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </div>
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">Company</div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]">
                <Building2 className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
                placeholder="Acme Pvt. Ltd."
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </div>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">Work email</div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </div>
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">Phone (optional)</div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+977-98XXXXXXXX"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </div>
          </label>
        </div>

        <label className="block">
          <div className="mb-2 text-sm font-medium text-[var(--ink)]">Password</div>
          <input
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
          />
          <div className="mt-1.5 text-xs text-[var(--ink-soft)]">
            8+ characters with uppercase and number
          </div>
        </label>

        <label className="block">
          <div className="mb-2 text-sm font-medium text-[var(--ink)]">Confirm password</div>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            placeholder="••••••••"
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
          {loading ? "Creating..." : "Create account"}
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