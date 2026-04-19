"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const DEMO_EMAIL = "demo@afoce.com";

function generateDemoData() {
  const NepaliMonths = ["Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randDate = () => `${randItem(NepaliMonths)} 2081`;
  const randAdDate = () => new Date(2024, rand(3, 11), rand(1, 28)).toISOString().split("T")[0];
  
  const clientNames = ["Nexa Trading", "Himal Retail", "Mountain View", "Kathmandu Electronics", "Everest Solutions", "Buddha Air", "S琪琪 Grocery", "Pashupatinath", "Lakeside Hospitality", "Summit Tech", "City Center Mall", "Royal Academy", "Adventure Travel", "Green Valley", "Sunrise Industries", "Temple View", "Dragon Restaurant", "Himalayan Airlines", "Nepal Trade", "Alpine Services"];
  const clientPans = Array.from({ length: 20 }, () => `${rand(100000, 999999)}${rand(100, 999)}`);
  const employeeNames = ["Ram Sharma", "Shyam KC", "Hari Bhatta", "Kiran Tamang", "Bikram Sth", "Nabin Joshi", "Santosh", "Prakash Rai", "Rajesh Mahar", "Dipesh Lama"];
  const expenseCategories = ["Travel", "Office Supplies", "Equipment", "Marketing", "Software", "Utilities", "Training", "Meals"];
  
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDemoLogin(event: React.MouseEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

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

    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message.includes("Invalid login")) {
        setError("Invalid email or password");
      } else if (signInError.message.includes("Email not confirmed")) {
        setError("Please verify your email first. Check your inbox for the confirmation link.");
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">Sign in</h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Enter your credentials to access your workspace.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <div className="mb-2 text-sm font-medium text-[var(--ink)]">Work email</div>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pl-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
            />
          </div>
        </label>

        <label className="block">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-[var(--ink)]">
            <span>Password</span>
            <Link href="/forgot-password" className="text-xs text-[var(--brand)]">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              type={visible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 pr-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
            />
            <button
              type="button"
              onClick={() => setVisible((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign in"}
          <ArrowRight className="h-4 w-4" />
        </button>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </form>

      <div className="mt-6 rounded-xl border-2 border-dashed border-[var(--brand)]/30 bg-[var(--brand)]/5 p-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--brand)]" />
          <span className="font-medium text-[var(--ink)]">Want to try AFOCE first?</span>
        </div>
        <p className="mt-1 text-center text-sm text-[var(--ink-soft)]">
          Experience the full features with sample data
        </p>
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand)]/90 disabled:opacity-70"
        >
          <Sparkles className="h-4 w-4" />
          Try Demo - No Account Required
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
        New to AFOCE?{" "}
        <Link href="/register" className="font-medium text-[var(--brand)]">
          Create an account
        </Link>
      </p>
    </div>
  );
}