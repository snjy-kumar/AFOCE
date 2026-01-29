import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { sendServerError, sendValidationError } from '../utils/response.js';

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error responses
 */

// Custom error class for API errors
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Error handler middleware
export const errorHandler: ErrorRequestHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
        sendValidationError(res, err.errors);
        return;
    }

    // Handle custom API errors
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        });
        return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as Error & { code?: string; meta?: { target?: string[] } };

        if (prismaError.code === 'P2002') {
            res.status(409).json({
                success: false,
                error: {
                    code: 'DUPLICATE_ENTRY',
                    message: 'A record with this value already exists',
                    details: prismaError.meta?.target,
                },
            });
            return;
        }

        if (prismaError.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Record not found',
                },
            });
            return;
        }
    }

    // Handle all other errors
    sendServerError(res, err);
};

// Not found handler for undefined routes
export const notFoundHandler = (
    req: Request,
    res: Response
): void => {
    // Don't log common polling paths to reduce log noise
    const silentPaths = ['/favicon.ico', '/robots.txt', '/manifest.json'];
    const isSilent = silentPaths.includes(req.path);
    
    if (!isSilent) {
        // Only log 404s for actual API attempts
        if (req.path.startsWith('/api')) {
            // This is logged by the request logger middleware
        }
    }
    
    res.status(404).json({
        success: false,
        error: {
            code: 'ROUTE_NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
};
