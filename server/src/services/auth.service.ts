import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { generateToken } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import type { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from '../schemas/auth.schema.js';

/**
 * Authentication service - handles all auth business logic
 */

// Use fewer rounds in development for faster testing (12 in prod, 4 in dev)
const SALT_ROUNDS = env.NODE_ENV === 'development' ? 4 : 12;

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        businessName: string;
        panNumber: string | null;
        vatNumber: string | null;
        address: string | null;
        phone: string | null;
        language: string;
    };
    token: string;
}

export const authService = {
    /**
     * Register a new user
     */
    async register(input: RegisterInput): Promise<AuthResponse> {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
        });

        if (existingUser) {
            throw new ApiError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: input.email.toLowerCase(),
                password: hashedPassword,
                businessName: input.businessName,
                panNumber: input.panNumber ?? null,
                vatNumber: input.vatNumber ?? null,
                address: input.address ?? null,
                phone: input.phone ?? null,
            },
            select: {
                id: true,
                email: true,
                businessName: true,
                panNumber: true,
                vatNumber: true,
                address: true,
                phone: true,
                language: true,
            },
        });

        // Generate token
        const token = generateToken({ userId: user.id, email: user.email });

        return { user, token };
    },

    /**
     * Login user
     */
    async login(input: LoginInput): Promise<AuthResponse> {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
        });

        if (!user) {
            throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(input.password, user.password);

        if (!isPasswordValid) {
            throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        // Generate token
        const token = generateToken({ userId: user.id, email: user.email });

        return {
            user: {
                id: user.id,
                email: user.email,
                businessName: user.businessName,
                panNumber: user.panNumber,
                vatNumber: user.vatNumber,
                address: user.address,
                phone: user.phone,
                language: user.language,
            },
            token,
        };
    },

    /**
     * Get user profile by ID
     */
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                businessName: true,
                panNumber: true,
                vatNumber: true,
                address: true,
                phone: true,
                logoUrl: true,
                language: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
        }

        return user;
    },

    /**
     * Update user profile
     */
    async updateProfile(userId: string, input: UpdateProfileInput) {
        // Build update data object - only include defined fields
        const updateData: Record<string, string> = {};

        if (input.businessName !== undefined) updateData.businessName = input.businessName;
        if (input.panNumber !== undefined) updateData.panNumber = input.panNumber;
        if (input.vatNumber !== undefined) updateData.vatNumber = input.vatNumber;
        if (input.address !== undefined) updateData.address = input.address;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.language !== undefined) updateData.language = input.language;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                businessName: true,
                panNumber: true,
                vatNumber: true,
                address: true,
                phone: true,
                logoUrl: true,
                language: true,
                updatedAt: true,
            },
        });

        return user;
    },

    /**
     * Change user password
     */
    async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
        }

        // Support both oldPassword and currentPassword field names
        const currentPassword = input.currentPassword || input.oldPassword;
        
        if (!currentPassword) {
            throw new ApiError(400, 'MISSING_PASSWORD', 'Current password is required');
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            throw new ApiError(401, 'INVALID_PASSWORD', 'Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    },
};
