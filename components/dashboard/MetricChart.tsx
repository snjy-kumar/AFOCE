"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface MetricChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
}

export function MetricChart({ data, title, height = 120 }: MetricChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value)), [data]);
  
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  return (
    <div className="space-y-4">
      {title && (
        <div className="text-sm font-medium text-[var(--ink-soft)]">{title}</div>
      )}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const share = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
          
          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full flex-1 flex items-end">
                <div
                  className={cn(
                    "w-full rounded-t-lg transition-all duration-500",
                    item.color || "bg-[var(--brand)]"
                  )}
                  style={{ height: `${percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-[var(--ink-soft)]">{item.label}</span>
              <span className="text-xs font-semibold text-[var(--ink)]">{share}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  label,
  value,
  total,
  color = "bg-[var(--brand)]",
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--ink-soft)]">{label}</span>
        {showPercentage && (
          <span className="text-sm font-semibold text-[var(--ink)]">
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}