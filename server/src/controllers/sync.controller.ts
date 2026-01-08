import { Response, NextFunction } from 'express';
import * as syncService from '../services/sync.service.js';
import { sendSuccess } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Offline Sync Controller
 */

// Push changes from client to server
export async function pushSync(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const result = await syncService.pushSync(req.user!.userId, req.body);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
}

// Pull changes from server to client
export async function pullSync(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const result = await syncService.pullSync(req.user!.userId, req.query as any);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
}

// Get pending conflicts
export async function getConflicts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const conflicts = await syncService.getConflicts(req.user!.userId);
        sendSuccess(res, conflicts);
    } catch (error) {
        next(error);
    }
}

// Resolve a sync conflict
export async function resolveConflict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const result = await syncService.resolveConflict(req.user!.userId, req.body);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
}

// Get sync status
export async function getSyncStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const status = await syncService.getSyncStatus(req.user!.userId);
        sendSuccess(res, status);
    } catch (error) {
        next(error);
    }
}
