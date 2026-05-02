// ============================================================
// VAT Calculation Utilities
// 13% VAT per IRD Nepal guidelines
// ============================================================

import type { InvoiceRecord, ExpenseRecord } from "@/lib/types";

export const VAT_RATE = 0.13;

/**
 * Calculate VAT amount from a base amount.
 * Rounds to nearest rupee per IRD rounding rules.
 */
export function calculateVAT(amount: number): number {
  return Math.round(amount * VAT_RATE);
}

/**
 * Calculate gross amount (base + VAT).
 */
export function calculateGross(amount: number): number {
  return amount + calculateVAT(amount);
}

/**
 * Calculate net from gross (reverse VAT).
 */
export function calculateNetFromGross(gross: number): number {
  return Math.round(gross / (1 + VAT_RATE));
}

/**
 * Extract VAT portion from gross amount.
 */
export function extractVATFromGross(gross: number): number {
  return gross - calculateNetFromGross(gross);
}

/**
 * Format number as Nepali currency (NPR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Check if a date falls within a period
 */
function isInPeriod(date: string, from: string, to: string): boolean {
  const dateTime = new Date(date).getTime();
  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime();
  return dateTime >= fromTime && dateTime <= toTime;
}

/**
 * Calculate filing due date for a period
 */
export function calculateFilingDue(period: { from: string; to: string }): string {
  const endDate = new Date(period.to);
  // VAT filing due 20 days after period end
  endDate.setDate(endDate.getDate() + 20);
  return endDate.toISOString().split("T")[0];
}

/**
 * Generate comprehensive VAT report for a period
 */
export interface VATReport {
  period: {
    from: string;
    to: string;
  };
  outputVAT: number;
  inputVAT: number;
  netVAT: number;
  filingDue: string;
  invoiceCount: number;
  expenseCount: number;
  details: {
    invoices: {
      total: number;
      vatAmount: number;
    };
    expenses: {
      total: number;
      vatAmount: number;
    };
  };
}

export function generateVATReport(
  invoices: Array<{ amount?: number; ad_date: string }>,
  expenses: Array<{ amount?: number; ad_date: string }>,
  period: { from: string; to: string }
): VATReport {
  // Filter records within period
  const periodInvoices = invoices.filter((inv) =>
    isInPeriod(inv.ad_date, period.from, period.to)
  );

  const periodExpenses = expenses.filter((exp) =>
    isInPeriod(exp.ad_date, period.from, period.to)
  );

  // Calculate output VAT (from invoices)
  const invoiceTotal = periodInvoices.reduce(
    (sum, inv) => sum + (inv.amount || 0),
    0
  );
  const outputVAT = calculateVAT(invoiceTotal);

  // Calculate input VAT (from expenses)
  const expenseTotal = periodExpenses.reduce(
    (sum, exp) => sum + (exp.amount || 0),
    0
  );
  const inputVAT = calculateVAT(expenseTotal);

  // Calculate net VAT
  const netVAT = outputVAT - inputVAT;

  return {
    period,
    outputVAT,
    inputVAT,
    netVAT,
    filingDue: calculateFilingDue(period),
    invoiceCount: periodInvoices.length,
    expenseCount: periodExpenses.length,
    details: {
      invoices: {
        total: invoiceTotal,
        vatAmount: outputVAT,
      },
      expenses: {
        total: expenseTotal,
        vatAmount: inputVAT,
      },
    },
  };
}

/**
 * Calculate monthly VAT aggregation
 */
export interface MonthlyVAT {
  month: string;
  year: number;
  outputVAT: number;
  inputVAT: number;
  netVAT: number;
  filingDue: string;
}

export function getMonthlyVATData(
  invoices: Array<{ amount?: number; ad_date: string }>,
  expenses: Array<{ amount?: number; ad_date: string }>
): MonthlyVAT[] {
  const months = new Map<string, MonthlyVAT>();

  // Process invoices
  for (const invoice of invoices) {
    const date = new Date(invoice.ad_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;

    if (!months.has(key)) {
      months.set(key, {
        month: key,
        year,
        outputVAT: 0,
        inputVAT: 0,
        netVAT: 0,
        filingDue: "",
      });
    }

    const monthData = months.get(key)!;
    monthData.outputVAT += calculateVAT(invoice.amount || 0);
  }

  // Process expenses
  for (const expense of expenses) {
    const date = new Date(expense.ad_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;

    if (!months.has(key)) {
      months.set(key, {
        month: key,
        year,
        outputVAT: 0,
        inputVAT: 0,
        netVAT: 0,
        filingDue: "",
      });
    }

    const monthData = months.get(key)!;
    monthData.inputVAT += calculateVAT(expense.amount || 0);
  }

  // Calculate net VAT and filing due for all months
  const result = Array.from(months.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  for (const monthData of result) {
    monthData.netVAT = monthData.outputVAT - monthData.inputVAT;
    // Estimate filing due as last day of following month
    const [yearStr, monthStr] = monthData.month.split("-");
    const nextMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0);
    nextMonth.setDate(nextMonth.getDate() + 20);
    monthData.filingDue = nextMonth.toISOString().split("T")[0];
  }

  return result;
}
