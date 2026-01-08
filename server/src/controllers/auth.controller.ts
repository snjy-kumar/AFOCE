import type { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from '../schemas/auth.schema.js';

/**
 * Authentication controller - handles HTTP requests
 */

export const authController = {
    /**
     * POST /api/auth/register
     */
    async register(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const input = req.body as RegisterInput;
            const result = await authService.register(input);
            sendSuccess(res, result, 201);
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/auth/login
     */
    async login(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const input = req.body as LoginInput;
            const result = await authService.login(input);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/auth/profile
     */
    async getProfile(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new Error('User ID not found in request');
            }
            const user = await authService.getProfile(userId);
            sendSuccess(res, user);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /api/auth/profile
     */
    async updateProfile(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new Error('User ID not found in request');
            }
            const input = req.body as UpdateProfileInput;
            const user = await authService.updateProfile(userId, input);
            sendSuccess(res, user);
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/auth/change-password
     */
    async changePassword(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new Error('User ID not found in request');
            }
            const input = req.body as ChangePasswordInput;
            await authService.changePassword(userId, input);
            sendSuccess(res, { message: 'Password changed successfully' });
        } catch (error) {
            next(error);
        }
    },
};
