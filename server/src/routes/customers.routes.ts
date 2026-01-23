import { Router } from 'express';
import { customerController } from '../controllers/customer.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
    createCustomerSchema,
    updateCustomerSchema,
    customerIdParamSchema,
    customerQuerySchema,
} from '../schemas/customer.schema.js';

/**
 * Customer routes
 */

const router = Router();
router.use(authenticate);

router.get('/', validate({ query: customerQuerySchema }), customerController.getCustomers);
router.get('/:id', validate({ params: customerIdParamSchema }), customerController.getCustomerById);
router.post('/', validate({ body: createCustomerSchema }), customerController.createCustomer);
router.patch('/:id', validate({ params: customerIdParamSchema, body: updateCustomerSchema }), customerController.updateCustomer);
router.put('/:id', validate({ params: customerIdParamSchema, body: updateCustomerSchema }), customerController.updateCustomer);
router.delete('/:id', validate({ params: customerIdParamSchema }), customerController.deleteCustomer);

export default router;
