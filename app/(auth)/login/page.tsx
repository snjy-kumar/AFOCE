"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("finance@afoce.demo");
  const [password, setPassword] = useState("Afoce!234");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
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
      </form>

      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[rgba(29,127,107,0.06)] px-4 py-3 text-xs text-[var(--ink-soft)]">
        <ShieldCheck className="mr-2 inline h-3.5 w-3.5 text-[var(--brand-2)]" />
        Demo credentials are prefilled for quick access.
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
