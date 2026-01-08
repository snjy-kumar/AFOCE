import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { sendValidationError } from '../utils/response.js';

/**
 * Request validation middleware using Zod schemas
 * Validates body, query, and params separately
 * 
 * Note: Express 5 made req.query and req.params getter-only properties.
 * Instead of reassigning, we modify the existing objects in-place.
 */

interface ValidationSchemas {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const errors: Record<string, unknown> = {};

        if (schemas.body) {
            const result = schemas.body.safeParse(req.body);
            if (!result.success) {
                errors.body = result.error.errors;
            } else {
                // req.body is mutable, safe to reassign
                req.body = result.data;
            }
        }

        if (schemas.query) {
            const result = schemas.query.safeParse(req.query);
            if (!result.success) {
                errors.query = result.error.errors;
            }
            // Express 5: req.query is read-only, so we don't reassign
            // The validation just ensures the data is valid
            // Controllers will still use req.query directly
        }

        if (schemas.params) {
            const result = schemas.params.safeParse(req.params);
            if (!result.success) {
                errors.params = result.error.errors;
            }
            // Express 5: req.params is read-only, so we don't reassign
            // The validation just ensures the data is valid
            // Controllers will still use req.params directly
        }

        if (Object.keys(errors).length > 0) {
            sendValidationError(res, errors);
            return;
        }

        next();
    };
};
