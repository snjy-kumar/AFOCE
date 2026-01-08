import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';

/**
 * Dashboard routes
 */

const router = Router();
router.use(authenticate);

// Get full dashboard data
router.get('/', dashboardController.getDashboardData);

// Get quick stats
router.get('/stats', dashboardController.getQuickStats);

export default router;
