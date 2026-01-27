import type { Response, NextFunction } from 'express';
import { reportService } from '../services/report.service.js';
import { sendSuccess } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { ReportDateRange, AgingReportQuery } from '../schemas/report.schema.js';

/**
 * Report controller - Financial reports
 */

export const reportController = {
    async getProfitAndLoss(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const dateRange = req.query as unknown as ReportDateRange;
            const report = await reportService.getProfitAndLoss(userId, dateRange);
            sendSuccess(res, report);
        } catch (error) {
            next(error);
        }
    },

    async getBalanceSheet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { asOfDate } = req.query as { asOfDate: string };
            const report = await reportService.getBalanceSheet(userId, asOfDate);
            sendSuccess(res, report);
        } catch (error) {
            next(error);
        }
    },

    async getSalesSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const dateRange = req.query as unknown as ReportDateRange;
            const report = await reportService.getSalesSummary(userId, dateRange);
            sendSuccess(res, report);
        } catch (error) {
            next(error);
        }
    },

    async getExpenseSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const dateRange = req.query as unknown as ReportDateRange;
            const report = await reportService.getExpenseSummary(userId, dateRange);
            sendSuccess(res, report);
        } catch (error) {
            next(error);
        }
    },

    async getARAgingReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { asOfDate } = req.query as AgingReportQuery;
            const report = await reportService.getARAgingReport(userId, asOfDate);
            sendSuccess(res, report);
        } catch (error) {
            next(error);
        }
    },

    async getAPAgingReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { asOfDate } = req.query as AgingReportQuery;
            const report = await reportService.getAPAgingReport(userId, asOfDate);
            sendSuccess(res, report);
        } catch (error) {
            next(error);
        }
    },

    async getCashFlowStatement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const dateRange = req.query as ReportDateRange;
            const report = await reportService.getCashFlowStatement(userId, dateRange);
            sendSuccess(res, report);
        } catch (error) {
            next(error);
        }
    },

    async getVatSummaryReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const dateRange = req.query as ReportDateRange;
            const report = await reportService.getVatSummaryReport(userId, dateRange);
            sendSuccess(res, report);
        } catch (error) {
            next(error);
        }
    },
};
