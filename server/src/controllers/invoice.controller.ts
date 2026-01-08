import type { Response, NextFunction } from 'express';
import { invoiceService } from '../services/invoice.service.js';
import { sendSuccess } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type {
    CreateInvoiceInput,
    UpdateInvoiceInput,
    UpdateInvoiceStatusInput,
    InvoiceQuery,
} from '../schemas/invoice.schema.js';

/**
 * Invoice controller - handles HTTP requests for invoicing
 */

export const invoiceController = {
    async getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const query = req.query as unknown as InvoiceQuery;
            const result = await invoiceService.getInvoices(userId, query);
            sendSuccess(res, result.invoices, 200, result.pagination);
        } catch (error) {
            next(error);
        }
    },

    async getInvoiceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const invoice = await invoiceService.getInvoiceById(userId, id);
            sendSuccess(res, invoice);
        } catch (error) {
            next(error);
        }
    },

    async createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const input = req.body as CreateInvoiceInput;
            const invoice = await invoiceService.createInvoice(userId, input);
            sendSuccess(res, invoice, 201);
        } catch (error) {
            next(error);
        }
    },

    async updateInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const input = req.body as UpdateInvoiceInput;
            const invoice = await invoiceService.updateInvoice(userId, id, input);
            sendSuccess(res, invoice);
        } catch (error) {
            next(error);
        }
    },

    async updateInvoiceStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const input = req.body as UpdateInvoiceStatusInput;
            const invoice = await invoiceService.updateInvoiceStatus(userId, id, input);
            sendSuccess(res, invoice);
        } catch (error) {
            next(error);
        }
    },

    async deleteInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const result = await invoiceService.deleteInvoice(userId, id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    },

    async getInvoiceSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
            const summary = await invoiceService.getInvoiceSummary(userId, startDate, endDate);
            sendSuccess(res, summary);
        } catch (error) {
            next(error);
        }
    },
};
