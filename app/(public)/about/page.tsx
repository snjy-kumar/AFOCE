export default function AboutPage() {
  return (
    <section className="px-4 pb-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="animated-rise">
            <div className="eyebrow">About AFOCE</div>
            <h1 className="display mt-6 text-5xl leading-none tracking-[-0.05em] sm:text-6xl">
              Built at the intersection of modern product taste and local compliance depth.
            </h1>
            <p className="mt-6 text-base leading-8 text-[var(--ink-soft)]">
              AFOCE exists because Nepali SMEs should not have to choose between beautiful,
              modern software and finance logic that actually respects how their business is
              regulated.
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                title: "What we reject",
                body: "Static ledgers, desktop-era interfaces, accounting flows that assume the user is already an expert, and products that localize only at the surface level.",
              },
              {
                title: "What we build instead",
                body: "An operating layer where invoices, expenses, tax context, approvals, and owner visibility live together. Workflow intelligence is treated as product infrastructure.",
              },
              {
                title: "How this prototype is framed",
                body: "The current implementation is a full mock-data product shell. It is intentionally structured for a second phase where auth, persistence, integrations, and live APIs can be connected without rethinking the UX model.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[2rem] surface p-7">
                <div className="text-2xl font-semibold tracking-[-0.04em]">{item.title}</div>
                <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
