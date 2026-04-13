import { actionQueues } from "@/lib/mock-data";

export default function QueuesPage() {
  return (
    <section className="dashboard-panel rounded-[2rem] p-7">
      <div className="eyebrow">Queues</div>
      <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
        A single place to review what is blocked, delayed, or waiting on approval.
      </h1>

      <div className="mt-8 grid gap-4">
        {actionQueues.map((item) => (
          <div key={item.title} className="rounded-[1.7rem] border border-[var(--border)] bg-white/72 p-5">
            <div className="text-xl font-semibold tracking-[-0.03em] text-[var(--ink)]">{item.title}</div>
            <div className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              {item.count} | Responsible function: {item.owner}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
