import type { Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service.js';
import { sendSuccess } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { CreateCustomerInput, UpdateCustomerInput, CustomerQuery } from '../schemas/customer.schema.js';

/**
 * Customer controller - handles HTTP requests
 */

export const customerController = {
    async getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const query = req.query as CustomerQuery;
            const customers = await customerService.getCustomers(userId, query);
            sendSuccess(res, customers);
        } catch (error) {
            next(error);
        }
    },

    async getCustomerById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const customer = await customerService.getCustomerById(userId, id);
            sendSuccess(res, customer);
        } catch (error) {
            next(error);
        }
    },

    async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const input = req.body as CreateCustomerInput;
            const customer = await customerService.createCustomer(userId, input);
            sendSuccess(res, customer, 201);
        } catch (error) {
            next(error);
        }
    },

    async updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const input = req.body as UpdateCustomerInput;
            const customer = await customerService.updateCustomer(userId, id, input);
            sendSuccess(res, customer);
        } catch (error) {
            next(error);
        }
    },

    async deleteCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const result = await customerService.deleteCustomer(userId, id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    },
};
