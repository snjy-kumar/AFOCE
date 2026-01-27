/**
 * Bikram Sambat (BS) / Nepali Calendar Utilities
 * 
 * This module provides comprehensive Nepali calendar support including:
 * - AD to BS conversion and vice versa
 * - Nepali month/day names
 * - Date formatting in Nepali
 * - Fiscal year calculations (Nepal's fiscal year starts Shrawan 1)
 */

// Nepali month names
export const NEPALI_MONTHS = {
  en: ['Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 
       'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'],
  ne: ['बैशाख', 'जेठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
       'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र']
};

export const NEPALI_DAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  short_en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ne: ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'],
  short_ne: ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि']
};

// Nepali digits
const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

// Days in each month for BS years from 2000 to 2099
// This is the essential lookup table for BS calendar
const BS_CALENDAR_DATA: Record<number, number[]> = {
  2000: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2023: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2024: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2025: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2027: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2029: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2030: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2031: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2036: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2037: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2039: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2041: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2042: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2043: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2045: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2047: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2048: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2049: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2051: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2054: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2055: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2056: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2057: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2058: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2060: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2061: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2062: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
  2063: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2064: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2065: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2066: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2067: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2068: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2069: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2070: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2082: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2083: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2091: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2092: [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2093: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2094: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2095: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
  2096: [30, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2097: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2098: [31, 31, 32, 31, 31, 31, 29, 30, 29, 30, 29, 31],
  2099: [31, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30, 30],
};

// Reference date: 2000/01/01 BS = 1943/04/14 AD
const BS_EPOCH = { year: 2000, month: 1, day: 1 };
const AD_EPOCH = new Date(1943, 3, 14); // April 14, 1943

export interface NepaliDate {
  year: number;
  month: number; // 1-12
  day: number;
}

export interface FormattedNepaliDate {
  bs: NepaliDate;
  ad: Date;
  formatted: {
    short: string;  // 2082/10/12
    long: string;   // 12 Magh 2082
    nepali: string; // १२ माघ २०८२
    relative: string; // Today, Yesterday, 3 days ago
  };
  monthName: {
    en: string;
    ne: string;
  };
  dayName: {
    en: string;
    ne: string;
  };
}

/**
 * Get total days in a BS year
 */
function getTotalDaysInBSYear(year: number): number {
  const monthDays = BS_CALENDAR_DATA[year];
  if (!monthDays) {
    throw new Error(`BS year ${year} is out of supported range (2000-2099)`);
  }
  return monthDays.reduce((sum, days) => sum + days, 0);
}

/**
 * Get days in a specific BS month
 */
export function getDaysInBSMonth(year: number, month: number): number {
  const monthDays = BS_CALENDAR_DATA[year];
  if (!monthDays) {
    throw new Error(`BS year ${year} is out of supported range (2000-2099)`);
  }
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  return monthDays[month - 1];
}

/**
 * Convert number to Nepali numerals
 */
export function toNepaliNumeral(num: number | string): string {
  return String(num).split('').map(char => {
    const digit = parseInt(char, 10);
    return isNaN(digit) ? char : NEPALI_DIGITS[digit];
  }).join('');
}

/**
 * Convert Nepali numerals to regular numbers
 */
export function fromNepaliNumeral(str: string): string {
  return str.split('').map(char => {
    const index = NEPALI_DIGITS.indexOf(char);
    return index !== -1 ? String(index) : char;
  }).join('');
}

/**
 * Convert AD date to BS date
 */
export function adToBS(adDate: Date): NepaliDate {
  // Calculate days difference from epoch
  const diffTime = adDate.getTime() - AD_EPOCH.getTime();
  let totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let bsYear = BS_EPOCH.year;
  let bsMonth = BS_EPOCH.month;
  let bsDay = BS_EPOCH.day;
  
  // Add the days
  totalDays += bsDay - 1;
  
  while (totalDays >= 0) {
    const daysInMonth = getDaysInBSMonth(bsYear, bsMonth);
    if (totalDays < daysInMonth) {
      bsDay = totalDays + 1;
      break;
    }
    totalDays -= daysInMonth;
    bsMonth++;
    if (bsMonth > 12) {
      bsMonth = 1;
      bsYear++;
    }
  }
  
  return { year: bsYear, month: bsMonth, day: bsDay };
}

/**
 * Convert BS date to AD date
 */
export function bsToAD(bsDate: NepaliDate): Date {
  let totalDays = 0;
  
  // Add days from BS epoch year to target year
  for (let year = BS_EPOCH.year; year < bsDate.year; year++) {
    totalDays += getTotalDaysInBSYear(year);
  }
  
  // Add days from start of target year to target month
  for (let month = 1; month < bsDate.month; month++) {
    totalDays += getDaysInBSMonth(bsDate.year, month);
  }
  
  // Add remaining days
  totalDays += bsDate.day - BS_EPOCH.day;
  
  // Add to AD epoch
  const result = new Date(AD_EPOCH);
  result.setDate(result.getDate() + totalDays);
  return result;
}

/**
 * Get current BS date
 */
export function getCurrentBSDate(): NepaliDate {
  return adToBS(new Date());
}

/**
 * Format BS date in various formats
 */
export function formatBSDate(bsDate: NepaliDate, format: 'short' | 'long' | 'nepali' = 'short', language: 'en' | 'ne' = 'en'): string {
  const { year, month, day } = bsDate;
  const monthNames = NEPALI_MONTHS[language];
  
  switch (format) {
    case 'short':
      if (language === 'ne') {
        return `${toNepaliNumeral(year)}/${toNepaliNumeral(month.toString().padStart(2, '0'))}/${toNepaliNumeral(day.toString().padStart(2, '0'))}`;
      }
      return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
    
    case 'long':
      if (language === 'ne') {
        return `${toNepaliNumeral(day)} ${monthNames[month - 1]} ${toNepaliNumeral(year)}`;
      }
      return `${day} ${monthNames[month - 1]} ${year}`;
    
    case 'nepali':
      return `${toNepaliNumeral(day)} ${NEPALI_MONTHS.ne[month - 1]} ${toNepaliNumeral(year)}`;
    
    default:
      return `${year}/${month}/${day}`;
  }
}

/**
 * Get relative date string
 */
function getRelativeDateString(date: Date, language: 'en' | 'ne' = 'en'): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  
  if (language === 'ne') {
    if (diffDays === 0) return 'आज';
    if (diffDays === 1) return 'हिजो';
    if (diffDays === -1) return 'भोलि';
    if (diffDays > 1 && diffDays <= 7) return `${toNepaliNumeral(diffDays)} दिन पहिले`;
    if (diffDays < -1 && diffDays >= -7) return `${toNepaliNumeral(Math.abs(diffDays))} दिन पछि`;
  } else {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays < -1 && diffDays >= -7) return `in ${Math.abs(diffDays)} days`;
  }
  
  return '';
}

