import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from '../schemas/auth.schema.js';

/**
 * Authentication routes
 */

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Public routes
router.post(
    '/register',
    validate({ body: registerSchema }),
    authController.register
);

router.post(
    '/login',
    validate({ body: loginSchema }),
    authController.login
);

// Password reset routes (public)
router.post(
    '/forgot-password',
    validate({ body: forgotPasswordSchema }),
    authController.forgotPassword
);

router.post(
    '/reset-password',
    validate({ body: resetPasswordSchema }),
    authController.resetPassword
);

// Protected routes (require authentication)
router.get(
    '/profile',
    authenticate,
    authController.getProfile
);

router.patch(
    '/profile',
    authenticate,
    validate({ body: updateProfileSchema }),
    authController.updateProfile
);

router.put(
    '/profile',
    authenticate,
    validate({ body: updateProfileSchema }),
    authController.updateProfile
);

router.post(
    '/change-password',
    authenticate,
    validate({ body: changePasswordSchema }),
    authController.changePassword
);

export default router;
