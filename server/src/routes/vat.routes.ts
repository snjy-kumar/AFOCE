import { Router } from 'express';
import { vatController } from '../controllers/vat.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
    vatPeriodQuerySchema,
    createVatRecordSchema,
    updateVatRecordSchema,
    vatRecordIdParamSchema,
} from '../schemas/vat.schema.js';

/**
 * VAT routes - Nepal IRD compliance
 */

const router = Router();
router.use(authenticate);

// Get VAT summary for dashboard
router.get('/summary', vatController.getVatSummary);

// Calculate VAT for a period (preview, doesn't create record)
router.get('/calculate', vatController.calculateVatForPeriod);

// Get all VAT records
router.get('/', validate({ query: vatPeriodQuerySchema }), vatController.getVatRecords);

// Get single VAT record
router.get('/:id', validate({ params: vatRecordIdParamSchema }), vatController.getVatRecordById);

// Create VAT record for a period
router.post('/', validate({ body: createVatRecordSchema }), vatController.createVatRecord);

// Recalculate VAT record
router.post('/:id/recalculate', validate({ params: vatRecordIdParamSchema }), vatController.recalculateVatRecord);

// Update VAT record status
router.patch('/:id', validate({ params: vatRecordIdParamSchema, body: updateVatRecordSchema }), vatController.updateVatRecord);

// Generate IRD-format report
router.get('/:id/ird-report', validate({ params: vatRecordIdParamSchema }), vatController.generateIrdReport);

export default router;
