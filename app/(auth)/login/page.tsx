"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const DEMO_EMAIL = "demo@afoce.com";

function generateDemoData() {
  const NepaliMonths = [
    "Baisakh",
    "Jestha",
    "Ashadh",
    "Shrawan",
    "Bhadra",
    "Ashwin",
    "Kartik",
    "Mangsir",
    "Poush",
    "Magh",
    "Falgun",
    "Chaitra",
  ];
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const randItem = <T,>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];
  const randDate = () => `${randItem(NepaliMonths)} 2081`;
  const randAdDate = () =>
    new Date(2024, rand(3, 11), rand(1, 28)).toISOString().split("T")[0];

  const clientNames = [
    "Nexa Trading",
    "Himal Retail",
    "Mountain View",
    "Kathmandu Electronics",
    "Everest Solutions",
    "Buddha Air",
    "Grocery",
    "Pashupatinath",
    "Lakeside Hospitality",
    "Summit Tech",
    "City Center Mall",
    "Royal Academy",
    "Adventure Travel",
    "Green Valley",
    "Sunrise Industries",
    "Temple View",
    "Dragon Restaurant",
    "Himalayan Airlines",
    "Nepal Trade",
    "Alpine Services",
  ];
  const clientPans = Array.from(
    { length: 20 },
    () => `${rand(100000, 999999)}${rand(100, 999)}`,
  );
  const employeeNames = [
    "Ram Sharma",
    "Shyam KC",
    "Hari Bhatta",
    "Kiran Tamang",
    "Bikram Sth",
    "Nabin Joshi",
    "Santosh",
    "Prakash Rai",
    "Rajesh Mahar",
    "Dipesh Lama",
  ];
  const expenseCategories = [
    "Travel",
    "Office Supplies",
    "Equipment",
    "Marketing",
    "Software",
    "Utilities",
    "Training",
    "Meals",
  ];

  return {
    clients: Array.from({ length: 20 }, (_, i) => ({
      id: `CL-${String(i + 1).padStart(4, "0")}`,
      name: clientNames[i],
      pan: clientPans[i],
      email: `${clientNames[i].toLowerCase().replace(/\s+/g, ".")}@example.com`,
      type: i % 4 === 0 ? "vendor" : "client",
    })),
    policies: [
      { id: "POL-001", name: "Expense Limit Check", category: "expenses" },
      { id: "POL-002", name: "Invoice Approval", category: "invoicing" },
      { id: "POL-003", name: "Manager Auto-Approve", category: "approvals" },
      { id: "POL-004", name: "VAT Validation", category: "invoicing" },
      { id: "POL-005", name: "Budget Alert", category: "expenses" },
    ],
    invoices: Array.from({ length: 50 }, (_, i) => ({
      id: `INV-${String(i + 1).padStart(4, "0")}`,
      client_id: `CL-${String(rand(1, 20)).padStart(4, "0")}`,
      client_name: randItem(clientNames),
      client_pan: randItem(clientPans),
      bs_date: randDate(),
      ad_date: randAdDate(),
      due_days: rand(15, 45),
      amount: rand(5000, 200000),
      vat: Math.round(rand(5000, 200000) * 0.13),
      status: randItem(["paid", "pending", "overdue"]),
    })),
    expenses: Array.from({ length: 40 }, (_, i) => ({
      id: `EXP-${String(i + 1).padStart(4, "0")}`,
      employee: randItem(employeeNames),
      category: randItem(expenseCategories),
      amount: rand(500, 80000),
      bs_date: randDate(),
      ad_date: randAdDate(),
      status: randItem(["pending_approval", "approved", "rejected", "blocked"]),
      policy_id: "POL-001",
      policy_title: "Expense Limit Check",
    })),
    bankLines: Array.from({ length: 25 }, (_, i) => ({
      id: `BL-${rand(1000, 9999)}`,
      date: randDate(),
      description: `Bank transaction ${i + 1}`,
      amount: Math.abs(rand(-100000, 100000)),
      state: randItem(["matched", "needs_review", "unmatched"]),
      confidence: rand(60, 100),
    })),
  };
}

// ── Inner component — uses useSearchParams, must be inside Suspense ──
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-level error codes (e.g. bounced back from /auth/confirm)
  const urlError = searchParams.get("error");
  const urlRedirectTo = searchParams.get("redirectTo");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Whether the sign-in error was specifically "email not confirmed"
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  async function handleDemoLogin(event: React.MouseEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setEmailNotConfirmed(false);

    const demoCookie = "demo_user=true; path=/; max-age=86400";
    document.cookie = demoCookie;
    localStorage.setItem("demo_session", "true");
    const demoData = generateDemoData();
    localStorage.setItem("demo_data", JSON.stringify(demoData));
    router.push("/dashboard");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setEmailNotConfirmed(false);

    if (!email || !password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Verify Supabase is accessible
      if (!supabase) {
        setError(
          "Unable to connect to authentication service. Please try again."
        );
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Network/connection errors
        if (
          signInError.message.includes("Failed to fetch") ||
          signInError.message.includes("fetch")
        ) {
          setError(
            "Network error. Please check your connection and try again."
          );
        } else if (signInError.message.includes("Invalid login")) {
          setError("Invalid email or password.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setEmailNotConfirmed(true);
          setError("Please verify your email before signing in.");
        } else {
          setError(signInError.message || "Authentication failed. Try again.");
        }
        setLoading(false);
        return;
      }

      router.push(urlRedirectTo ?? "/dashboard");
    } catch (err) {
      // Catch any unexpected errors
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Login error:", err);
      setError(
        errorMessage.includes("fetch")
          ? "Connection error. Please check your internet and try again."
          : errorMessage
      );
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* ── URL-level error banners ─────────────────────────── */}
      {urlError === "invalid_token" && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger)]/8 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[var(--danger)]" />
          <div className="text-sm">
            <p className="font-medium text-[var(--danger)]">
              Verification link invalid or expired
            </p>
            <p className="mt-0.5 text-[var(--ink-soft)]">
              The link you followed has already been used or has expired.{" "}
              <Link
                href="/register"
                className="font-medium text-[var(--brand)] hover:underline"
              >
                Register again
              </Link>{" "}
              or{" "}
              <Link
                href="/forgot-password"
                className="font-medium text-[var(--brand)] hover:underline"
              >
                reset your password
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {(urlError === "email_not_confirmed" || emailNotConfirmed) && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[var(--accent)]" />
          <div className="text-sm">
            <p className="font-medium text-[var(--ink)]">
              Email not yet verified
            </p>
            <p className="mt-0.5 text-[var(--ink-soft)]">
              Check your inbox for the confirmation link. Also check your spam folder.
            </p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Enter your credentials to access your workspace.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              placeholder="you@company.com"
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
            />
          </div>
        </label>

        <label className="block">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-[var(--ink)]">
            <span>Password</span>
            <Link
              href="/forgot-password"
              className="text-xs font-normal text-[var(--brand)]"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              type={visible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pr-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
            >
              {visible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-70"
        >
          {loading ? "Signing in…" : "Sign in"}
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Sign-in error */}
        {error && !emailNotConfirmed && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <p>{error}</p>
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
        New to AFOCE?{" "}
        <Link href="/register" className="font-medium text-[var(--brand)]">
          Create an account
        </Link>
      </p>
    </div>
  );
}

// ── Page — wraps inner component in Suspense ─────────────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-4">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-[var(--ink)]/10" />
          <div className="h-5 w-64 animate-pulse rounded bg-[var(--ink)]/6" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--ink)]/6" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--ink)]/6" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--ink)]/10" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
