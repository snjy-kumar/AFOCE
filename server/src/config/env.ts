import { z } from 'zod';

/**
 * Environment configuration with Zod validation
 * Ensures all required env vars are present and correctly typed at startup
 */

const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('5000'),

    // Database
    DATABASE_URL: z.string().url(),

    // JWT
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('7d'),

    // CORS
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),

    // File uploads
    UPLOAD_DIR: z.string().default('./uploads'),
    MAX_FILE_SIZE: z.string().transform(Number).default('5242880'), // 5MB

    // Email (optional)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().transform(Number).optional(),
    SMTP_SECURE: z.string().transform(v => v === 'true').optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default('AFOCE <noreply@afoce.com>'),

    // Payment Gateways (optional)
    ESEWA_MERCHANT_ID: z.string().optional(),
    ESEWA_SECRET_KEY: z.string().optional(),
    ESEWA_ENVIRONMENT: z.enum(['development', 'production']).default('development'),
    KHALTI_SECRET_KEY: z.string().optional(),
    KHALTI_PUBLIC_KEY: z.string().optional(),
    KHALTI_ENVIRONMENT: z.enum(['development', 'production']).default('development'),

    // IRD Integration (optional)
    IRD_API_URL: z.string().optional(),
    IRD_API_KEY: z.string().optional(),
    IRD_TAXPAYER_ID: z.string().optional(),
});

// Parse and validate environment variables
const parseEnv = () => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        console.error(result.error.format());
        process.exit(1);
    }

    return result.data;
};

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;
