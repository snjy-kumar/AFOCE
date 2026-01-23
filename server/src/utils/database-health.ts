/**
 * Database Health & Connection Management
 * Ensure database connectivity before accepting requests
 */

import prisma from '../lib/prisma.js';
import { logger } from '../config/monitoring.js';

/**
 * Test database connectivity
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        logger.error('Database connection failed:', error);
        return false;
    }
};

/**
 * Wait for database to be ready (useful for Docker startup)
 */
export const waitForDatabase = async (
    maxRetries: number = 10,
    delayMs: number = 2000
): Promise<void> => {
    let retries = 0;

    while (retries < maxRetries) {
        const isConnected = await checkDatabaseConnection();
        
        if (isConnected) {
            logger.info('✓ Database connection established');
            return;
        }

        retries++;
        logger.warn(`Database not ready, retrying... (${retries}/${maxRetries})`);
        
        if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    throw new Error('Database connection failed after maximum retries');
};

/**
 * Gracefully disconnect from database
 */
export const disconnectDatabase = async (): Promise<void> => {
    try {
        await prisma.$disconnect();
        logger.info('✓ Database connection closed');
    } catch (error) {
        logger.error('Error disconnecting from database:', error);
        throw error;
    }
};

/**
 * Check if migrations are up to date
 */
export const checkMigrationStatus = async (): Promise<void> => {
    try {
        // This query will fail if migrations haven't been run
        await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
        logger.info('✓ Database migrations verified');
    } catch (error) {
        logger.error('Database schema not initialized. Run: npm run db:migrate', error);
        throw new Error('Database migrations required');
    }
};
