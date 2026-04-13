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
    <div className="animated-rise">
      <div className="eyebrow">Sign in</div>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
        Return to your finance command center.
      </h1>
      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
        This flow uses mock authentication for now, but the structure is ready for a real
        auth provider and role-aware session states.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 rounded-[1.75rem] surface p-5">
        <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(29,127,107,0.08)] px-4 py-2.5 text-xs leading-6 text-[var(--ink)]">
          <ShieldCheck className="mr-2 inline h-4 w-4 text-[var(--brand-2)]" />
          Demo workspace credentials are prefilled so you can move through the product shell.
        </div>

        <div className="mt-4 space-y-4">
          <label className="block">
            <div className="mb-2 text-sm font-semibold text-[var(--ink)]">Work email</div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-white px-11 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              />
            </div>
          </label>

          <label className="block">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[var(--ink)]">
              <span>Password</span>
              <Link href="/forgot-password" className="text-[var(--brand)]">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={visible ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 pr-12 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-70"
        >
          {loading ? "Entering workspace..." : "Sign in"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="mt-4 rounded-[1.2rem] border border-[var(--border)] bg-white/75 p-3 text-xs text-[var(--ink-soft)]">
          Roles in this demo: Finance Manager, Founder, Employee
        </div>
      </form>

      <p className="mt-4 text-sm text-[var(--ink-soft)]">
        New to AFOCE?{" "}
        <Link href="/register" className="font-semibold text-[var(--brand)]">
          Create your workspace
        </Link>
      </p>
    </div>
  );
}
