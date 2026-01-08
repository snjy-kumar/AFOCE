import { z } from 'zod';

/**
 * Report validation schemas
 */

export const reportDateRangeSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const agingReportQuerySchema = z.object({
    asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Type exports
export type ReportDateRange = z.infer<typeof reportDateRangeSchema>;
export type AgingReportQuery = z.infer<typeof agingReportQuerySchema>;
