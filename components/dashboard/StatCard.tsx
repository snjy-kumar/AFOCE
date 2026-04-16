import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type TrendType = "up" | "down" | "warning" | "neutral";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: TrendType;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  color = "text-[var(--ink)]",
  bgColor = "bg-[var(--brand)]/10",
  loading = false,
}: StatCardProps) {
  const trendColors: Record<TrendType, string> = {
    up: "bg-[var(--brand-2)]/10 text-[var(--brand-2)]",
    down: "bg-[var(--danger)]/10 text-[var(--danger)]",
    warning: "bg-[var(--accent)]/10 text-[var(--accent)]",
    neutral: "bg-[var(--ink-soft)]/10 text-[var(--ink-soft)]",
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            bgColor
          )}
        >
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        {change && trend !== "neutral" && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trendColors[trend]
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "warning" && "⚠"}
            {change}
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-4 h-8 w-24 animate-pulse rounded-lg bg-[var(--border)]" />
      ) : (
        <div className="mt-4 text-2xl font-semibold text-[var(--ink)]">{value}</div>
      )}
      <div className="mt-1 text-sm text-[var(--ink-soft)]">{label}</div>
      {change && trend === "neutral" && (
        <div className="mt-2 text-xs text-[var(--ink-soft)]">{change}</div>
      )}
    </div>
  );
}