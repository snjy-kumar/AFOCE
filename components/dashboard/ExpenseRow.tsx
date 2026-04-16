import type { ExpenseRecord } from "@/lib/services/mock-finance-service";
import { AlertCircle, CheckCircle, Clock, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  { icon: typeof Clock; bg: string; color: string; label: string }
> = {
  "Pending approval": {
    icon: Clock,
    bg: "bg-[var(--accent)]/10",
    color: "text-[var(--accent)]",
    label: "Pending",
  },
  "Manager review": {
    icon: Clock,
    bg: "bg-[var(--brand)]/10",
    color: "text-[var(--brand)]",
    label: "Review",
  },
  Blocked: {
    icon: FileWarning,
    bg: "bg-[var(--danger)]/10",
    color: "text-[var(--danger)]",
    label: "Blocked",
  },
  Approved: {
    icon: CheckCircle,
    bg: "bg-[var(--brand-2)]/10",
    color: "text-[var(--brand-2)]",
    label: "Approved",
  },
  Rejected: {
    icon: AlertCircle,
    bg: "bg-[var(--danger)]/10",
    color: "text-[var(--danger)]",
    label: "Rejected",
  },
};

interface ExpenseRowProps {
  expense: ExpenseRecord;
}

export function ExpenseRow({ expense }: ExpenseRowProps) {
  const { icon: Icon, bg, color, label } =
    statusConfig[expense.status] || statusConfig["Pending approval"];

  return (
    <div className="flex items-center justify-between px-6 py-4 transition hover:bg-[var(--bg-elevated)]">
      <div className="flex items-start gap-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--ink)]">{expense.id}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                bg,
                color
              )}
            >
              {label}
            </span>
          </div>
          <div className="mt-1 text-sm text-[var(--ink-soft)]">
            {expense.employee} · {expense.category}
          </div>
          <div className="mt-0.5 text-xs text-[var(--ink-soft)]">{expense.policy}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-[var(--ink)]">{expense.amount}</div>
        <div className="mt-1 text-xs text-[var(--ink-soft)]">{expense.bsDate}</div>
        <div
          className={cn(
            "mt-1 text-xs",
            expense.receipt === "Attached"
              ? "text-[var(--brand-2)]"
              : "text-[var(--danger)]"
          )}
        >
          {expense.receipt}
        </div>
      </div>
    </div>
  );
}