import { Router } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { Response, NextFunction } from 'express';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /analytics/bi
 * Get comprehensive business intelligence dashboard data
 */
router.get('/bi', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const data = await analyticsService.getBusinessIntelligence(userId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /analytics/trends
 * Get monthly trends for charts
 */
router.get('/trends', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const months = parseInt(req.query.months as string) || 12;
        const data = await analyticsService.getMonthlyTrends(userId, months);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /analytics/seasonal
 * Get seasonal patterns analysis
 */
router.get('/seasonal', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const data = await analyticsService.getSeasonalPatterns(userId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /analytics/compare
 * Get comparative analysis (current vs previous period)
 */
router.get('/compare', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const periodType = (req.query.period as 'month' | 'quarter' | 'year') || 'month';
        const data = await analyticsService.getComparativeAnalysis(userId, periodType);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /analytics/customers
 * Get customer analytics
 */
router.get('/customers', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const data = await analyticsService.getCustomerMetrics(userId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /analytics/vendors
 * Get vendor analytics
 */
router.get('/vendors', async (req, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user!.userId;
        const data = await analyticsService.getVendorMetrics(userId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

export default router;
