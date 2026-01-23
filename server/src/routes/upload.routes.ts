import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimit.js';
import * as uploadController from '../controllers/upload.controller.js';
import { env } from '../config/env.js';

/**
 * File Upload Routes
 * All routes require authentication
 */

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(env.UPLOAD_DIR || './uploads', 'temp'));
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: Number(env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // Default 5MB
    },
});

// Ensure temp directory exists
import fs from 'fs';
const tempDir = path.join(env.UPLOAD_DIR || './uploads', 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Apply auth and rate limiting to all routes
router.use(authenticate);
router.use(uploadLimiter);

// POST /api/upload - Generic file upload
router.post(
    '/',
    upload.single('file'),
    uploadController.uploadFile
);

// POST /api/upload/receipt - Upload receipt image
router.post(
    '/receipt',
    upload.single('file'),
    uploadController.uploadReceipt
);

// POST /api/upload/logo - Upload business logo
router.post(
    '/logo',
    upload.single('file'),
    uploadController.uploadLogo
);

// GET /api/upload/files - Get user's uploaded files
router.get('/files', uploadController.getUserFiles);

// DELETE /api/upload/file - Delete a file
router.delete('/file', uploadController.deleteFile);

// DELETE /api/upload/files - Delete all user files (with optional type filter)
router.delete('/files', uploadController.deleteAllUserFiles);

export default router;
