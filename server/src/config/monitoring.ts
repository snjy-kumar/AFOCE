/**
 * Simple logger using console — no external dependencies
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
    info: (message: string, meta?: Record<string, any>) => {
        if (meta) {
            console.log(`[INFO] ${message}`, meta);
        } else {
            console.log(`[INFO] ${message}`);
        }
    },
    warn: (message: string, meta?: Record<string, any>) => {
        if (meta) {
            console.warn(`[WARN] ${message}`, meta);
        } else {
            console.warn(`[WARN] ${message}`);
        }
    },
    error: (message: string, meta?: Record<string, any> | unknown) => {
        if (meta) {
            console.error(`[ERROR] ${message}`, meta);
        } else {
            console.error(`[ERROR] ${message}`);
        }
    },
    debug: (message: string, meta?: Record<string, any>) => {
        if (isDev) {
            if (meta) {
                console.debug(`[DEBUG] ${message}`, meta);
            } else {
                console.debug(`[DEBUG] ${message}`);
            }
        }
    },
};

/**
 * Basic request logger middleware
 */
export const requestLogger = (req: any, res: any, next: any) => {
    const start = Date.now();
    const skipPaths = ['/favicon.ico', '/robots.txt', '/api/health'];
    const shouldSkip = skipPaths.some(p => req.url.startsWith(p));

    res.on('finish', () => {
        if (shouldSkip && res.statusCode < 400) return;
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
        console.log(`[${level}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });

    next();
};

export function trackError(error: Error, context?: Record<string, any>) {
    logger.error('Application Error', {
        message: error.message,
        stack: error.stack,
        ...context,
    });
}

export function logBusinessEvent(event: string, data: Record<string, any>) {
    logger.info(`Business Event: ${event}`, data);
}

export default logger;
