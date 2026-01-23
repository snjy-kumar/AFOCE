/**
 * Request Validation Utilities
 * Additional security checks for incoming requests
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/monitoring.js';

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
};

/**
 * Validate request body size
 */
export const validateBodySize = (maxSize: number = 10485760) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const contentLength = parseInt(req.headers['content-length'] || '0', 10);
        
        if (contentLength > maxSize) {
            logger.warn('Request body too large', {
                size: contentLength,
                maxSize,
                ip: req.ip,
                path: req.path,
            });
            
            res.status(413).json({
                success: false,
                message: 'Request body too large',
            });
            return;
        }
        
        next();
    };
};

/**
 * Detect and block suspicious patterns
 */
export const detectSuspiciousPatterns = (req: Request, res: Response, next: NextFunction): void => {
    const suspiciousPatterns = [
        /(\.\.)|(\/etc\/)/i,           // Path traversal
        /(union.*select|insert.*into)/i, // SQL injection
        /<script|javascript:|onerror=/i,  // XSS
        /(\$\{|\{\{)/,                    // Template injection
    ];

    const checkString = JSON.stringify(req.body) + JSON.stringify(req.query);

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(checkString)) {
            logger.warn('Suspicious request pattern detected', {
                pattern: pattern.toString(),
                ip: req.ip,
                path: req.path,
                method: req.method,
            });

            res.status(400).json({
                success: false,
                message: 'Invalid request',
            });
            return;
        }
    }

    next();
};

/**
 * Validate content type
 */
export const validateContentType = (allowedTypes: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            const contentType = req.headers['content-type'] || '';
            const isAllowed = allowedTypes.some(type => contentType.includes(type));

            if (!isAllowed) {
                res.status(415).json({
                    success: false,
                    message: 'Unsupported content type',
                });
                return;
            }
        }

        next();
    };
};
