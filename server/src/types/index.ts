/**
 * Shared TypeScript types for the API
 */

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

// Pagination params
export interface PaginationParams {
    page: number;
    limit: number;
}

// Sort params
export interface SortParams {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

// JWT Payload
export interface JwtPayload {
    userId: string;
    email: string;
    roles?: string[]; // RBAC roles
    iat?: number;
    exp?: number;
}

// Authenticated Request (extends Express Request)
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

// Invoice status values
export const INVOICE_STATUS = {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    PAID: 'PAID',
    PARTIALLY_PAID: 'PARTIALLY_PAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED',
} as const;

export type InvoiceStatusType = keyof typeof INVOICE_STATUS;

// Account type values
export const ACCOUNT_TYPE = {
    ASSET: 'ASSET',
    LIABILITY: 'LIABILITY',
    EQUITY: 'EQUITY',
    INCOME: 'INCOME',
    EXPENSE: 'EXPENSE',
} as const;

export type AccountTypeValue = keyof typeof ACCOUNT_TYPE;

// Sync status for offline-first
export const SYNC_STATUS = {
    SYNCED: 'synced',
    PENDING: 'pending',
    ERROR: 'error',
} as const;

export type SyncStatusType = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];

// VAT constants for Nepal
export const VAT_RATE = 13.00; // 13% VAT rate in Nepal
