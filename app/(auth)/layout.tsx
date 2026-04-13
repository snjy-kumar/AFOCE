import { LockKeyhole, ScrollText, ShieldCheck, Sparkles } from "lucide-react";

import Logo from "@/components/brand/Logo";

const trustRows = [
  {
    title: "Workflow-led security",
    detail: "Approval routes, role states, and immutable action trails are treated as product defaults.",
    icon: ShieldCheck,
  },
  {
    title: "Local compliance context",
    detail: "BS periods, IRD-ready invoice flows, VAT visibility, and finance-grade operating detail.",
    icon: ScrollText,
  },
  {
    title: "Built for fast rollout",
    detail: "This prototype already carries a production-style shell with mock product behavior.",
    icon: Sparkles,
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-screen overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="surface-dark relative hidden h-screen overflow-hidden px-8 py-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="hero-glow left-[-6rem] top-0 h-72 w-72 bg-[rgba(31,122,104,0.34)]" />
        <div className="hero-glow bottom-[-4rem] right-[-3rem] h-80 w-80 bg-[rgba(200,157,83,0.28)]" />

        <div className="relative z-10">
          <Logo href="/" muted />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="eyebrow text-white/72 before:bg-white/24">Secure Entry</div>
          <h1 className="display mt-6 text-5xl leading-none tracking-[-0.05em]">
            Finance operations deserve a calmer way in.
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/72">
            Fixed viewport auth shell with predictable hierarchy and finance-grade trust markers.
          </p>

          <div className="mt-6 space-y-3">
            {trustRows.map((row) => (
              <div
                key={row.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4"
              >
                <row.icon className="h-5 w-5 text-[var(--accent)]" />
                <div className="mt-3 text-lg font-semibold tracking-[-0.04em]">{row.title}</div>
                <p className="mt-1.5 text-xs leading-6 text-white/72">{row.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-sm text-white/52">
          <span>Encrypted workspace access</span>
          <span className="inline-flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-[var(--accent)]" />
            Mock auth flow
          </span>
        </div>
      </aside>

      <section className="h-screen overflow-hidden bg-[linear-gradient(180deg,#fcf8f0_0%,#f6ece0_100%)]">
        <div className="flex h-full flex-col">
          <div className="border-b border-[var(--border)] px-6 py-5 lg:hidden">
            <Logo href="/" />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto flex h-full w-full max-w-xl items-center">
              <div className="w-full">{children}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
