import { z } from 'zod';

/**
 * Bank Account & Transaction Validation Schemas
 */

// Bank Account schemas
export const createBankAccountSchema = z.object({
    name: z.string().min(1, 'Account name is required').max(100),
    bankName: z.string().max(100).optional(),
    accountNumber: z.string().max(50).optional(),
    openingBalance: z.number().default(0),
});

export const updateBankAccountSchema = createBankAccountSchema.partial();

// Bank Transaction schemas
export const createTransactionSchema = z.object({
    bankAccountId: z.string().uuid('Invalid bank account ID'),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    description: z.string().min(1, 'Description is required').max(500),
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['debit', 'credit']),
    notes: z.string().max(1000).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial().omit({ bankAccountId: true });

// Reconciliation schema
export const reconcileTransactionSchema = z.object({
    invoiceId: z.string().uuid().optional().nullable(),
    expenseId: z.string().uuid().optional().nullable(),
    notes: z.string().max(1000).optional(),
});

// Bulk import schema (for CSV imports)
export const bulkImportTransactionsSchema = z.object({
    bankAccountId: z.string().uuid('Invalid bank account ID'),
    transactions: z.array(z.object({
        date: z.string(),
        description: z.string(),
        amount: z.number(),
        type: z.enum(['debit', 'credit']),
    })).min(1, 'At least one transaction is required'),
});

// Query params
export const bankQuerySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    reconciled: z.enum(['true', 'false', 'all']).optional().default('all'),
    type: z.enum(['debit', 'credit', 'all']).optional().default('all'),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ReconcileTransactionInput = z.infer<typeof reconcileTransactionSchema>;
export type BulkImportTransactionsInput = z.infer<typeof bulkImportTransactionsSchema>;
export type BankQueryInput = z.infer<typeof bankQuerySchema>;
