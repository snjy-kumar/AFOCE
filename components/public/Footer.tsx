import Link from "next/link";
import { ShieldCheck, Landmark, ScrollText } from "lucide-react";

import Logo from "@/components/brand/Logo";

const footerLinks = {
  Product: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/register", label: "Start free trial" },
  ],
  Company: [
    { href: "/about", label: "About AFOCE" },
    { href: "/login", label: "Customer login" },
    { href: "/dashboard", label: "Preview dashboard" },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border)] px-4 pb-10 pt-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white p-8 shadow-lg md:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.8fr_0.8fr]">
          <div className="space-y-5">
            <Logo />
            <p className="max-w-xl text-sm leading-7 text-[var(--ink)]">
              Adaptive Financial Operations &amp; Compliance Engine for Nepali SMEs.
              Designed like a premium cloud product, structured like a finance control
              surface, and opinionated about compliance from the first click.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-[var(--ink)]">
              <span className="rounded-full border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-2">
                <ShieldCheck className="mr-2 inline h-4 w-4 text-[var(--brand-2)]" />
                Bank-level security posture
              </span>
              <span className="rounded-full border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-2">
                <ScrollText className="mr-2 inline h-4 w-4 text-[var(--accent)]" />
                IRD-compliant workflows
              </span>
              <span className="rounded-full border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-2">
                <Landmark className="mr-2 inline h-4 w-4 text-[var(--brand)]" />
                Native BS operating periods
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, items]) => (
            <div key={title}>
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--ink)]">
                {title}
              </div>
              <div className="mt-5 space-y-3">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm font-medium text-[var(--ink)] transition hover:text-[var(--brand)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-sm text-[var(--ink)] md:flex-row md:items-center md:justify-between">
          <p>© 2026 AFOCE. Built for finance teams that want control without legacy software.</p>
          <p>Security, auditability, and workflow clarity are first-class product features.</p>
        </div>
      </div>
    </footer>
  );
}
