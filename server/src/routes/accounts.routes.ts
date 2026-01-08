import { Router } from 'express';
import { accountController } from '../controllers/account.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
    createAccountSchema,
    updateAccountSchema,
    accountIdParamSchema,
    accountQuerySchema,
} from '../schemas/account.schema.js';

/**
 * Account routes - Chart of Accounts management
 */

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all accounts with filters
router.get(
    '/',
    validate({ query: accountQuerySchema }),
    accountController.getAccounts
);

// Get accounts as tree structure
router.get('/tree', accountController.getAccountTree);

// Get single account
router.get(
    '/:id',
    validate({ params: accountIdParamSchema }),
    accountController.getAccountById
);

// Create new account
router.post(
    '/',
    validate({ body: createAccountSchema }),
    accountController.createAccount
);

// Update account
router.patch(
    '/:id',
    validate({ params: accountIdParamSchema, body: updateAccountSchema }),
    accountController.updateAccount
);

// Delete account
router.delete(
    '/:id',
    validate({ params: accountIdParamSchema }),
    accountController.deleteAccount
);

export default router;