/**
 * Get comprehensive formatted date information
 */
export function getFormattedNepaliDate(date: Date | string, language: 'en' | 'ne' = 'en'): FormattedNepaliDate {
  const adDate = typeof date === 'string' ? new Date(date) : date;
  const bs = adToBS(adDate);
  const dayOfWeek = adDate.getDay();
  
  return {
    bs,
    ad: adDate,
    formatted: {
      short: formatBSDate(bs, 'short', language),
      long: formatBSDate(bs, 'long', language),
      nepali: formatBSDate(bs, 'nepali'),
      relative: getRelativeDateString(adDate, language),
    },
    monthName: {
      en: NEPALI_MONTHS.en[bs.month - 1],
      ne: NEPALI_MONTHS.ne[bs.month - 1],
    },
    dayName: {
      en: NEPALI_DAYS.en[dayOfWeek],
      ne: NEPALI_DAYS.ne[dayOfWeek],
    },
  };
}

/**
 * Get Nepal fiscal year for a given date
 * Nepal's fiscal year runs from Shrawan 1 (mid-July) to Ashadh end
 */
export function getNepFiscalYear(date: Date | NepaliDate): { start: NepaliDate; end: NepaliDate; label: string } {
  const bs = 'year' in date ? date : adToBS(date);
  
  // Fiscal year starts on Shrawan 1 (month 4)
  // If we're before Shrawan, we're in the previous fiscal year
  const fiscalYearStart = bs.month < 4 ? bs.year - 1 : bs.year;
  
  return {
    start: { year: fiscalYearStart, month: 4, day: 1 },
    end: { year: fiscalYearStart + 1, month: 3, day: getDaysInBSMonth(fiscalYearStart + 1, 3) },
    label: `${fiscalYearStart}/${(fiscalYearStart + 1).toString().slice(-2)}`,
  };
}

