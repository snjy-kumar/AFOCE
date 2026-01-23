import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';
import { getDetailedHealth, getReadiness, getLiveness } from '../controllers/health.controller.js';

/**
 * Health check route
 * Used by load balancers and monitoring
 */

const router = Router();

router.get('/', (_req: Request, res: Response) => {
    sendSuccess(res, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV ?? 'development',
    });
});

// Detailed health check with service status
router.get('/detailed', getDetailedHealth);

// Kubernetes/Docker readiness probe
router.get('/ready', getReadiness);

// Kubernetes/Docker liveness probe
router.get('/live', getLiveness);

export default router;
