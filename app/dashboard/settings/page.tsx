export default function SettingsPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="dashboard-panel rounded-[2rem] p-7">
        <div className="eyebrow">Workspace settings</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
          Configure fiscal identity, policy defaults, and approval ownership.
        </h1>
        <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
          This is a mock configuration layer prepared for real persistence. The goal is to show
          how finance administration can stay structured and legible.
        </p>
      </section>

      <section className="dashboard-panel rounded-[2rem] p-7">
        <div className="space-y-4">
          {[
            "Business PAN and legal entity profile",
            "Fiscal year defaults and BS reporting periods",
            "Approval thresholds by role and category",
            "Receipt rules and expense policy text",
          ].map((item) => (
            <div key={item} className="rounded-[1.5rem] border border-[var(--border)] bg-white/72 p-5 text-sm leading-7 text-[var(--ink-soft)]">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
