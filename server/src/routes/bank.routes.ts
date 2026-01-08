import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as bankController from '../controllers/bank.controller.js';
import {
    createBankAccountSchema,
    updateBankAccountSchema,
    createTransactionSchema,
    updateTransactionSchema,
    reconcileTransactionSchema,
    bulkImportTransactionsSchema,
    bankQuerySchema,
} from '../schemas/bank.schema.js';

/**
 * Bank Account & Transaction Routes
 * All routes require authentication
 */

const router = Router();

// Apply auth to all routes
router.use(authenticate);

// ============================================
// BANK ACCOUNTS
// ============================================

// GET /api/bank/accounts - Get all bank accounts
router.get('/accounts', bankController.getBankAccounts);

// GET /api/bank/accounts/:id - Get single bank account
router.get('/accounts/:id', bankController.getBankAccountById);

// POST /api/bank/accounts - Create bank account
router.post(
    '/accounts',
    validate({ body: createBankAccountSchema }),
    bankController.createBankAccount
);

// PUT /api/bank/accounts/:id - Update bank account
router.put(
    '/accounts/:id',
    validate({ body: updateBankAccountSchema }),
    bankController.updateBankAccount
);

// DELETE /api/bank/accounts/:id - Delete bank account
router.delete('/accounts/:id', bankController.deleteBankAccount);

// ============================================
// BANK TRANSACTIONS
// ============================================

// GET /api/bank/accounts/:accountId/transactions - Get transactions for account
router.get(
    '/accounts/:accountId/transactions',
    validate({ query: bankQuerySchema }),
    bankController.getTransactions
);

// POST /api/bank/transactions - Create transaction
router.post(
    '/transactions',
    validate({ body: createTransactionSchema }),
    bankController.createTransaction
);

// GET /api/bank/transactions/:id - Get single transaction
router.get('/transactions/:id', bankController.getTransactionById);

// PUT /api/bank/transactions/:id - Update transaction
router.put(
    '/transactions/:id',
    validate({ body: updateTransactionSchema }),
    bankController.updateTransaction
);

// DELETE /api/bank/transactions/:id - Delete transaction
router.delete('/transactions/:id', bankController.deleteTransaction);

// ============================================
// RECONCILIATION
// ============================================

// POST /api/bank/transactions/:id/reconcile - Reconcile a transaction
router.post(
    '/transactions/:id/reconcile',
    validate({ body: reconcileTransactionSchema }),
    bankController.reconcileTransaction
);

// POST /api/bank/transactions/:id/unreconcile - Unreconcile a transaction
router.post('/transactions/:id/unreconcile', bankController.unreconcileTransaction);

// GET /api/bank/transactions/:id/suggestions - Get matching suggestions
router.get('/transactions/:id/suggestions', bankController.getSuggestedMatches);

// ============================================
// BULK OPERATIONS
// ============================================

// POST /api/bank/transactions/import - Bulk import transactions
router.post(
    '/transactions/import',
    validate({ body: bulkImportTransactionsSchema }),
    bankController.bulkImportTransactions
);

// ============================================
// SUMMARY
// ============================================

// GET /api/bank/summary - Get bank summary across all accounts
router.get('/summary', bankController.getBankSummary);

export default router;
