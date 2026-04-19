// ============================================================
// Secure File Upload Handler with Supabase Storage
// ============================================================

import { createServerClient } from "@supabase/ssr";
import sharp from "sharp";
import { nanoid } from "nanoid";

// File type configurations
export const allowedFileTypes = {
  receipt: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  avatar: ["image/jpeg", "image/png", "image/webp"],
  invoice: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  general: ["image/jpeg", "image/png", "image/webp", "application/pdf", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
};

// File size limits (in bytes)
export const fileSizeLimits = {
  receipt: 5 * 1024 * 1024, // 5MB
  avatar: 2 * 1024 * 1024, // 2MB
  invoice: 10 * 1024 * 1024, // 10MB
  general: 20 * 1024 * 1024, // 20MB
};

// Storage buckets
export const storageBuckets = {
  receipts: "receipts",
  avatars: "avatars",
  invoices: "invoice-attachments",
  general: "general",
};

// Validate file before upload
export function validateFile(
  file: File,
  type: keyof typeof allowedFileTypes
): { valid: boolean; error?: string } {
  // Check file type
  if (!allowedFileTypes[type].includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedFileTypes[type].join(", ")}`,
    };
  }

  // Check file size
  if (file.size > fileSizeLimits[type]) {
    const limitMB = fileSizeLimits[type] / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size: ${limitMB}MB`,
    };
  }

  return { valid: true };
}

// Generate unique filename
export function generateFileName(originalName: string): string {
  const extension = originalName.split(".").pop() || "";
  const uniqueId = nanoid(10);
  const timestamp = Date.now();
  return `${timestamp}-${uniqueId}.${extension}`;
}

// Process image (resize, optimize)
export async function processImage(
  buffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
  } = {}
): Promise<Buffer> {
  const { width = 1200, height, quality = 80, format = "jpeg" } = options;

  let pipeline = sharp(buffer);

  // Get metadata
  const metadata = await pipeline.metadata();

  // Resize if needed
  if (metadata.width && metadata.width > width) {
    pipeline = pipeline.resize(width, height, { fit: "inside", withoutEnlargement: true });
  }

  // Convert and optimize
  switch (format) {
    case "jpeg":
      pipeline = pipeline.jpeg({ quality, progressive: true });
      break;
    case "png":
      pipeline = pipeline.png({ quality, progressive: true });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
  }

  return pipeline.toBuffer();
}

// Upload file to Supabase Storage
export async function uploadFile({
  supabase,
  file,
  bucket,
  folder,
  orgId,
  processImage: shouldProcess = false,
}: {
  supabase: ReturnType<typeof createServerClient>;
  file: File;
  bucket: string;
  folder?: string;
  orgId: string;
  processImage?: boolean;
}): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileName = generateFileName(file.name);
    const path = folder ? `${orgId}/${folder}/${fileName}` : `${orgId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let buffer = Buffer.from(arrayBuffer) as any;

    // Process image if needed
    if (shouldProcess && file.type.startsWith("image/")) {
      buffer = await processImage(buffer);
    }

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("Upload error:", error);
    return { url: null, error: (error as Error).message };
  }
}

// Delete file from storage
export async function deleteFile({
  supabase,
  bucket,
  path,
}: {
  supabase: ReturnType<typeof createServerClient>;
  bucket: string;
  path: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Get file path from URL
export function extractFilePath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/object\/public\/[^/]+\/(.+)/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
}

// Batch upload files
export async function uploadFiles({
  supabase,
  files,
  bucket,
  folder,
  orgId,
  processImage = false,
}: {
  supabase: ReturnType<typeof createServerClient>;
  files: File[];
  bucket: string;
  folder?: string;
  orgId: string;
  processImage?: boolean;
}): Promise<{ results: { fileName: string; url: string | null; error: string | null }[] }> {
  const results = await Promise.all(
    files.map(async (file) => {
      const result = await uploadFile({
        supabase,
        file,
        bucket,
        folder,
        orgId,
        processImage,
      });
      return { fileName: file.name, url: result.url, error: result.error };
    })
  );

  return { results };
}
