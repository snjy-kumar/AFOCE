import { z } from 'zod';

/**
 * Account validation schemas
 */

export const createAccountSchema = z.object({
    code: z
        .string()
        .min(1, 'Account code is required')
        .regex(/^[0-9]+$/, 'Account code must contain only numbers'),
    name: z.string().min(2, 'Account name must be at least 2 characters'),
    nameNe: z.string().optional(), // Nepali name
    type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']),
    description: z.string().optional(),
    parentId: z.string().uuid().optional(),
});

export const updateAccountSchema = z.object({
    name: z.string().min(2).optional(),
    nameNe: z.string().optional(),
    description: z.string().optional(),
    parentId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
});

export const accountIdParamSchema = z.object({
    id: z.string().uuid('Invalid account ID'),
});

export const accountQuerySchema = z.object({
    type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']).optional(),
    isActive: z
        .string()
        .transform((val) => val === 'true')
        .optional(),
    search: z.string().optional(),
});

// Type exports
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AccountQuery = z.infer<typeof accountQuerySchema>;
