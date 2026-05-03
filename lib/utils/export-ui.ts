/**
 * Export UI Utilities - Client-side helpers for exporting data
 */

export type ExportFormat = 'csv' | 'pdf' | 'xlsx';

export interface ExportOptions {
  entity: 'invoices' | 'expenses' | 'clients' | 'bank_lines';
  format: ExportFormat;
  filters?: {
    from?: string;
    to?: string;
    status?: string;
    clientId?: string;
  };
}

/**
 * Trigger file download from blob or string content
 */
export function downloadFile(
  filename: string,
  content: Blob | string,
  mimeType: string = 'text/plain'
): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data from API endpoint
 */
export async function exportData(options: ExportOptions): Promise<void> {
  try {
    const params = new URLSearchParams({
      entity: options.entity,
      format: options.format,
      ...Object.entries(options.filters || {}).reduce(
        (acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        },
        {} as Record<string, string>
      ),
    });

    const response = await fetch(`/api/export?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Export failed');
    }

    const blob = await response.blob();
    const filename = getExportFilename(options.entity, options.format);
    downloadFile(filename, blob, getContentType(options.format));
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

/**
 * Generate appropriate filename for export
 */
function getExportFilename(entity: string, format: ExportFormat): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const extension = format === 'xlsx' ? 'xlsx' : format;
  return `${entity}_export_${timestamp}.${extension}`;
}

/**
 * Get MIME type for export format
 */
function getContentType(format: ExportFormat): string {
  const types: Record<ExportFormat, string> = {
    csv: 'text/csv',
    pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return types[format] || 'application/octet-stream';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file for upload
 */
export function validateFileForUpload(
  file: File,
  maxSize: number = 10 * 1024 * 1024,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${formatFileSize(maxSize)}`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}
