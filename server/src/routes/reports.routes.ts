import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reportLimiter } from '../middleware/rateLimit.js';
import { reportDateRangeSchema, agingReportQuerySchema } from '../schemas/report.schema.js';

/**
 * Report routes - Financial reporting
 */

const router = Router();
router.use(authenticate);
router.use(reportLimiter);

// Profit & Loss Statement
router.get('/profit-loss', validate({ query: reportDateRangeSchema }), reportController.getProfitAndLoss);

// Balance Sheet
router.get('/balance-sheet', reportController.getBalanceSheet);

// Sales Summary
router.get('/sales-summary', validate({ query: reportDateRangeSchema }), reportController.getSalesSummary);

// Expense Summary
router.get('/expense-summary', validate({ query: reportDateRangeSchema }), reportController.getExpenseSummary);

// Accounts Receivable Aging
router.get('/ar-aging', validate({ query: agingReportQuerySchema }), reportController.getARAgingReport);

// Accounts Payable Aging
router.get('/ap-aging', validate({ query: agingReportQuerySchema }), reportController.getAPAgingReport);

export default router;
