import { auditTrail, reportCards, vatSummary } from "@/lib/mock-data";

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <section className="dashboard-panel rounded-[2rem] p-7">
        <div className="eyebrow">Reports &amp; VAT</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
          Boardroom-ready reporting with tax state already surfaced.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--ink-soft)]">
          The reporting layer keeps finance outcomes and tax obligations close together so the
          month-close picture is usable before spreadsheet export.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {reportCards.map((card) => (
            <div key={card.title} className="metric-card">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
                {card.title}
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
                {card.value}
              </div>
              <div className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{card.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="dashboard-panel-dark rounded-[2rem] p-7 text-white">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-white/50">
            VAT summary
          </div>
          <div className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{vatSummary.month}</div>
          <div className="mt-6 space-y-4">
            {[
              { label: "Output tax", value: vatSummary.outputTax },
              { label: "Input tax", value: vatSummary.inputTax },
              { label: "Net payable", value: vatSummary.netPayable },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.45rem] border border-white/10 bg-white/6 p-4">
                <div className="text-sm text-white/58">{item.label}</div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel rounded-[2rem] p-7">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
            Immutable log trail
          </div>
          <div className="mt-6 space-y-4">
            {auditTrail.map((entry) => (
              <div key={entry.action} className="rounded-[1.5rem] border border-[var(--border)] bg-white/72 p-5">
                <div className="text-sm font-semibold text-[var(--ink)]">{entry.actor}</div>
                <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--ink)]">
                  {entry.action}
                </div>
                <div className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{entry.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