/**
 * Get VAT period (monthly) for Nepal
 */
export function getVatPeriod(date: Date | NepaliDate): { start: NepaliDate; end: NepaliDate; label: string } {
  const bs = 'year' in date ? date : adToBS(date);
  const daysInMonth = getDaysInBSMonth(bs.year, bs.month);
  
  return {
    start: { year: bs.year, month: bs.month, day: 1 },
    end: { year: bs.year, month: bs.month, day: daysInMonth },
    label: `${NEPALI_MONTHS.en[bs.month - 1]} ${bs.year}`,
  };
}

/**
 * Validate BS date
 */
export function isValidBSDate(date: NepaliDate): boolean {
  try {
    if (date.year < 2000 || date.year > 2099) return false;
    if (date.month < 1 || date.month > 12) return false;
    const daysInMonth = getDaysInBSMonth(date.year, date.month);
    if (date.day < 1 || date.day > daysInMonth) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse BS date string (YYYY/MM/DD or YYYY-MM-DD)
 */
export function parseBSDate(dateStr: string): NepaliDate | null {
  // Convert Nepali numerals if present
  const normalized = fromNepaliNumeral(dateStr);
  const match = normalized.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  
  if (!match) return null;
  
  const date: NepaliDate = {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  };
  
  return isValidBSDate(date) ? date : null;
}

/**
 * Add days/months/years to BS date
 */
export function addToBSDate(date: NepaliDate, amount: number, unit: 'day' | 'month' | 'year'): NepaliDate {
  const adDate = bsToAD(date);
  
  switch (unit) {
    case 'day':
      adDate.setDate(adDate.getDate() + amount);
      break;
    case 'month':
      adDate.setMonth(adDate.getMonth() + amount);
      break;
    case 'year':
      adDate.setFullYear(adDate.getFullYear() + amount);
      break;
  }
  
  return adToBS(adDate);
}

/**
 * Get difference between two BS dates in days
 */
export function diffBSDates(date1: NepaliDate, date2: NepaliDate): number {
  const ad1 = bsToAD(date1);
  const ad2 = bsToAD(date2);
  return Math.round((ad1.getTime() - ad2.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Compare two BS dates
 * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareBSDates(date1: NepaliDate, date2: NepaliDate): -1 | 0 | 1 {
  if (date1.year !== date2.year) return date1.year < date2.year ? -1 : 1;
  if (date1.month !== date2.month) return date1.month < date2.month ? -1 : 1;
  if (date1.day !== date2.day) return date1.day < date2.day ? -1 : 1;
  return 0;
}

export default {
  adToBS,
  bsToAD,
  getCurrentBSDate,
  formatBSDate,
  getFormattedNepaliDate,
  getDaysInBSMonth,
  toNepaliNumeral,
  fromNepaliNumeral,
  getNepFiscalYear,
  getVatPeriod,
  isValidBSDate,
  parseBSDate,
  addToBSDate,
  diffBSDates,
  compareBSDates,
  NEPALI_MONTHS,
  NEPALI_DAYS,
};
