/**
 * Client-side file download utilities
 * Used to download CSV, PDF, and other files from the browser
 */

/**
 * Download file from content string
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType });
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
 * Download file from blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
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
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  downloadFile(content, filename, 'text/csv;charset=utf-8;');
}

/**
 * Download JSON file
 */
export function downloadJSON(data: unknown, filename: string): void {
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, filename, 'application/json');
}

/**
 * Generate timestamp for filename
 */
export function getTimestampedFilename(baseName: string, extension: string): string {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD
  return `${baseName}_${timestamp}.${extension}`;
}

/**
 * Request file download from API
 */
export async function downloadFromAPI(
  endpoint: string,
  params: Record<string, string> = {},
  filename = 'download'
): Promise<void> {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    const downloadFilename = contentDisposition?.match(/filename="?([^"]*)"?/)?.[1] || filename;

    downloadBlob(blob, downloadFilename);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}
