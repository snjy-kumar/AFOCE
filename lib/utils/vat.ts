// ============================================================
// VAT Calculation Utilities
// 13% VAT per IRD Nepal guidelines
// ============================================================

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
