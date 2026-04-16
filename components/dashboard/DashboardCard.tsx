import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function DashboardCard({
  title,
  subtitle,
  action,
  children,
  className,
  noPadding = false,
}: DashboardCardProps) {
  return (
    <div className={cn("rounded-2xl border border-[var(--border)] bg-white", className)}>
      <div className={cn("flex items-center justify-between border-b border-[var(--border)] px-6 py-4", noPadding && "px-0 py-0")}>
        <div>
          <h2 className="font-semibold text-[var(--ink)]">{title}</h2>
          {subtitle && <p className="text-sm text-[var(--ink-soft)]">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={noPadding ? "" : "divide-y divide-[var(--border)]"}>{children}</div>
    </div>
  );
}