import { Response, NextFunction } from 'express';
import * as uploadService from '../services/upload.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { UploadType } from '../schemas/upload.schema.js';

/**
 * File Upload Controller
 */

// Upload a file
export async function uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.file) {
            return sendError(res, 'BAD_REQUEST', 'No file uploaded', 400);
        }

        const type = (req.body.type as UploadType) || 'attachment';
        const result = await uploadService.saveUploadedFile(req.file, type, req.user!.userId);

        sendSuccess(res, result, 201);
    } catch (error) {
        next(error);
    }
}

// Upload receipt (shorthand)
export async function uploadReceipt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.file) {
            return sendError(res, 'BAD_REQUEST', 'No file uploaded', 400);
        }

        const result = await uploadService.saveUploadedFile(req.file, 'receipt', req.user!.userId);
        sendSuccess(res, result, 201);
    } catch (error) {
        next(error);
    }
}

// Upload logo (shorthand)
export async function uploadLogo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.file) {
            return sendError(res, 'BAD_REQUEST', 'No file uploaded', 400);
        }

        const result = await uploadService.saveUploadedFile(req.file, 'logo', req.user!.userId);
        sendSuccess(res, result, 201);
    } catch (error) {
        next(error);
    }
}

// Get user's uploaded files
export async function getUserFiles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const type = req.query.type as UploadType | undefined;
        const files = await uploadService.getUserFiles(req.user!.userId, type);
        sendSuccess(res, files);
    } catch (error) {
        next(error);
    }
}

// Delete a file by URL
export async function deleteFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { url } = req.body;

        if (!url) {
            return sendError(res, 'BAD_REQUEST', 'File URL is required', 400);
        }

        // Verify the file belongs to the user (filename starts with userId)
        if (!url.includes(req.user!.userId)) {
            return sendError(res, 'FORBIDDEN', 'Unauthorized to delete this file', 403);
        }

        const deleted = await uploadService.deleteFileByUrl(url);

        if (!deleted) {
            return sendError(res, 'SERVER_ERROR', 'Failed to delete file', 500);
        }

        sendSuccess(res, null);
    } catch (error) {
        next(error);
    }
}

// Delete all user files (optional - for account deletion)
export async function deleteAllUserFiles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const type = req.query.type as UploadType | undefined;
        const count = await uploadService.deleteUserFiles(req.user!.userId, type);
        sendSuccess(res, { deleted: count });
    } catch (error) {
        next(error);
    }
}
