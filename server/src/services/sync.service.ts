import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import type { SyncPushInput, SyncPullInput, ResolveConflictInput, SyncItem } from '../schemas/sync.schema.js';

/**
 * Offline Sync Service
 * Handles push/pull synchronization for offline-first functionality
 */

// ============================================
// PUSH SYNC (Client -> Server)
// ============================================

export async function pushSync(userId: string, data: SyncPushInput) {
    const results: Array<{
        localId: string;
        serverId?: string;
        status: 'success' | 'conflict' | 'error';
        error?: string;
    }> = [];

    for (const item of data.items) {
        try {
            const result = await processSyncItem(userId, item, data.lastSyncTimestamp);
            results.push(result);
        } catch (error) {
            results.push({
                localId: item.localId,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    return {
        processed: results.length,
        successful: results.filter(r => r.status === 'success').length,
        conflicts: results.filter(r => r.status === 'conflict').length,
        errors: results.filter(r => r.status === 'error').length,
        results,
        serverTimestamp: Date.now(),
    };
}

async function processSyncItem(
    userId: string,
    item: SyncItem,
    lastSyncTimestamp?: number
): Promise<{ localId: string; serverId?: string; status: 'success' | 'conflict' | 'error'; error?: string }> {
    const { localId, entityType, action, payload } = item;

    // Check for conflicts (server was updated after client's last sync)
    if (lastSyncTimestamp) {
        const serverEntity = await getServerEntity(userId, entityType, localId);
        if (serverEntity && new Date(serverEntity.updatedAt).getTime() > lastSyncTimestamp) {
            // Add to conflict queue
            await prisma.syncQueue.create({
                data: {
                    userId,
                    entityType,
                    entityId: localId,
                    action,
                    payload: payload as Prisma.JsonObject,
                    status: 'conflict',
                },
            });

            return { localId, status: 'conflict' };
        }
    }

    // Process the sync action
    let serverId: string | undefined;

    switch (action) {
        case 'create':
            serverId = await createEntity(userId, entityType, payload, localId);
            break;
        case 'update':
            await updateEntity(userId, entityType, localId, payload);
            serverId = localId;
            break;
        case 'delete':
            await deleteEntity(userId, entityType, localId);
            break;
    }

    return { localId, serverId, status: 'success' };
}

async function getServerEntity(userId: string, entityType: string, id: string) {
    switch (entityType) {
        case 'invoice':
            return prisma.invoice.findFirst({
                where: { OR: [{ id }, { localId: id }], userId }
            });
        case 'expense':
            return prisma.expense.findFirst({
                where: { OR: [{ id }, { localId: id }], userId }
            });
        case 'customer':
            return prisma.customer.findFirst({ where: { id, userId } });
        case 'vendor':
            return prisma.vendor.findFirst({ where: { id, userId } });
        default:
            return null;
    }
}

async function createEntity(
    userId: string,
    entityType: string,
    payload: Record<string, unknown>,
    localId: string
): Promise<string> {
    switch (entityType) {
        case 'customer': {
            const customer = await prisma.customer.create({
                data: {
                    userId,
                    name: payload.name as string,
                    email: payload.email as string | undefined,
                    phone: payload.phone as string | undefined,
                    panNumber: payload.panNumber as string | undefined,
                    address: payload.address as string | undefined,
                    notes: payload.notes as string | undefined,
                },
            });
            return customer.id;
        }
        case 'vendor': {
            const vendor = await prisma.vendor.create({
                data: {
                    userId,
                    name: payload.name as string,
                    email: payload.email as string | undefined,
                    phone: payload.phone as string | undefined,
                    panNumber: payload.panNumber as string | undefined,
                    address: payload.address as string | undefined,
                    notes: payload.notes as string | undefined,
                },
            });
            return vendor.id;
        }
        case 'invoice': {
            // Complex entity - would need full invoice creation logic
            // For now, mark as pending for manual sync
            await prisma.syncQueue.create({
                data: {
                    userId,
                    entityType: 'invoice',
                    entityId: localId,
                    action: 'create',
                    payload: payload as Prisma.JsonObject,
                    status: 'pending',
                },
            });
            return localId;
        }
        case 'expense': {
            // Similar to invoice - complex creation
            await prisma.syncQueue.create({
                data: {
                    userId,
                    entityType: 'expense',
                    entityId: localId,
                    action: 'create',
                    payload: payload as Prisma.JsonObject,
                    status: 'pending',
                },
            });
            return localId;
        }
        default:
            throw new Error(`Unknown entity type: ${entityType}`);
    }
}

async function updateEntity(
    userId: string,
    entityType: string,
    id: string,
    payload: Record<string, unknown>
): Promise<void> {
    switch (entityType) {
        case 'customer':
            await prisma.customer.updateMany({
                where: { id, userId },
                data: {
                    name: payload.name as string | undefined,
                    email: payload.email as string | undefined,
                    phone: payload.phone as string | undefined,
                    panNumber: payload.panNumber as string | undefined,
                    address: payload.address as string | undefined,
                    notes: payload.notes as string | undefined,
                },
            });
            break;
        case 'vendor':
            await prisma.vendor.updateMany({
                where: { id, userId },
                data: {
                    name: payload.name as string | undefined,
                    email: payload.email as string | undefined,
                    phone: payload.phone as string | undefined,
                    panNumber: payload.panNumber as string | undefined,
                    address: payload.address as string | undefined,
                    notes: payload.notes as string | undefined,
                },
            });
            break;
        case 'invoice':
        case 'expense':
            // Queue for processing
            await prisma.syncQueue.create({
                data: {
                    userId,
                    entityType,
                    entityId: id,
                    action: 'update',
                    payload: payload as Prisma.JsonObject,
                    status: 'pending',
                },
            });
            break;
    }
}

async function deleteEntity(
    userId: string,
    entityType: string,
    id: string
): Promise<void> {
    switch (entityType) {
        case 'customer':
            await prisma.customer.updateMany({
                where: { id, userId },
                data: { isActive: false },
            });
            break;
        case 'vendor':
            await prisma.vendor.updateMany({
                where: { id, userId },
                data: { isActive: false },
            });
            break;
        case 'invoice':
            await prisma.invoice.updateMany({
                where: { OR: [{ id }, { localId: id }], userId },
                data: { status: 'CANCELLED' },
            });
            break;
        case 'expense':
            // Soft delete via syncStatus
            await prisma.expense.updateMany({
                where: { OR: [{ id }, { localId: id }], userId },
                data: { syncStatus: 'deleted' },
            });
            break;
    }
}

// ============================================
// PULL SYNC (Server -> Client)
// ============================================

export async function pullSync(userId: string, query: SyncPullInput) {
    const entityTypes = query.entityTypes?.split(',') || ['invoice', 'expense', 'customer', 'vendor'];
    const since = query.since ? new Date(query.since) : new Date(0);

    const results: Record<string, unknown[]> = {};

    for (const entityType of entityTypes) {
        results[entityType] = await getUpdatedEntities(userId, entityType, since, query.includeDeleted === 'true');
    }

    return {
        data: results,
        serverTimestamp: Date.now(),
    };
}

async function getUpdatedEntities(
    userId: string,
    entityType: string,
    since: Date,
    includeDeleted: boolean
): Promise<unknown[]> {
    const where = {
        userId,
        updatedAt: { gte: since },
    };

    switch (entityType) {
        case 'customer':
            return prisma.customer.findMany({
                where: includeDeleted ? where : { ...where, isActive: true },
            });
        case 'vendor':
            return prisma.vendor.findMany({
                where: includeDeleted ? where : { ...where, isActive: true },
            });
        case 'invoice':
            return prisma.invoice.findMany({
                where: includeDeleted
                    ? where
                    : { ...where, status: { not: 'CANCELLED' } },
                include: {
                    items: true,
                    customer: { select: { id: true, name: true } },
                },
            });
        case 'expense':
            return prisma.expense.findMany({
                where: includeDeleted
                    ? where
                    : { ...where, syncStatus: { not: 'deleted' } },
                include: {
                    vendor: { select: { id: true, name: true } },
                    account: { select: { id: true, name: true, code: true } },
                },
            });
        default:
            return [];
    }
}

// ============================================
// CONFLICT RESOLUTION
// ============================================

export async function getConflicts(userId: string) {
    return prisma.syncQueue.findMany({
        where: { userId, status: 'conflict' },
        orderBy: { createdAt: 'desc' },
    });
}

export async function resolveConflict(userId: string, data: ResolveConflictInput) {
    const conflict = await prisma.syncQueue.findFirst({
        where: { id: data.syncQueueId, userId, status: 'conflict' },
    });

    if (!conflict) {
        throw new Error('Conflict not found');
    }

    switch (data.resolution) {
        case 'keep_local':
            // Apply client changes
            await processSyncItem(userId, {
                localId: conflict.entityId,
                entityType: conflict.entityType as 'invoice' | 'expense' | 'customer' | 'vendor',
                action: conflict.action as 'create' | 'update' | 'delete',
                payload: conflict.payload as Record<string, unknown>,
                timestamp: Date.now(),
            });
            break;
        case 'keep_server':
            // Do nothing, server version is already current
            break;
        case 'merge':
            if (!data.mergedPayload) {
                throw new Error('Merged payload required for merge resolution');
            }
            await processSyncItem(userId, {
                localId: conflict.entityId,
                entityType: conflict.entityType as 'invoice' | 'expense' | 'customer' | 'vendor',
                action: 'update',
                payload: data.mergedPayload,
                timestamp: Date.now(),
            });
            break;
    }

    // Mark conflict as resolved
    await prisma.syncQueue.update({
        where: { id: data.syncQueueId },
        data: { status: 'completed' },
    });

    return { resolved: true };
}

// ============================================
// SYNC STATUS
// ============================================

export async function getSyncStatus(userId: string) {
    const [pending, conflicts, failed] = await Promise.all([
        prisma.syncQueue.count({ where: { userId, status: 'pending' } }),
        prisma.syncQueue.count({ where: { userId, status: 'conflict' } }),
        prisma.syncQueue.count({ where: { userId, status: 'failed' } }),
    ]);

    return {
        pending,
        conflicts,
        failed,
        lastSync: Date.now(), // Could be stored in user settings
    };
}
