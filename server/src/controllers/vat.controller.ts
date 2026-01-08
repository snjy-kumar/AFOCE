import type { Response, NextFunction } from 'express';
import { vatService } from '../services/vat.service.js';
import { sendSuccess } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { VatPeriodQuery, CreateVatRecordInput, UpdateVatRecordInput } from '../schemas/vat.schema.js';

/**
 * VAT controller - handles VAT management HTTP requests
 */

export const vatController = {
    async getVatRecords(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const query = req.query as VatPeriodQuery;
            const records = await vatService.getVatRecords(userId, query);
            sendSuccess(res, records);
        } catch (error) {
            next(error);
        }
    },

    async getVatRecordById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const record = await vatService.getVatRecordById(userId, id);
            sendSuccess(res, record);
        } catch (error) {
            next(error);
        }
    },

    async calculateVatForPeriod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { startDate, endDate } = req.query as { startDate: string; endDate: string };
            const calculation = await vatService.calculateVatForPeriod(
                userId,
                new Date(startDate),
                new Date(endDate)
            );
            sendSuccess(res, calculation);
        } catch (error) {
            next(error);
        }
    },

    async createVatRecord(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const input = req.body as CreateVatRecordInput;
            const record = await vatService.createVatRecord(userId, input);
            sendSuccess(res, record, 201);
        } catch (error) {
            next(error);
        }
    },

    async recalculateVatRecord(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const record = await vatService.recalculateVatRecord(userId, id);
            sendSuccess(res, record);
        } catch (error) {
            next(error);
        }
    },

    async updateVatRecord(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const input = req.body as UpdateVatRecordInput;
            const record = await vatService.updateVatRecord(userId, id, input);
            sendSuccess(res, record);
        } catch (error) {
            next(error);
        }
    },

    async generateIrdReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const report = await vatService.generateIrdReport(userId, id);
            sendSuccess(res, report);
        } catch (error) {
            next(error);
        }
    },

    async getVatSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const summary = await vatService.getVatSummary(userId);
            sendSuccess(res, summary);
        } catch (error) {
            next(error);
        }
    },
};
