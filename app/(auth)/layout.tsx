import { ScrollText, ShieldCheck, Sparkles } from "lucide-react";

import Logo from "@/components/brand/Logo";

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
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen overflow-hidden lg:grid-cols-[1fr_1fr]">
      <aside className="surface-dark relative hidden h-screen overflow-hidden px-10 py-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="hero-glow left-[-6rem] top-0 h-72 w-72 bg-[rgba(31,122,104,0.34)]" />
        <div className="hero-glow bottom-[-4rem] right-[-3rem] h-80 w-80 bg-[rgba(200,157,83,0.28)]" />

        <div className="relative z-10">
          <Logo href="/" muted />
        </div>

        <div className="relative z-10 max-w-md">
          <div className="eyebrow text-white/72 before:bg-white/24">
            Secure Entry
          </div>
          <h2 className="mt-4 text-3xl font-semibold leading-snug tracking-[-0.04em]">
            Finance operations deserve a calmer way in.
          </h2>

          <div className="mt-5 space-y-3">
            {trustRows.map((row) => (
              <div
                key={row.title}
                className="flex items-start gap-3.5 rounded-2xl border border-white/12 bg-white/[0.08] p-4 backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <row.icon className="h-4.5 w-4.5 text-[var(--accent)]" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold tracking-[-0.03em]">
                    {row.title}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-white/64">
                    {row.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-white/50">
          <span>Encrypted workspace access</span>
        </div>
      </aside>

      <section className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,#fcf8f0_0%,#f6ece0_100%)]">
        <div className="border-b border-[var(--border)] px-6 py-4 lg:hidden">
          <Logo href="/" />
        </div>
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-8 py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </div>
  );
}
