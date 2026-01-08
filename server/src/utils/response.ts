import type { Response } from 'express';
import type { ApiResponse } from '../types/index.js';

/**
 * Standardized API response utilities
 * Ensures consistent response format across all endpoints
 */

export const sendSuccess = <T>(
    res: Response,
    data: T,
    statusCode = 200,
    meta?: ApiResponse<T>['meta']
): void => {
    const response: ApiResponse<T> = {
        success: true,
        data,
    };

    if (meta) {
        response.meta = meta;
    }

    res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    code: string,
    message: string,
    statusCode = 400,
    details?: unknown
): void => {
    const response: ApiResponse<never> = {
        success: false,
        error: {
            code,
            message,
            details,
        },
    };

    res.status(statusCode).json(response);
};

export const sendNotFound = (
    res: Response,
    resource = 'Resource'
): void => {
    sendError(res, 'NOT_FOUND', `${resource} not found`, 404);
};

export const sendUnauthorized = (
    res: Response,
    message = 'Unauthorized'
): void => {
    sendError(res, 'UNAUTHORIZED', message, 401);
};

export const sendForbidden = (
    res: Response,
    message = 'Forbidden'
): void => {
    sendError(res, 'FORBIDDEN', message, 403);
};

export const sendValidationError = (
    res: Response,
    details: unknown
): void => {
    sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
};

export const sendServerError = (
    res: Response,
    error: Error
): void => {
    console.error('Server Error:', error);
    sendError(
        res,
        'SERVER_ERROR',
        process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : error.message,
        500
    );
};
