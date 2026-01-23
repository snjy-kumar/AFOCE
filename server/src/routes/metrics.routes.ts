import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getPerformanceReport, MetricsAggregator } from '../utils/performance.js';

/**
 * Metrics and monitoring endpoints
 * Protected by authentication - only for admins/monitoring systems
 */

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/metrics - Get application metrics
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const metrics = MetricsAggregator.getMetrics();
    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
    });
  }
});

/**
 * GET /api/metrics/performance - Get performance report with recommendations
 */
router.get('/performance', (_req: Request, res: Response) => {
  try {
    const report = getPerformanceReport();
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate performance report',
    });
  }
});

/**
 * POST /api/metrics/reset - Reset metrics counters
 */
router.post('/reset', (_req: Request, res: Response) => {
  try {
    MetricsAggregator.reset();
    res.status(200).json({
      success: true,
      message: 'Metrics reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset metrics',
    });
  }
});

export default router;
