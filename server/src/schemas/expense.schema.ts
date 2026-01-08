import { z } from 'zod';

/**
 * Expense validation schemas
 */

export const createExpenseSchema = z.object({
    vendorId: z.string().uuid().optional(),
    accountId: z.string().uuid('Invalid account ID'),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    description: z.string().min(1, 'Description is required'),
    amount: z.number().positive('Amount must be positive'),
    vatRate: z.number().min(0).max(100).default(13), // Nepal VAT is 13%
    isPaid: z.boolean().default(true),
    notes: z.string().optional(),
});

export const updateExpenseSchema = z.object({
    vendorId: z.string().uuid().optional().nullable(),
    accountId: z.string().uuid().optional(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    description: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    vatRate: z.number().min(0).max(100).optional(),
    isPaid: z.boolean().optional(),
    notes: z.string().optional(),
});

export const expenseIdParamSchema = z.object({
    id: z.string().uuid('Invalid expense ID'),
});

export const expenseQuerySchema = z.object({
    vendorId: z.string().uuid().optional(),
    accountId: z.string().uuid().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    isPaid: z.string().transform((val) => val === 'true').optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
});

// Type exports
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;
