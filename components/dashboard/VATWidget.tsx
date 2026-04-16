import { cn } from "@/lib/utils";
import { ProgressBar } from "./MetricChart";

interface VATWidgetProps {
  outputTax: string;
  inputTax: string;
  netPayable: string;
  month: string;
  dueDays?: number;
  loading?: boolean;
}

export function VATWidget({
  outputTax,
  inputTax,
  netPayable,
  month,
  dueDays = 4,
  loading = false,
}: VATWidgetProps) {
  const outputNum = parseFloat(outputTax.replace(/[Rs.,]/g, ""));
  const inputNum = parseFloat(inputTax.replace(/[Rs.,]/g, ""));
  const total = outputNum + inputNum;
  const progress = total > 0 ? (outputNum / total) * 100 : 50;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--ink)]">VAT Summary</h3>
          <p className="text-sm text-[var(--ink-soft)]">{month}</p>
        </div>
        <div
          className={cn(
            "rounded-lg px-3 py-1.5 text-right",
            progress > 75 ? "bg-[var(--accent)]/10" : "bg-[var(--brand-2)]/10"
          )}
        >
          <div
            className={cn(
              "text-lg font-bold",
              progress > 75 ? "text-[var(--accent)]" : "text-[var(--brand-2)]"
            )}
          >
            {netPayable}
          </div>
          <div className="text-xs text-[var(--ink-soft)]">
            {dueDays} days to pay
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-8 w-full animate-pulse rounded-lg bg-[var(--border)]" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-[var(--border)]" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink-soft)]">Output Tax</span>
              <span className="font-semibold text-[var(--ink)]">{outputTax}</span>
            </div>
            <ProgressBar
              label=""
              value={outputNum}
              total={total}
              color="bg-[var(--brand)]"
              showPercentage={false}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink-soft)]">Input Tax</span>
              <span className="font-semibold text-[var(--ink)]">{inputTax}</span>
            </div>
            <ProgressBar
              label=""
              value={inputNum}
              total={total}
              color="bg-[var(--brand-2)]"
              showPercentage={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}