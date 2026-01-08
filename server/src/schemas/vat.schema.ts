import { z } from 'zod';

/**
 * VAT Management validation schemas
 */

export const vatPeriodQuerySchema = z.object({
    year: z.string().regex(/^\d{4}$/).optional(),
    status: z.enum(['PENDING', 'FILED', 'PAID']).optional(),
});

export const createVatRecordSchema = z.object({
    periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodLabel: z.string().min(1), // e.g., "2080-01"
});

export const updateVatRecordSchema = z.object({
    status: z.enum(['PENDING', 'FILED', 'PAID']).optional(),
    filedDate: z.string().datetime().optional(),
    notes: z.string().optional(),
});

export const vatRecordIdParamSchema = z.object({
    id: z.string().uuid('Invalid VAT record ID'),
});

// Type exports
export type VatPeriodQuery = z.infer<typeof vatPeriodQuerySchema>;
export type CreateVatRecordInput = z.infer<typeof createVatRecordSchema>;
export type UpdateVatRecordInput = z.infer<typeof updateVatRecordSchema>;
