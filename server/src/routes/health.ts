import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';

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

export default router;
