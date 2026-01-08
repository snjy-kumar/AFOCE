import { z } from 'zod';

/**
 * Vendor validation schemas
 */

export const createVendorSchema = z.object({
    name: z.string().min(2, 'Vendor name must be at least 2 characters'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    panNumber: z.string().optional(), // For VAT claims
    address: z.string().optional(),
    notes: z.string().optional(),
});

export const updateVendorSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    panNumber: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const vendorIdParamSchema = z.object({
    id: z.string().uuid('Invalid vendor ID'),
});

export const vendorQuerySchema = z.object({
    search: z.string().optional(),
    isActive: z
        .string()
        .transform((val) => val === 'true')
        .optional(),
});

// Type exports
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type VendorQuery = z.infer<typeof vendorQuerySchema>;
