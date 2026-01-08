import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
    createExpenseSchema,
    updateExpenseSchema,
    expenseIdParamSchema,
    expenseQuerySchema,
} from '../schemas/expense.schema.js';

/**
 * Expense routes
 */

const router = Router();
router.use(authenticate);

// Get expense summary
router.get('/summary', expenseController.getExpenseSummary);

// Get all expenses
router.get('/', validate({ query: expenseQuerySchema }), expenseController.getExpenses);

// Get single expense
router.get('/:id', validate({ params: expenseIdParamSchema }), expenseController.getExpenseById);

// Create expense
router.post('/', validate({ body: createExpenseSchema }), expenseController.createExpense);

// Update expense
router.patch('/:id', validate({ params: expenseIdParamSchema, body: updateExpenseSchema }), expenseController.updateExpense);

// Delete expense
router.delete('/:id', validate({ params: expenseIdParamSchema }), expenseController.deleteExpense);

export default router;
