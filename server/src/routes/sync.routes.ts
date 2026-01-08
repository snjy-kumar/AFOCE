import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as syncController from '../controllers/sync.controller.js';
import {
    syncPushSchema,
    syncPullSchema,
    resolveConflictSchema,
} from '../schemas/sync.schema.js';

/**
 * Offline Sync Routes
 * All routes require authentication
 */

const router = Router();

// Apply auth to all routes
router.use(authenticate);

// POST /api/sync/push - Push local changes to server
router.post(
    '/push',
    validate({ body: syncPushSchema }),
    syncController.pushSync
);

// GET /api/sync/pull - Pull server changes to client
router.get(
    '/pull',
    validate({ query: syncPullSchema }),
    syncController.pullSync
);

// GET /api/sync/conflicts - Get pending conflicts
router.get('/conflicts', syncController.getConflicts);

// POST /api/sync/conflicts/resolve - Resolve a conflict
router.post(
    '/conflicts/resolve',
    validate({ body: resolveConflictSchema }),
    syncController.resolveConflict
);

// GET /api/sync/status - Get sync status
router.get('/status', syncController.getSyncStatus);

export default router;
