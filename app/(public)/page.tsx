import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChartNoAxesCombined,
  Command,
  Landmark,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { featureStories, landingHeroStats, trustBadges } from "@/lib/mock-data";

const productCards = [
  {
    title: "Command Center",
    description: "Net cash, liabilities, receivables, and queues in one leadership surface.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Smart Invoicing",
    description: "Gapless IRD sequencing, VAT handling, client PAN context, and BS dates.",
    icon: ReceiptText,
  },
  {
    title: "Policy Engine",
    description: "Approval rules, receipt enforcement, and blocked actions before posting.",
    icon: ShieldCheck,
  },
  {
    title: "Global Search",
    description: "Jump from invoice to queue to report state from anywhere in the app.",
    icon: Command,
  },
];

export default function LandingPage() {
  return (
    <div className="pb-8">
      <section className="relative overflow-hidden px-4 pb-10 sm:px-6 lg:px-10">
        <div className="hero-glow left-[-5rem] top-10 h-72 w-72 bg-[rgba(200,157,83,0.32)]" />
        <div className="hero-glow bottom-0 right-[-4rem] h-80 w-80 bg-[rgba(21,48,125,0.24)]" />

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="animated-rise">
            <div className="eyebrow">Adaptive Financial Operations</div>
            <h1 className="display mt-6 max-w-4xl text-5xl leading-[0.92] tracking-[-0.06em] text-[var(--ink)] sm:text-6xl lg:text-7xl">
              Enterprise-grade finance control designed for Nepali operators.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--ink)] sm:text-lg sm:text-[var(--ink-soft)]">
              AFOCE merges premium cloud-product design with local accounting reality:
              Bikram Sambat workflows, IRD-aligned invoicing, approval policy logic, and
              real-time visibility for founders and finance teams.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1a3a8f] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#152d73]"
              >
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--ink)]/20 bg-white px-6 py-3.5 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:border-[var(--ink)]/30 hover:bg-slate-50"
              >
                Explore product preview
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <div
                  key={badge}
                  className="rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] shadow-sm"
                >
                  <BadgeCheck className="mr-2 inline h-4 w-4 text-[var(--brand-2)]" />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="animated-fade">
            <div className="surface overflow-hidden rounded-[2rem] p-4 sm:p-5">
              <div className="rounded-[1.6rem] surface-dark p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8ba3c7]">
                      AFOCE workspace
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      FY 2081/82 | Baisakh close
                    </div>
                  </div>
                  <div className="rounded-full border border-[#4a6b96] bg-[#1e3a5f] px-4 py-2 text-xs font-medium text-[#a8c5e8]">
                    IRD workflow active
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {landingHeroStats.map((stat) => (
                    <div key={stat.label} className="rounded-[1.5rem] border border-[#3a5a80]/50 bg-[#162d4a] p-4">
                      <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#7a9bc4]">{stat.label}</div>
                      <div className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{stat.value}</div>
                      <div className="mt-2 text-sm leading-6 text-[#8fb3d9]">{stat.detail}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.5rem] border border-[#3a5a80]/50 bg-[#162d4a] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Approval queue</div>
                        <div className="mt-1 text-sm text-[#7a9bc4]">
                          Enforced before ledger posting
                        </div>
                      </div>
                      <div className="data-chip">3 pending</div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        "Travel spend above Rs. 25,000 routed to CFO",
                        "Vendor invoice missing PAN blocked from issue",
                        "Office purchase without receipt stopped automatically",
                      ].map((item) => (
                        <div key={item} className="rounded-2xl border border-[#3a5a80]/30 bg-[#1a3454] px-4 py-3 text-sm text-[#c5d8ed]">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-[#3a5a80]/50 bg-[#162d4a] p-5">
                    <div className="text-sm font-semibold">Live finance signal</div>
                    <div className="mt-5 space-y-5">
                      <div>
                        <div className="flex items-center justify-between text-sm text-[#7a9bc4]">
                          <span>Cash position</span>
                          <span>Rs. 8.45M</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-[#1a3454]">
                          <div className="h-2 w-[78%] rounded-full bg-[linear-gradient(90deg,#c89d53,#1f7a68)]" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm text-[#7a9bc4]">
                          <span>Receivables at risk</span>
                          <span>Rs. 450K</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-[#1a3454]">
                          <div className="h-2 w-[46%] rounded-full bg-[linear-gradient(90deg,#1f7a68,#15307d)]" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm text-[#7a9bc4]">
                          <span>Net VAT payable</span>
                          <span>Rs. 125.7K</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-[#1a3454]">
                          <div className="h-2 w-[32%] rounded-full bg-[linear-gradient(90deg,#c89d53,#b14d41)]" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[1.4rem] border border-[#3a5a80]/30 bg-[#1a3454] p-4 text-sm leading-7 text-[#b8d0e8]">
                      The product acts like an operating system, not a passive ledger. The
                      workflow layer is where the value starts.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {productCards.map((card) => (
              <div key={card.title} className="metric-card">
                <card.icon className="h-5 w-5 text-[var(--brand)]" />
                <div className="mt-5 text-lg font-semibold tracking-[-0.03em] text-[var(--ink)]">{card.title}</div>
                <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--ink)]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] surface px-7 py-10 md:px-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <div className="eyebrow">Why it feels different</div>
              <h2 className="display mt-5 text-4xl leading-none tracking-[-0.05em] text-[var(--ink)]">
                Designed with the confidence of top-tier finance software, but localized from the core.
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--ink)]">
                The structure borrows from the best payment, software, and release-story
                interfaces: editorial hierarchy, dense product proof, and interaction-driven
                storytelling. The logic is tuned for Nepal from day one.
              </p>
            </div>

            <div className="space-y-4">
              {featureStories.map((story) => (
                <div key={story.title} className="rounded-[1.9rem] border border-[var(--border)] bg-white p-6 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--brand-2)]">
                    {story.eyebrow}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
                    {story.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink)]">
                    {story.description}
                  </p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {story.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="rounded-[1.25rem] border border-[var(--border)] bg-[#f8f4ec] px-4 py-3 text-sm font-medium leading-6 text-[var(--ink)]"
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Local invoice control",
              body: "Issue gapless IRD-ready invoices with BS date context and mandatory VAT logic built into the composer.",
              icon: Landmark,
            },
            {
              title: "Policy-backed expenses",
              body: "Give employees a clean submission flow while the system handles receipt enforcement and escalations.",
              icon: ShieldCheck,
            },
            {
              title: "Cash visibility that matters",
              body: "Replace spreadsheet chase-ups with action queues, reconciliation confidence, and owner-friendly KPIs.",
              icon: ChartNoAxesCombined,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[2rem] surface p-7 shadow-sm">
              <item.icon className="h-5 w-5 text-[var(--accent)]" />
              <div className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
