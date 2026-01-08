import { Router } from 'express';
import { vendorController } from '../controllers/vendor.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
    createVendorSchema,
    updateVendorSchema,
    vendorIdParamSchema,
    vendorQuerySchema,
} from '../schemas/vendor.schema.js';

/**
 * Vendor routes
 */

const router = Router();
router.use(authenticate);

router.get('/', validate({ query: vendorQuerySchema }), vendorController.getVendors);
router.get('/:id', validate({ params: vendorIdParamSchema }), vendorController.getVendorById);
router.post('/', validate({ body: createVendorSchema }), vendorController.createVendor);
router.patch('/:id', validate({ params: vendorIdParamSchema, body: updateVendorSchema }), vendorController.updateVendor);
router.delete('/:id', validate({ params: vendorIdParamSchema }), vendorController.deleteVendor);

export default router;
