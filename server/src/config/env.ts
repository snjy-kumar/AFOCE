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

    // File uploads
    UPLOAD_DIR: z.string().default('./uploads'),
    MAX_FILE_SIZE: z.string().transform(Number).default('5242880'), // 5MB
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
