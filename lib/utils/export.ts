// ============================================================
// Export Utilities (CSV, PDF, Excel)
// ============================================================

import Papa from "papaparse";
import { InvoiceRecord, ExpenseRecord, ClientRecord, BankLineRecord } from "@/lib/types";

// CSV Export
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): { content: string; contentType: string; filename: string } {
  const csv = Papa.unparse(data, {
    header: true,
    skipEmptyLines: true,
  });

  return {
    content: csv,
    contentType: "text/csv",
    filename: `${filename}.csv`,
  };
}

// PDF Generation (simplified - for full PDF support, use a library like pdfkit)
export async function exportToPDF(
  title: string,
  data: Record<string, unknown>[],
  columns: { key: string; header: string }[],
  summary?: { label: string; value: string }[]
): Promise<{ content: Uint8Array; contentType: string; filename: string }> {
  // Returns Uint8Array (Buffer compatible in Node.js)
  // This is a simplified version that generates HTML for PDF conversion
  const rows = data.map((row) =>
    columns.map((col) => String(row[col.key] ?? "")).join("</td><td>")
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; margin: 40px; }
        h1 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .summary-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .footer { margin-top: 40px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>

      ${summary ? `
        <div class="summary">
          <h3>Summary</h3>
          ${summary.map(s => `<div class="summary-row"><span>${s.label}:</span><strong>${s.value}</strong></div>`).join("")}
        </div>
      ` : ""}

      <table>
        <thead>
          <tr>
            ${columns.map((col) => `<th>${col.header}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr><td>${row}</td></tr>`).join("")}
        </tbody>
      </table>

      <div class="footer">
        AFOCE Accounting System
      </div>
    </body>
    </html>
  `;

  // Return HTML that can be converted to PDF using a service like Puppeteer
  return {
    content: new TextEncoder().encode(html),
    contentType: "text/html",
    filename: `${title.replace(/\s+/g, "_")}.html`,
  };
}

// Invoice to PDF
export async function generateInvoicePDF(
  invoice: InvoiceRecord & { client_name?: string; client_pan?: string; client_address?: string },
  orgDetails: { name: string; pan?: string; address?: string }
): Promise<{ content: Uint8Array; contentType: string; filename: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; margin: 40px; color: #1f2937; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
        .org-name { font-size: 24px; font-weight: bold; color: #2563eb; }
        .invoice-title { font-size: 28px; font-weight: bold; margin: 30px 0; }
        .details { display: flex; justify-content: space-between; margin: 20px 0; }
        .details-box { width: 45%; }
        .details-label { color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
        .details-value { font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { background: #f3f4f6; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .total-section { margin-left: auto; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #1f2937; padding-top: 8px; }
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="org-name">${orgDetails.name}</div>
          <div>${orgDetails.pan ? `PAN: ${orgDetails.pan}` : ""}</div>
          <div>${orgDetails.address || ""}</div>
        </div>
        <div style="text-align: right;">
          <div class="details-label">Invoice #</div>
          <div class="details-value">${invoice.id}</div>
          <div class="details-label" style="margin-top: 12px;">Status</div>
          <div class="details-value" style="text-transform: uppercase; color: ${invoice.status === "paid" ? "#16a34a" : invoice.status === "overdue" ? "#dc2626" : "#2563eb"};">${invoice.status}</div>
        </div>
      </div>

      <div class="invoice-title">INVOICE</div>

      <div class="details">
        <div class="details-box">
          <div class="details-label">Bill To</div>
          <div class="details-value">${invoice.client_name}</div>
          <div>PAN: ${invoice.client_pan}</div>
          <div>${invoice.client_address || ""}</div>
        </div>
        <div class="details-box" style="text-align: right;">
          <div class="details-label">Invoice Date (BS)</div>
          <div class="details-value">${invoice.bs_date}</div>
          <div class="details-label" style="margin-top: 12px;">Invoice Date (AD)</div>
          <div class="details-value">${invoice.ad_date}</div>
          <div class="details-label" style="margin-top: 12px;">Due Days</div>
          <div class="details-value">${invoice.due_days}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Professional Services</td>
            <td style="text-align: right;">NPR ${invoice.amount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span>Subtotal</span>
          <span>NPR ${invoice.amount.toLocaleString()}</span>
        </div>
        <div class="total-row">
          <span>VAT (13%)</span>
          <span>NPR ${invoice.vat.toLocaleString()}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total</span>
          <span>NPR ${(invoice.amount + invoice.vat).toLocaleString()}</span>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>This is a computer-generated invoice and requires no signature.</p>
      </div>
    </body>
    </html>
  `;

  return {
    content: new TextEncoder().encode(html),
    contentType: "text/html",
    filename: `Invoice_${invoice.id}.html`,
  };
}

// Transform data for export
export function transformForExport(
  entity: "invoices" | "expenses" | "clients" | "bank_lines",
  data: unknown[]
): Record<string, unknown>[] {
  switch (entity) {
    case "invoices":
      return (data as InvoiceRecord[]).map((item) => ({
        "Invoice ID": item.id,
        "Client ID": item.client_id,
        "BS Date": item.bs_date,
        "AD Date": item.ad_date,
        "Due Days": item.due_days,
        "Amount": item.amount,
        "VAT": item.vat,
        "Total": item.amount + item.vat,
        "Status": item.status,
        "Created At": item.created_at,
      }));

    case "expenses":
      return (data as ExpenseRecord[]).map((item) => ({
        "Expense ID": item.id,
        "Employee": item.employee,
        "Category": item.category,
        "Amount": item.amount,
        "BS Date": item.bs_date,
        "AD Date": item.ad_date,
        "Status": item.status,
        "Policy ID": item.policy_id,
        "Created At": item.created_at,
      }));

    case "clients":
      return (data as ClientRecord[]).map((item) => ({
        "Client ID": item.id,
        "Name": item.name,
        "PAN": item.pan,
        "Email": item.email,
        "Phone": item.phone,
        "Type": item.type,
        "Created At": item.created_at,
      }));

    case "bank_lines":
      return (data as BankLineRecord[]).map((item) => ({
        "Transaction ID": item.id,
        "Date": item.date,
        "Description": item.description,
        "Amount": item.amount,
        "State": item.state,
        "Confidence": item.confidence,
        "Matched Invoice": item.matched_invoice_id,
        "Matched Expense": item.matched_expense_id,
      }));

    default:
      return [];
  }
}

// Calculate summary statistics for exports
export function calculateExportSummary(
  entity: "invoices" | "expenses" | "clients" | "bank_lines",
  data: unknown[]
): { label: string; value: string }[] {
  switch (entity) {
    case "invoices": {
      const items = data as InvoiceRecord[];
      const total = items.reduce((sum, i) => sum + i.amount + i.vat, 0);
      const paid = items.filter((i) => i.status === "paid").length;
      const pending = items.filter((i) => i.status === "pending").length;
      const overdue = items.filter((i) => i.status === "overdue").length;
      return [
        { label: "Total Records", value: String(items.length) },
        { label: "Total Amount", value: `NPR ${total.toLocaleString()}` },
        { label: "Paid", value: String(paid) },
        { label: "Pending", value: String(pending) },
        { label: "Overdue", value: String(overdue) },
      ];
    }

    case "expenses": {
      const items = data as ExpenseRecord[];
      const total = items.reduce((sum, i) => sum + i.amount, 0);
      const approved = items.filter((i) => i.status === "approved").length;
      const pending = items.filter((i) => i.status === "pending_approval").length;
      return [
        { label: "Total Records", value: String(items.length) },
        { label: "Total Amount", value: `NPR ${total.toLocaleString()}` },
        { label: "Approved", value: String(approved) },
        { label: "Pending", value: String(pending) },
      ];
    }

    case "clients":
      return [
        { label: "Total Records", value: String(data.length) },
      ];

    case "bank_lines": {
      const items = data as BankLineRecord[];
      const total = items.reduce((sum, i) => sum + i.amount, 0);
      const matched = items.filter((i) => i.state === "matched").length;
      return [
        { label: "Total Transactions", value: String(items.length) },
        { label: "Total Amount", value: `NPR ${total.toLocaleString()}` },
        { label: "Matched", value: String(matched) },
      ];
    }

    default:
      return [];
  }
}
