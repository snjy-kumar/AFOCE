import { Check } from "lucide-react";

import { pricingPlans } from "@/lib/mock-data";

export default function PricingPage() {
  return (
    <section className="px-4 pb-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center animated-rise">
          <div className="eyebrow justify-center">Pricing</div>
          <h1 className="display mt-6 text-5xl leading-none tracking-[-0.05em] sm:text-6xl">
            Structured for operators now, extensible for finance teams later.
          </h1>
          <p className="mt-6 text-base leading-8 text-[var(--ink-soft)]">
            The current build uses mock product plans to frame the commercial model. Each plan
            assumes the same premium experience, with more control layers activated as the
            organization grows.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={[
                "rounded-[2.2rem] p-7",
                plan.featured ? "surface-dark text-white" : "surface text-[var(--ink)]",
              ].join(" ")}
            >
              <div className="text-xs font-bold uppercase tracking-[0.28em] opacity-70">{plan.name}</div>
              <div className="mt-5 flex items-end gap-2">
                <div className="display text-5xl leading-none tracking-[-0.05em]">{plan.price}</div>
                <div className="pb-2 text-sm opacity-70">{plan.cadence}</div>
              </div>
              <p className="mt-4 text-sm leading-7 opacity-78">{plan.summary}</p>

              <div className="my-7 hairline" />

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm leading-7">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={[
                  "mt-8 w-full rounded-full px-5 py-3 text-sm font-semibold transition",
                  plan.featured
                    ? "bg-white text-[var(--panel-strong)] hover:bg-[var(--panel)]"
                    : "bg-[var(--panel-strong)] text-white hover:bg-[var(--brand)]",
                ].join(" ")}
              >
                {plan.name === "Enterprise" ? "Talk to sales" : "Choose plan"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
