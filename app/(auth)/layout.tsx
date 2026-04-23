import { ScrollText, ShieldCheck, Sparkles, Zap, CalendarDays, Mountain } from "lucide-react";

import Logo from "@/components/brand/Logo";

const bsMonths = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const currentBsYear = 2081;
const currentBsMonth = bsMonths[new Date().getMonth()];
const currentBsDay = Math.floor(Math.random() * 30) + 1;

const trustRows = [
  {
    title: "Workflow-led security",
    detail:
      "Approval routes, role states, and immutable action trails are treated as product defaults.",
    icon: ShieldCheck,
  },
  {
    title: "Local compliance context",
    detail:
      "BS periods, IRD-ready invoice flows, VAT visibility, and finance-grade operating detail.",
    icon: ScrollText,
  },
  {
    title: "Built for fast rollout",
    detail:
      "This prototype already carries a production-style shell with mock product behavior.",
    icon: Sparkles,
  },
  {
    title: "Real-time intelligence",
    detail:
      "Live dashboards, instant reconciliation, and intelligent anomaly detection for smarter decisions.",
    icon: Zap,
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen overflow-hidden lg:grid-cols-[1fr_1fr]">
      <aside className="surface-dark relative hidden h-screen overflow-hidden px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="hero-glow left-[-6rem] top-0 h-72 w-72 bg-[rgba(31,122,104,0.34)]" />
        <div className="hero-glow bottom-[-4rem] right-[-3rem] h-80 w-80 bg-[rgba(200,157,83,0.28)]" />

        <div className="relative z-10">
          <Logo href="/" muted />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center">
          <div className="eyebrow text-white/72 before:bg-white/24">
            Secure Entry
          </div>
          <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-[-0.04em]">
            Finance operations deserve a calmer way in.
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {trustRows.map((row) => (
              <div
                key={row.title}
                className="flex flex-col gap-4 rounded-2xl border border-white/12 bg-white/[0.08] p-5 backdrop-blur-sm transition hover:bg-white/[0.12] hover:border-white/20"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <row.icon className="h-6 w-6 text-[var(--accent)]" />
                </div>
                <div>
                  <div className="text-base font-semibold leading-tight tracking-[-0.03em]">
                    {row.title}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">
                    {row.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-white/50">
          <span>🔒 Encrypted workspace access</span>
          <div className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="font-medium">{currentBsMonth} {currentBsDay}, {currentBsYear}</span>
          </div>
        </div>
      </aside>

      <section className="relative flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,#fcf8f0_0%,#f6ece0_100%)]">
        <div className="border-b border-[var(--border)] px-6 py-4 lg:hidden">
          <Logo href="/" />
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:absolute">
          <div className="absolute left-8 top-20 opacity-[0.06]">
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
              <circle cx="90" cy="90" r="88" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="90" cy="90" r="70" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="90" cy="90" r="50" stroke="currentColor" strokeWidth="0.5" />
              <text x="90" y="50" textAnchor="middle" className="fill-[var(--brand)] text-xs font-medium">{currentBsYear}</text>
              <text x="90" y="130" textAnchor="middle" className="fill-[var(--brand)] text-xs font-medium">BS</text>
            </svg>
          </div>

          <div className="absolute bottom-24 right-8 opacity-[0.08]">
            <Mountain className="h-32 w-32 text-[var(--brand-2)]" />
          </div>

          <div className="absolute right-16 top-32 opacity-[0.05]">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${i < currentBsDay ? 'bg-[var(--brand)]' : 'border border-[var(--brand)]'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center overflow-y-auto px-8 py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <div className="relative z-10 hidden border-t border-[var(--border)] bg-white/50 px-6 py-3 lg:block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
              <span>🌏</span>
              <span>Operating in Bikram Sambat calendar</span>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-white px-2 py-1 text-xs font-medium text-[var(--brand)]">
              <CalendarDays className="h-3 w-3" />
              {currentBsMonth} {currentBsDay}, {currentBsYear} BS
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
