import { clsx, type ClassValue } from 'clsx';
import { adToBS, formatBSDate, toNepaliNumeral } from './nepaliDate';

function getStoredLanguage(): 'en' | 'ne' {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
    return stored === 'ne' ? 'ne' : 'en';
}

function getUseBikramSambat(): boolean {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('useBikramSambat') : null;
    return stored === 'true';
}

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

// Format currency in Nepali Rupees
export function formatCurrency(amount: number): string {
    const language = getStoredLanguage();
    const formatted = new Intl.NumberFormat('en-NP', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    if (language === 'ne') {
        return `रु ${toNepaliNumeral(formatted)}`;
    }

    return `NPR ${formatted}`;
}

// Format number with Nepali locale
export function formatNumber(num: number): string {
    const language = getStoredLanguage();
    const formatted = new Intl.NumberFormat('en-NP').format(num);
    return language === 'ne' ? toNepaliNumeral(formatted) : formatted;
}

// Format date
export function formatDate(date: string | Date, format: 'short' | 'long' | 'iso' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const language = getStoredLanguage();
    const useBikramSambat = getUseBikramSambat();

    if (useBikramSambat) {
        const bs = adToBS(d);
        return formatBSDate(bs, format === 'long' ? 'long' : 'short', language);
    }

    switch (format) {
        case 'long':
            return d.toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-NP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        case 'iso':
            return d.toISOString().split('T')[0];
        default:
            return d.toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-NP', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
    }
}

// Format date for input fields
export function formatDateForInput(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
}

// Calculate VAT
export function calculateVat(amount: number, vatRate: number = 13): {
    subtotal: number;
    vatAmount: number;
    total: number;
} {
    const vatAmount = (amount * vatRate) / 100;
    return {
        subtotal: amount,
        vatAmount,
        total: amount + vatAmount,
    };
}

// Get status badge color
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        DRAFT: 'badge-info',
        SENT: 'badge-warning',
        PAID: 'badge-success',
        PARTIALLY_PAID: 'badge-warning',
        OVERDUE: 'badge-danger',
        CANCELLED: 'badge-danger',
        PENDING: 'badge-warning',
        FILED: 'badge-info',
    };
    return colors[status] || 'badge-info';
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// Generate invoice number
export function generateInvoiceNumber(lastNumber?: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const prefix = `INV-${year}`;

    if (!lastNumber) {
        return `${prefix}-0001`;
    }

    const parts = lastNumber.split('-');
    const sequence = parseInt(parts[2] || '0', 10) + 1;
    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
}

// Truncate text
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

// Capitalize first letter
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Check if object is empty
export function isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

// Get initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Download file from URL
export function downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
