import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";

export default function CTA() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] surface-dark px-8 py-10 text-white md:px-12 md:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="animated-rise">
            <div className="eyebrow text-white/75 before:bg-white/35">Rollout Ready</div>
            <h2 className="display mt-5 max-w-3xl text-4xl leading-none tracking-[-0.04em] sm:text-5xl">
              Replace fragmented finance ops with one deliberate control surface.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
              Launch with guided invoicing, policy enforcement, reconciliation review,
              VAT visibility, and leadership-grade dashboards. The current build uses
              mock data, but the product surface is already structured like a real system.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[var(--panel-strong)] transition hover:bg-[var(--panel)]"
              >
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/6"
              >
                Preview dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              "Mock workflow data across invoicing, expenses, and reconciliation",
              "Premium public, auth, and dashboard shells already aligned",
              "Built to transition into live APIs and real auth in the next phase",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 text-sm leading-7 text-white/80"
              >
                <BadgeCheck className="mr-3 inline h-4 w-4 text-[var(--accent)]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
