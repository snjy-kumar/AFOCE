/**
 * Process Error Handlers
 * Catch unhandled errors and prevent crashes in production
 */

import { logger } from '../config/monitoring.js';

/**
 * Handle uncaught exceptions
 * These should never happen, but we log them and exit gracefully
 */
export const handleUncaughtException = (error: Error): void => {
    logger.error('❌ UNCAUGHT EXCEPTION - Application will exit', {
        error: error.message,
        stack: error.stack,
        type: 'UncaughtException',
    });

    // Give logger time to flush
    setTimeout(() => {
        process.exit(1);
    }, 1000);
};

/**
 * Handle unhandled promise rejections
 * Log and exit to prevent undefined behavior
 */
export const handleUnhandledRejection = (reason: unknown, promise: Promise<unknown>): void => {
    logger.error('❌ UNHANDLED PROMISE REJECTION - Application will exit', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        promise: String(promise),
        type: 'UnhandledRejection',
    });

    // Give logger time to flush
    setTimeout(() => {
        process.exit(1);
    }, 1000);
};

/**
 * Handle SIGTERM (container/process manager shutdown)
 */
export const handleSIGTERM = (shutdownCallback: () => Promise<void>): void => {
    logger.info('SIGTERM signal received - Starting graceful shutdown');
    shutdownCallback().catch((error) => {
        logger.error('Error during SIGTERM shutdown:', error);
        process.exit(1);
    });
};

/**
 * Handle SIGINT (Ctrl+C)
 */
export const handleSIGINT = (shutdownCallback: () => Promise<void>): void => {
    logger.info('SIGINT signal received - Starting graceful shutdown');
    shutdownCallback().catch((error) => {
        logger.error('Error during SIGINT shutdown:', error);
        process.exit(1);
    });
};

/**
 * Setup all process event handlers
 */
export const setupProcessHandlers = (shutdownCallback: () => Promise<void>): void => {
    // Uncaught exceptions
    process.on('uncaughtException', handleUncaughtException);

    // Unhandled promise rejections
    process.on('unhandledRejection', handleUnhandledRejection);

    // Graceful shutdown signals
    process.on('SIGTERM', () => handleSIGTERM(shutdownCallback));
    process.on('SIGINT', () => handleSIGINT(shutdownCallback));

    // Warning events (memory leaks, etc.)
    process.on('warning', (warning) => {
        logger.warn('Node.js process warning', {
            name: warning.name,
            message: warning.message,
            stack: warning.stack,
        });
    });

    logger.info('✓ Process error handlers initialized');
};
