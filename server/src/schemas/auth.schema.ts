import { z } from 'zod';

/**
 * Authentication validation schemas
 */

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    panNumber: z.string().optional(),
    vatNumber: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
    businessName: z.string().min(2).optional(),
    panNumber: z.string().optional(),
    vatNumber: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    language: z.enum(['en', 'ne']).optional(),
});

export const changePasswordSchema = z.object({
    // Accept both oldPassword and currentPassword for flexibility
    oldPassword: z.string().min(1, 'Current password is required').optional(),
    currentPassword: z.string().min(1, 'Current password is required').optional(),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
}).refine((data) => data.oldPassword || data.currentPassword, {
    message: 'Current password is required (use either oldPassword or currentPassword field)',
    path: ['currentPassword'],
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema> & {
    oldPassword?: string;
    currentPassword?: string;
};
