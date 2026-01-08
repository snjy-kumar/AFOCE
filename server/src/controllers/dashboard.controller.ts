import type { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Dashboard controller - handles dashboard HTTP requests
 */

export const dashboardController = {
    async getDashboardData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const data = await dashboardService.getDashboardData(userId);
            sendSuccess(res, data);
        } catch (error) {
            next(error);
        }
    },

    async getQuickStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const stats = await dashboardService.getQuickStats(userId);
            sendSuccess(res, stats);
        } catch (error) {
            next(error);
        }
    },
};
