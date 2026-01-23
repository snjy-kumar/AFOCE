/**
 * Export utilities for generating CSV, Excel-compatible files
 */

interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  format?: (value: any) => string;
}

/**
 * Export data to CSV format
 * @param data - Array of objects to export
 * @param columns - Column configuration
 * @param filename - Output filename (without extension)
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create CSV header
  const headers = columns.map(col => col.label).join(',');

  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = col.key.toString().includes('.')
        ? getNestedValue(item, col.key.toString())
        : item[col.key as keyof T];
      
      const formatted = col.format ? col.format(value) : value;
      
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(formatted ?? '');
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  // Combine header and rows
  const csv = [headers, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${getDateString()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to Excel-compatible format (CSV with Excel-specific formatting)
 * @param data - Array of objects to export
 * @param columns - Column configuration
 * @param filename - Output filename (without extension)
 */
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void => {
  // Excel uses same format as CSV but with UTF-8 BOM for proper encoding
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create CSV header
  const headers = columns.map(col => col.label).join(',');

  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = col.key.toString().includes('.')
        ? getNestedValue(item, col.key.toString())
        : item[col.key as keyof T];
      
      const formatted = col.format ? col.format(value) : value;
      
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(formatted ?? '');
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  // Combine header and rows
  const csv = [headers, ...rows].join('\n');

  // Add UTF-8 BOM for Excel
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${getDateString()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get nested object value by path string
 * @param obj - Object to get value from
 * @param path - Dot-notation path (e.g., 'customer.name')
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

/**
 * Get current date string for filename
 * @returns Date string in YYYY-MM-DD format
 */
const getDateString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};
