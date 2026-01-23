/**
 * Enhanced Security Headers Configuration
 * Production-grade security middleware settings
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Custom security headers middleware
 * Additional headers beyond Helmet defaults
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy (disable unnecessary features)
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Remove powered-by header
    res.removeHeader('X-Powered-By');

    // Server header obfuscation
    res.setHeader('Server', 'AFOCE');

    next();
};

/**
 * API security response headers
 */
export const apiSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // Prevent caching of sensitive data
    if (req.path.includes('/api/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }

    next();
};

/**
 * Content Security Policy for production
 */
export const contentSecurityPolicy = {
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
    },
};
