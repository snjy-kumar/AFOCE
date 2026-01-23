/**
 * Environment Variable Validation
 * Ensures all required environment variables are present and valid
 */

import { z } from 'zod';

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('5000'),
  
  // Database
  DATABASE_URL: z.string().url().min(1),
  
  // Redis
  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  
  // File Upload
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('5242880'), // 5MB
  
  // Email (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  
  // APM (Optional)
  SENTRY_DSN: z.string().url().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 */
export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  
  return result.data;
}

/**
 * Check for common misconfigurations
 */
export function checkEnvironmentSecurity(env: EnvConfig): void {
  const warnings: string[] = [];
  
  // Check JWT secret in production
  if (env.NODE_ENV === 'production') {
    if (env.JWT_SECRET.length < 64) {
      warnings.push('⚠️  JWT_SECRET should be at least 64 characters in production');
    }
    
    if (env.JWT_SECRET.includes('secret') || env.JWT_SECRET.includes('test')) {
      warnings.push('🚨 JWT_SECRET appears to be a test value in production!');
    }
    
    if (!env.DATABASE_URL.includes('ssl') && !env.DATABASE_URL.includes('sslmode')) {
      warnings.push('⚠️  DATABASE_URL should use SSL in production');
    }
    
    if (!env.REDIS_PASSWORD) {
      warnings.push('⚠️  REDIS_PASSWORD is not set in production');
    }
    
    if (env.CORS_ORIGIN.includes('localhost')) {
      warnings.push('🚨 CORS_ORIGIN is set to localhost in production!');
    }
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Security Warnings:');
    warnings.forEach(warning => console.warn(warning));
    console.warn('');
  }
}

// Export validated environment
export const env = validateEnv();

// Run security checks
checkEnvironmentSecurity(env);
