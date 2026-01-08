import { Response, NextFunction } from 'express';
import * as bankService from '../services/bank.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Bank Account & Transaction Controller
 */

// ============================================
// BANK ACCOUNTS
// ============================================

export async function createBankAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const account = await bankService.createBankAccount(req.user!.userId, req.body);
        sendSuccess(res, account, 201);
    } catch (error) {
        next(error);
    }
}

export async function getBankAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const accounts = await bankService.getBankAccounts(req.user!.userId);
        sendSuccess(res, accounts);
    } catch (error) {
        next(error);
    }
}

export async function getBankAccountById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const account = await bankService.getBankAccountById(req.user!.userId, req.params.id);
        if (!account) {
            return sendError(res, 'NOT_FOUND', 'Bank account not found', 404);
        }
        sendSuccess(res, account);
    } catch (error) {
        next(error);
    }
}

export async function updateBankAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const account = await bankService.updateBankAccount(req.user!.userId, req.params.id, req.body);
        if (!account) {
            return sendError(res, 'NOT_FOUND', 'Bank account not found', 404);
        }
        sendSuccess(res, account);
    } catch (error) {
        next(error);
    }
}

export async function deleteBankAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const account = await bankService.deleteBankAccount(req.user!.userId, req.params.id);
        if (!account) {
            return sendError(res, 'NOT_FOUND', 'Bank account not found', 404);
        }
        sendSuccess(res, null);
    } catch (error) {
        next(error);
    }
}

// ============================================
// BANK TRANSACTIONS
// ============================================

export async function createTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const transaction = await bankService.createTransaction(req.user!.userId, req.body);
        sendSuccess(res, transaction, 201);
    } catch (error) {
        next(error);
    }
}

export async function getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { accountId } = req.params;
        const result = await bankService.getTransactions(req.user!.userId, accountId, req.query as any);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
}

export async function getTransactionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const transaction = await bankService.getTransactionById(req.user!.userId, req.params.id);
        if (!transaction) {
            return sendError(res, 'NOT_FOUND', 'Transaction not found', 404);
        }
        sendSuccess(res, transaction);
    } catch (error) {
        next(error);
    }
}

export async function updateTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const transaction = await bankService.updateTransaction(req.user!.userId, req.params.id, req.body);
        if (!transaction) {
            return sendError(res, 'NOT_FOUND', 'Transaction not found', 404);
        }
        sendSuccess(res, transaction);
    } catch (error) {
        next(error);
    }
}

export async function deleteTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const transaction = await bankService.deleteTransaction(req.user!.userId, req.params.id);
        if (!transaction) {
            return sendError(res, 'NOT_FOUND', 'Transaction not found', 404);
        }
        sendSuccess(res, null);
    } catch (error) {
        next(error);
    }
}

// ============================================
// RECONCILIATION
// ============================================

export async function reconcileTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const transaction = await bankService.reconcileTransaction(
            req.user!.userId,
            req.params.id,
            req.body
        );
        if (!transaction) {
            return sendError(res, 'NOT_FOUND', 'Transaction not found', 404);
        }
        sendSuccess(res, transaction);
    } catch (error) {
        next(error);
    }
}

export async function unreconcileTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const transaction = await bankService.unreconcileTransaction(req.user!.userId, req.params.id);
        if (!transaction) {
            return sendError(res, 'NOT_FOUND', 'Transaction not found', 404);
        }
        sendSuccess(res, transaction);
    } catch (error) {
        next(error);
    }
}

export async function getSuggestedMatches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const suggestions = await bankService.getSuggestedMatches(req.user!.userId, req.params.id);
        if (!suggestions) {
            return sendError(res, 'NOT_FOUND', 'Transaction not found', 404);
        }
        sendSuccess(res, suggestions);
    } catch (error) {
        next(error);
    }
}

// ============================================
// BULK OPERATIONS
// ============================================

export async function bulkImportTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const result = await bankService.bulkImportTransactions(req.user!.userId, req.body);
        sendSuccess(res, result, 201);
    } catch (error) {
        next(error);
    }
}

// ============================================
// SUMMARY
// ============================================

export async function getBankSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const summary = await bankService.getBankSummary(req.user!.userId);
        sendSuccess(res, summary);
    } catch (error) {
        next(error);
    }
}
