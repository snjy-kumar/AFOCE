import type { Response, NextFunction } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthenticatedRequest, JwtPayload } from '../types/index.js';
import { sendUnauthorized } from '../utils/response.js';

/**
 * JWT Authentication middleware
 * Verifies token and attaches user payload to request
 */

export const authenticate = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        sendUnauthorized(res, 'No token provided');
        return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        sendUnauthorized(res, 'No token provided');
        return;
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            sendUnauthorized(res, 'Token expired');
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            sendUnauthorized(res, 'Invalid token');
            return;
        }
        sendUnauthorized(res, 'Authentication failed');
    }
};

/**
 * Generate JWT token for a user
 */
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
    // Type assertion needed because jsonwebtoken v9+ uses branded StringValue type
    // for expiresIn, but our env validation ensures the format is valid (e.g., '7d')
    const options: SignOptions = {
        expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, env.JWT_SECRET, options);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
