import { z } from 'zod';

/**
 * Offline Sync Validation Schemas
 */

// Sync item schema
const syncItemSchema = z.object({
    localId: z.string(),
    entityType: z.enum(['invoice', 'expense', 'customer', 'vendor']),
    action: z.enum(['create', 'update', 'delete']),
    payload: z.record(z.any()),
    timestamp: z.number(), // Client-side timestamp
});

// Push sync request
export const syncPushSchema = z.object({
    items: z.array(syncItemSchema).min(1, 'At least one item is required'),
    lastSyncTimestamp: z.number().optional(),
});

// Pull sync request (query params)
export const syncPullSchema = z.object({
    entityTypes: z.string().optional(), // Comma-separated: "invoice,expense"
    since: z.string().transform(Number).optional(), // Timestamp
    includeDeleted: z.enum(['true', 'false']).optional().default('false'),
});

// Conflict resolution
export const resolveConflictSchema = z.object({
    syncQueueId: z.string().uuid(),
    resolution: z.enum(['keep_local', 'keep_server', 'merge']),
    mergedPayload: z.record(z.any()).optional(), // Required if resolution is 'merge'
});

export type SyncItem = z.infer<typeof syncItemSchema>;
export type SyncPushInput = z.infer<typeof syncPushSchema>;
export type SyncPullInput = z.infer<typeof syncPullSchema>;
export type ResolveConflictInput = z.infer<typeof resolveConflictSchema>;
