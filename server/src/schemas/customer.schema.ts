import { z } from 'zod';

/**
 * Customer validation schemas
 */

export const createCustomerSchema = z.object({
    name: z.string().min(2, 'Customer name must be at least 2 characters'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    panNumber: z.string().optional(), // For VAT invoices
    address: z.string().optional(),
    notes: z.string().optional(),
});

export const updateCustomerSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    panNumber: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const customerIdParamSchema = z.object({
    id: z.string().uuid('Invalid customer ID'),
});

export const customerQuerySchema = z.object({
    search: z.string().optional(),
    isActive: z
        .string()
        .transform((val) => val === 'true')
        .optional(),
});

// Type exports
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerQuery = z.infer<typeof customerQuerySchema>;
