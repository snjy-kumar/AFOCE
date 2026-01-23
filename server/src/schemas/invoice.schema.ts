import { z } from 'zod';

/**
 * Invoice validation schemas
 */

const invoiceItemSchema = z.object({
    accountId: z.string().uuid('Invalid account ID'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    rate: z.number().nonnegative('Rate must be non-negative'),
});

export const createInvoiceSchema = z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    issueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    vatRate: z.number().min(0).max(100).default(13), // Nepal VAT is 13%
    discountAmount: z.number().nonnegative().default(0),
    notes: z.string().optional(),
    terms: z.string().optional(),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export const updateInvoiceSchema = z.object({
    customerId: z.string().uuid().optional(),
    issueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    vatRate: z.number().min(0).max(100).optional(),
    discountAmount: z.number().nonnegative().optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),
    items: z.array(invoiceItemSchema).min(1).optional(),
});

export const updateInvoiceStatusSchema = z.object({
    status: z.enum(['DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED']),
    paidAmount: z.number().nonnegative().optional(),
});

export const invoiceIdParamSchema = z.object({
    id: z.string().uuid('Invalid invoice ID'),
});

export const invoiceQuerySchema = z.object({
    status: z.enum(['DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED']).optional(),
    customerId: z.string().uuid().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

// Type exports
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;
export type InvoiceQuery = z.infer<typeof invoiceQuerySchema>;
