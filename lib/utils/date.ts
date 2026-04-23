// ============================================================
// Date Utilities for Nepali (Bikram Sambat) and AD conversion
// Using miti-pariwartan for accurate BS/AD conversion
// ============================================================

import { convertAdToBs, convertBsToAd } from "miti-pariwartan";

/**
 * Bikram Sambat month names (Nepali)
 */
export const BS_MONTHS = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
] as const;

/**
 * Convert BS date string (e.g. "Baisakh 2081") to AD Date object.
 */
export function bsToAdDate(bsDateStr: string): Date | null {
  const match = bsDateStr.match(/^(\w+)\s+(\d{4})$/);
  if (!match) return null;

  const [, monthName, yearStr] = match;
  const monthIdx = BS_MONTHS.indexOf(monthName as typeof BS_MONTHS[number]);
  if (monthIdx === -1) return null;

  const bsYear = parseInt(yearStr, 10);
  const bsMonth = monthIdx + 1; // miti-pariwartan uses 1-12
  const bsDay = 1; // default to first day

  const result = convertBsToAd({ year: bsYear, month: bsMonth, day: bsDay });
  return new Date(result.input);
}

/**
 * Convert BS date with day (e.g., "Baisakh 14, 2081") to AD Date
 */
export function bsToAdDateWithDay(bsDateStr: string): Date | null {
  // Handle formats like "Baisakh 14, 2081" or "Baisakh 2081"
  const match = bsDateStr.match(/^(\w+)\s+(\d{1,2}),?\s*(\d{4})$/);
  if (!match) return bsToAdDate(bsDateStr);

  const [, monthName, dayStr, yearStr] = match;
  const monthIdx = BS_MONTHS.indexOf(monthName as typeof BS_MONTHS[number]);
  if (monthIdx === -1) return null;

  const bsYear = parseInt(yearStr, 10);
  const bsMonth = monthIdx + 1;
  const bsDay = parseInt(dayStr, 10);

  const result = convertBsToAd({ year: bsYear, month: bsMonth, day: bsDay });
  return new Date(result.input);
}

/**
 * Convert AD Date to BS date string (e.g. "Baisakh 2081")
 */
export function adToBsDate(adDate: Date): string {
  const result = convertAdToBs(adDate);
  return `${result.month.en} ${result.year.en}`;
}

/**
 * Convert AD Date to BS date with day (e.g., "Baisakh 14, 2081")
 */
export function adToBsDateWithDay(adDate: Date): string {
  const result = convertAdToBs(adDate);
  return `${result.month.en} ${result.day.en}, ${result.year.en}`;
}

/**
 * Format BS date for display
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
 * Get current BS date string
 */
export function getCurrentBsDate(): string {
  return adToBsDate(new Date());
}

/**
 * Get current BS date with day
 */
export function getCurrentBsDateWithDay(): string {
  return adToBsDateWithDay(new Date());
}

/**
 * Get current BS year
 */
export function getCurrentBsYear(): number {
  const result = convertAdToBs(new Date());
  return parseInt(result.year.en, 10);
}

/**
 * Get current BS month
 */
export function getCurrentBsMonth(): string {
  const result = convertAdToBs(new Date());
  return result.month.en;
}

/**
 * Get current BS day
 */
export function getCurrentBsDay(): number {
  const result = convertAdToBs(new Date());
  return parseInt(result.day.en, 10);
}