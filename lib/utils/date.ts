// ============================================================
// Date Utilities for Nepali (Bikram Sambat) and AD conversion
// AFOCE operates in Nepal - BS dates for display, AD for storage
// ============================================================

/**
 * Bikram Sambat month names (Nepali)
 */
export const BS_MONTHS = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
] as const;

/**
 * BS month lengths (approx) - leap years differ
 * Standard year: 30/31/32 day months
 */
export const BS_MONTH_DAYS: Record<number, number[]> = {
  // Keyed by BS year, stored as fallback
};

// Default BS year data (BS 2081/82 - approximate)
export const BS_2081_MONTH_DAYS = [30, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30];
export const BS_2082_MONTH_DAYS = [30, 31, 32, 31, 32, 30, 30, 30, 29, 30, 29, 30];

/**
 * Convert BS date string (e.g. "Baisakh 2081") to AD Date object.
 * Uses hardcoded BS↔AD offset since no library.
 * BS 2081 starts approx April 2024.
 */
export function bsToAdDate(bsDateStr: string): Date | null {
  const match = bsDateStr.match(/^(\w+)\s+(\d{4})$/);
  if (!match) return null;

  const [, monthName, yearStr] = match;
  const monthIdx = BS_MONTHS.indexOf(monthName as typeof BS_MONTHS[number]);
  if (monthIdx === -1) return null;

  const bsYear = parseInt(yearStr, 10);
  const bsMonth = monthIdx;

  // BS 2081 starts ~April 14, 2024
  // Each BS year = 365 or 366 days (roughly)
  const BS_2081_START = new Date("2024-04-14");

  // Calculate days offset from BS 2081
  const baseYear = 2081;
  const baseAdYear = 2024;

  let totalDays = 0;
  for (let y = baseYear; y < bsYear; y++) {
    totalDays += y % 4 === 0 ? 366 : 365;
  }

  const monthDays = bsYear === 2081 ? BS_2081_MONTH_DAYS : BS_2082_MONTH_DAYS;
  for (let m = 0; m < bsMonth; m++) {
    totalDays += monthDays[m];
  }

  const adDate = new Date(BS_2081_START);
  adDate.setDate(adDate.getDate() + totalDays);
  return adDate;
}

/**
 * Convert AD Date to BS date string (e.g. "Baisakh 2081")
 */
export function adToBsDate(adDate: Date): string {
  // Approximate conversion
  const adYear = adDate.getFullYear();
  const adMonth = adDate.getMonth(); // 0-indexed

  // Offset: AD 2024-04 = BS 2081 Baisakh
  let bsYear = adYear - 2024 + 2081;
  let bsMonth = adMonth - 3; // April (3) = Baisakh (0)

  if (bsMonth < 0) {
    bsMonth += 12;
    bsYear -= 1;
  }

  return `${BS_MONTHS[bsMonth]} ${bsYear}`;
}

/**
 * Format BS date for display (e.g. "Baisakh 2081" → "Baishakh 2081" or keep as-is)
 */
export function formatBsDate(bsDateStr: string): string {
  return bsDateStr;
}

/**
 * Parse a BS date string and return an AD date string for storage
 */
export function parseBsDateForStorage(bsDateStr: string): string {
  const adDate = bsToAdDate(bsDateStr);
  return adDate ? adDate.toISOString().split("T")[0] : "";
}

/**
 * Check if a date string is overdue (adDate + dueDays < today)
 */
export function isOverdue(adDateStr: string, dueDays: number): boolean {
  const adDate = new Date(adDateStr);
  const dueDate = new Date(adDate);
  dueDate.setDate(dueDate.getDate() + dueDays);
  return dueDate < new Date();
}

/**
 * Get current BS date string (approximate)
 */
export function getCurrentBsDate(): string {
  return adToBsDate(new Date());
}
