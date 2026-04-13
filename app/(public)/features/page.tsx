import {
  ArrowUpRight,
  CalendarDays,
  FileCheck2,
  Landmark,
  Search,
  Shield,
  WalletCards,
} from "lucide-react";

const features = [
  {
    title: "Smart invoicing",
    body: "Sequential invoice generation, VAT math, PAN-aware customer records, and previewable IRD-ready outputs.",
    icon: FileCheck2,
  },
  {
    title: "BS-native operations",
    body: "Run periods, due dates, and reporting in Bikram Sambat without treating it like an afterthought.",
    icon: CalendarDays,
  },
  {
    title: "Expense policy engine",
    body: "Receipt requirements and approval thresholds are enforced before anything reaches the general ledger.",
    icon: Shield,
  },
  {
    title: "Bank reconciliation",
    body: "Uploaded statement lines are placed beside internal events with confidence-scored matching suggestions.",
    icon: WalletCards,
  },
  {
    title: "Reports and VAT",
    body: "See output tax, input tax, and payable balances alongside cash flow and board-level performance views.",
    icon: Landmark,
  },
  {
    title: "Global action search",
    body: "Power users jump directly to invoices, expenses, exceptions, and report surfaces with a command palette.",
    icon: Search,
  },
];

export default function FeaturesPage() {
  return (
    <section className="px-4 pb-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center animated-rise">
          <div className="eyebrow justify-center">Feature Blueprint</div>
          <h1 className="display mt-6 text-5xl leading-none tracking-[-0.05em] sm:text-6xl">
            Finance software that behaves like an operating system.
          </h1>
          <p className="mt-6 text-base leading-8 text-[var(--ink-soft)] sm:text-lg">
            Every major module is designed to remove ambiguity: what should be done, who
            should approve it, what tax logic applies, and what the business owner needs to
            see right now.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-[2rem] surface p-7">
              <feature.icon className="h-5 w-5 text-[var(--brand)]" />
              <div className="mt-6 text-2xl font-semibold tracking-[-0.04em]">{feature.title}</div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{feature.body}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">
                Operational advantage
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[2.5rem] surface-dark grid gap-8 px-8 py-10 text-white lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div>
            <div className="eyebrow text-white/70 before:bg-white/24">Control Model</div>
            <h2 className="display mt-5 text-4xl leading-none tracking-[-0.05em]">
              The product is opinionated where finance systems usually stay silent.
            </h2>
            <p className="mt-5 text-sm leading-8 text-white/70">
              Instead of letting users save broken records and asking accountants to clean
              them later, AFOCE makes validation, approvals, and compliance decisions part of
              the interaction layer.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              "No receipt above threshold means no posting.",
              "No PAN on a taxable invoice means an immediate warning state.",
              "No silent gaps in invoice numbering.",
              "No disconnected bank upload without suggested matching workflow.",
            ].map((line) => (
              <div key={line} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 text-sm leading-7 text-white/78">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
