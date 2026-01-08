import { Request } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { env } from '../config/env.js';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZES, type UploadType } from '../schemas/upload.schema.js';

/**
 * File Upload Service
 * Handles file uploads, validation, and storage
 */

// ============================================
// CONFIGURATION
// ============================================

const UPLOAD_BASE_DIR = env.UPLOAD_DIR || './uploads';

// Ensure upload directories exist
async function ensureUploadDirs(): Promise<void> {
    const dirs = ['receipts', 'logos', 'invoices', 'attachments'];
    for (const dir of dirs) {
        const fullPath = path.join(UPLOAD_BASE_DIR, dir);
        await fs.mkdir(fullPath, { recursive: true });
    }
}

// Initialize on module load
ensureUploadDirs().catch(console.error);

// ============================================
// UPLOAD HELPERS
// ============================================

function getUploadDir(type: UploadType): string {
    const dirMap: Record<UploadType, string> = {
        receipt: 'receipts',
        logo: 'logos',
        invoice_pdf: 'invoices',
        attachment: 'attachments',
    };
    return path.join(UPLOAD_BASE_DIR, dirMap[type]);
}

function generateFileName(originalName: string, userId: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${userId}_${timestamp}_${random}${ext}`;
}

// ============================================
// VALIDATION
// ============================================

export function validateFile(
    file: Express.Multer.File,
    type: UploadType
): { valid: boolean; error?: string } {
    // Check MIME type
    const allowedTypes = ALLOWED_MIME_TYPES[type];
    if (!allowedTypes.includes(file.mimetype)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
        };
    }

    // Check file size
    const maxSize = MAX_FILE_SIZES[type];
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
        };
    }

    return { valid: true };
}

// ============================================
// STORAGE OPERATIONS
// ============================================

export async function saveUploadedFile(
    file: Express.Multer.File,
    type: UploadType,
    userId: string
): Promise<{ url: string; path: string; filename: string }> {
    // Validate file
    const validation = validateFile(file, type);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Generate file path
    const uploadDir = getUploadDir(type);
    const filename = generateFileName(file.originalname, userId);
    const filePath = path.join(uploadDir, filename);

    // Save file (move from temp location or write buffer)
    if (file.path) {
        // File was saved to disk by multer
        await fs.rename(file.path, filePath);
    } else if (file.buffer) {
        // File is in memory
        await fs.writeFile(filePath, file.buffer);
    } else {
        throw new Error('No file data available');
    }

    // Generate URL (relative path for serving)
    const url = `/uploads/${path.relative(UPLOAD_BASE_DIR, filePath).replace(/\\/g, '/')}`;

    return { url, path: filePath, filename };
}

export async function deleteFile(filePath: string): Promise<boolean> {
    try {
        await fs.unlink(filePath);
        return true;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            // File doesn't exist, consider it deleted
            return true;
        }
        throw error;
    }
}

export async function deleteFileByUrl(url: string): Promise<boolean> {
    // Convert URL to file path
    const relativePath = url.replace(/^\/uploads\//, '');
    const filePath = path.join(UPLOAD_BASE_DIR, relativePath);
    return deleteFile(filePath);
}

// ============================================
// FILE INFO
// ============================================

export async function getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    createdAt?: Date;
    mimeType?: string;
} | null> {
    try {
        const stats = await fs.stat(filePath);
        const ext = path.extname(filePath).toLowerCase();

        // Simple MIME type detection
        const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
            '.svg': 'image/svg+xml',
        };

        return {
            exists: true,
            size: stats.size,
            createdAt: stats.birthtime,
            mimeType: mimeTypes[ext] || 'application/octet-stream',
        };
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return { exists: false };
        }
        throw error;
    }
}

// ============================================
// USER FILE MANAGEMENT
// ============================================

export async function getUserFiles(
    userId: string,
    type?: UploadType
): Promise<Array<{ filename: string; url: string; size: number; createdAt: Date }>> {
    const files: Array<{ filename: string; url: string; size: number; createdAt: Date }> = [];

    const typesToCheck: UploadType[] = type
        ? [type]
        : ['receipt', 'logo', 'invoice_pdf', 'attachment'];

    for (const uploadType of typesToCheck) {
        const dir = getUploadDir(uploadType);

        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isFile() && entry.name.startsWith(userId)) {
                    const filePath = path.join(dir, entry.name);
                    const stats = await fs.stat(filePath);
                    const url = `/uploads/${path.relative(UPLOAD_BASE_DIR, filePath).replace(/\\/g, '/')}`;

                    files.push({
                        filename: entry.name,
                        url,
                        size: stats.size,
                        createdAt: stats.birthtime,
                    });
                }
            }
        } catch (error) {
            // Directory might not exist yet
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }

    return files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function deleteUserFiles(userId: string, type?: UploadType): Promise<number> {
    const files = await getUserFiles(userId, type);
    let deleted = 0;

    for (const file of files) {
        const filePath = path.join(UPLOAD_BASE_DIR, file.url.replace(/^\/uploads\//, ''));
        if (await deleteFile(filePath)) {
            deleted++;
        }
    }

    return deleted;
}

// ============================================
// MULTER CONFIG HELPER
// ============================================

export function getMulterConfig(type: UploadType) {
    return {
        limits: {
            fileSize: MAX_FILE_SIZES[type],
        },
        fileFilter: (
            _req: Request,
            file: Express.Multer.File,
            cb: (error: Error | null, acceptFile: boolean) => void
        ) => {
            const validation = validateFile(file, type);
            if (validation.valid) {
                cb(null, true);
            } else {
                cb(new Error(validation.error || 'Invalid file'), false);
            }
        },
    };
}
