"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Building2, Mail, Phone, UserRound } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "Sanjay Malla",
    company: "AFOCE Advisory Labs",
    email: "hello@afoce.demo",
    phone: "+977 9800000000",
    password: "Afoce!234",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/dashboard");
  }

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="animated-rise">
      <div className="eyebrow">Create workspace</div>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
        Set up a premium finance workflow in one pass.
      </h1>
      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
        The onboarding flow is intentionally short. Company identity, finance ownership, and
        the first secure user are enough to open the product shell.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 rounded-[1.75rem] surface p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            icon={<UserRound className="h-4 w-4" />}
            value={form.fullName}
            onChange={(value) => updateField("fullName", value)}
          />
          <Field
            label="Company name"
            icon={<Building2 className="h-4 w-4" />}
            value={form.company}
            onChange={(value) => updateField("company", value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Work email"
            icon={<Mail className="h-4 w-4" />}
            value={form.email}
            onChange={(value) => updateField("email", value)}
          />
          <Field
            label="Phone"
            icon={<Phone className="h-4 w-4" />}
            value={form.phone}
            onChange={(value) => updateField("phone", value)}
          />
        </div>

        <label className="mt-4 block">
          <div className="mb-2 text-sm font-semibold text-[var(--ink)]">Password</div>
          <input
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            className="w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
          />
          <div className="mt-2 text-xs leading-6 text-[var(--ink-soft)]">
            Mock validation target: 8+ characters, a number, and a special character.
          </div>
        </label>

        <div className="mt-4 rounded-[1.2rem] border border-[var(--border)] bg-white/75 p-3 text-xs leading-6 text-[var(--ink-soft)]">
          You&apos;ll land in a fully mocked AFOCE workspace with public, auth, and dashboard
          flows already wired together.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-70"
        >
          {loading ? "Provisioning workspace..." : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-4 text-sm text-[var(--ink-soft)]">
        Already have a workspace?{" "}
        <Link href="/login" className="font-semibold text-[var(--brand)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-[var(--ink)]">{label}</div>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]">
          {icon}
        </div>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-[1rem] border border-[var(--border)] bg-white px-11 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
        />
      </div>
    </label>
  );
}
