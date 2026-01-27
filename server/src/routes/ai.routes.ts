import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { sendSuccess } from '../utils/response.js';
import { aiService } from '../services/ai.service.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * AI Features Routes
 * - Auto-categorization
 * - Anomaly detection
 * - Cash flow predictions
 * - Business insights
 */

const router = Router();
router.use(authenticate);

// Auto-categorize expense
router.post('/categorize-expense', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const { description, vendorName } = req.body;
        
        const result = await aiService.categorizeExpense(description, vendorName, userId);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

// Detect anomalies in financial data
router.get('/anomalies', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new Error('User ID not found');
        
        const anomalies = await aiService.detectAnomalies(userId);
        sendSuccess(res, { anomalies, count: anomalies.length });
    } catch (error) {
        next(error);
    }
});

// Predict cash flow
router.get('/cash-flow-prediction', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new Error('User ID not found');
        
        const periods = parseInt(req.query.periods as string) || 3;
        const predictions = await aiService.predictCashFlow(userId, periods);
        sendSuccess(res, { predictions });
    } catch (error) {
        next(error);
    }
});

// Get business insights
router.get('/insights', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new Error('User ID not found');
        
        const insights = await aiService.getBusinessInsights(userId);
        sendSuccess(res, { insights, count: insights.length });
    } catch (error) {
        next(error);
    }
});

// Extract data from receipt image (OCR placeholder)
router.post('/extract-receipt', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { imageUrl } = req.body;
        
        const result = await aiService.extractFromImage(imageUrl);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

export default router;
