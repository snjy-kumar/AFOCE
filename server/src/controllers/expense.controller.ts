import type { Response, NextFunction } from 'express';
import { expenseService } from '../services/expense.service.js';
import { sendSuccess } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { CreateExpenseInput, UpdateExpenseInput, ExpenseQuery } from '../schemas/expense.schema.js';

/**
 * Expense controller - handles HTTP requests
 */

export const expenseController = {
    async getExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const query = req.query as unknown as ExpenseQuery;
            const result = await expenseService.getExpenses(userId, query);
            sendSuccess(res, result.expenses, 200, result.pagination);
        } catch (error) {
            next(error);
        }
    },

    async getExpenseById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const expense = await expenseService.getExpenseById(userId, id);
            sendSuccess(res, expense);
        } catch (error) {
            next(error);
        }
    },

    async createExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const input = req.body as CreateExpenseInput;
            const expense = await expenseService.createExpense(userId, input);
            sendSuccess(res, expense, 201);
        } catch (error) {
            next(error);
        }
    },

    async updateExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const input = req.body as UpdateExpenseInput;
            const expense = await expenseService.updateExpense(userId, id, input);
            sendSuccess(res, expense);
        } catch (error) {
            next(error);
        }
    },

    async deleteExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const result = await expenseService.deleteExpense(userId, id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    },

    async getExpenseSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
            const summary = await expenseService.getExpenseSummary(userId, startDate, endDate);
            sendSuccess(res, summary);
        } catch (error) {
            next(error);
        }
    },
};
