import type { Response, NextFunction } from 'express';
import { accountService } from '../services/account.service.js';
import { sendSuccess } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { CreateAccountInput, UpdateAccountInput, AccountQuery } from '../schemas/account.schema.js';

/**
 * Account controller - handles HTTP requests for Chart of Accounts
 */

export const accountController = {
    /**
     * GET /api/accounts
     */
    async getAccounts(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const query = req.query as AccountQuery;
            const accounts = await accountService.getAccounts(userId, query);
            sendSuccess(res, accounts);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/accounts/tree
     */
    async getAccountTree(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const tree = await accountService.getAccountTree(userId);
            sendSuccess(res, tree);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/accounts/:id
     */
    async getAccountById(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const account = await accountService.getAccountById(userId, id);
            sendSuccess(res, account);
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/accounts
     */
    async createAccount(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const input = req.body as CreateAccountInput;
            const account = await accountService.createAccount(userId, input);
            sendSuccess(res, account, 201);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /api/accounts/:id
     */
    async updateAccount(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const input = req.body as UpdateAccountInput;
            const account = await accountService.updateAccount(userId, id, input);
            sendSuccess(res, account);
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/accounts/:id
     */
    async deleteAccount(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const result = await accountService.deleteAccount(userId, id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    },
};
