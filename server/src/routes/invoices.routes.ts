import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
    createInvoiceSchema,
    updateInvoiceSchema,
    updateInvoiceStatusSchema,
    invoiceIdParamSchema,
    invoiceQuerySchema,
} from '../schemas/invoice.schema.js';

/**
 * Invoice routes
 */

const router = Router();
router.use(authenticate);

// Get invoice summary/statistics
router.get('/summary', invoiceController.getInvoiceSummary);

// Get all invoices with filters
router.get('/', validate({ query: invoiceQuerySchema }), invoiceController.getInvoices);

// Get single invoice
router.get('/:id', validate({ params: invoiceIdParamSchema }), invoiceController.getInvoiceById);

// Create new invoice
router.post('/', validate({ body: createInvoiceSchema }), invoiceController.createInvoice);

// Update invoice
router.patch('/:id', validate({ params: invoiceIdParamSchema, body: updateInvoiceSchema }), invoiceController.updateInvoice);

// Update invoice status
router.patch(
    '/:id/status',
    validate({ params: invoiceIdParamSchema, body: updateInvoiceStatusSchema }),
    invoiceController.updateInvoiceStatus
);

// Delete invoice
router.delete('/:id', validate({ params: invoiceIdParamSchema }), invoiceController.deleteInvoice);

export default router;
