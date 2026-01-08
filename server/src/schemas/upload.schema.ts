import { z } from 'zod';

/**
 * File Upload Validation Schemas
 */

// Upload types
export const uploadTypeSchema = z.enum([
    'receipt',      // Expense receipts
    'logo',         // Business logo
    'invoice_pdf',  // Generated invoice PDFs
    'attachment',   // General attachments
]);

// Upload metadata
export const uploadMetadataSchema = z.object({
    type: uploadTypeSchema,
    entityId: z.string().uuid().optional(), // Related entity (expense, invoice, etc.)
    description: z.string().max(500).optional(),
});

// Allowed file types per upload type
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
    receipt: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    logo: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
    invoice_pdf: ['application/pdf'],
    attachment: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Max file sizes (in bytes)
export const MAX_FILE_SIZES: Record<string, number> = {
    receipt: 5 * 1024 * 1024,      // 5MB
    logo: 2 * 1024 * 1024,          // 2MB
    invoice_pdf: 10 * 1024 * 1024,  // 10MB
    attachment: 10 * 1024 * 1024,   // 10MB
};

export type UploadType = z.infer<typeof uploadTypeSchema>;
export type UploadMetadata = z.infer<typeof uploadMetadataSchema>;
