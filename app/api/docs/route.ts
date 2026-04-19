// ============================================================
// API Documentation
// ============================================================

import { NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/utils/security";

export async function GET() {
  const docs = {
    name: "AFOCE Accounting API",
    version: "1.0.0",
    description: "Complete accounting API for invoicing, expenses, and financial management",
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

    authentication: {
      type: "Session Cookie",
      description: "Uses Supabase Auth with session cookies",
    },

    rateLimiting: {
      description: "Rate limits vary by endpoint type",
      limits: {
        auth: "5 requests per minute",
        api: "100 requests per minute",
        export: "10 requests per minute",
        upload: "20 requests per hour",
        batch: "30 requests per minute",
      },
    },

    endpoints: {
      // Auth
      "POST /api/auth/session": {
        description: "Get current session",
        auth: true,
      },

      // Clients
      "GET /api/clients": {
        description: "List clients",
        auth: true,
        query: ["page", "pageSize", "type", "search", "sortBy", "sortOrder"],
      },
      "POST /api/clients": {
        description: "Create client",
        auth: true,
        body: ["name", "pan", "email", "phone", "type"],
      },
      "GET /api/clients/:id": {
        description: "Get client details",
        auth: true,
      },
      "PATCH /api/clients/:id": {
        description: "Update client",
        auth: true,
      },
      "DELETE /api/clients/:id": {
        description: "Delete client",
        auth: true,
        role: "finance_admin",
      },

      // Invoices
      "GET /api/invoices": {
        description: "List invoices",
        auth: true,
        query: ["page", "pageSize", "status", "clientId", "from", "to", "minAmount", "maxAmount", "search", "sortBy", "sortOrder"],
      },
      "POST /api/invoices": {
        description: "Create invoice",
        auth: true,
        body: ["client_id", "bs_date", "ad_date", "amount", "due_days", "status", "items"],
      },
      "GET /api/invoices/:id": {
        description: "Get invoice details",
        auth: true,
      },
      "PATCH /api/invoices/:id": {
        description: "Update invoice",
        auth: true,
      },
      "DELETE /api/invoices/:id": {
        description: "Delete invoice",
        auth: true,
        role: "finance_admin",
      },
      "PATCH /api/invoices/:id/status": {
        description: "Update invoice status (workflow)",
        auth: true,
        body: ["status", "reason"],
      },

      // Expenses
      "GET /api/expenses": {
        description: "List expenses",
        auth: true,
        query: ["page", "pageSize", "status", "category", "employee", "minAmount", "maxAmount", "from", "to", "sortBy", "sortOrder"],
      },
      "POST /api/expenses": {
        description: "Create expense",
        auth: true,
        body: ["employee", "category", "amount", "bs_date", "ad_date", "receipt_url", "description"],
      },
      "GET /api/expenses/:id": {
        description: "Get expense details",
        auth: true,
      },
      "PATCH /api/expenses/:id": {
        description: "Update expense",
        auth: true,
      },
      "DELETE /api/expenses/:id": {
        description: "Delete expense",
        auth: true,
        role: "finance_admin",
      },
      "POST /api/expenses/:id/approve": {
        description: "Approve/reject expense (workflow)",
        auth: true,
        body: ["action", "notes"],
        action: ["approve", "reject", "request_review"],
      },

      // Bank Lines
      "GET /api/bank-lines": {
        description: "List bank transactions",
        auth: true,
        query: ["page", "pageSize", "state"],
      },
      "POST /api/bank-lines": {
        description: "Upload bank transactions",
        auth: true,
        body: ["lines"],
      },
      "POST /api/bank-lines/:id/match": {
        description: "Match transaction to invoice/expense",
        auth: true,
      },

      // Policies
      "GET /api/policies": {
        description: "List policies",
        auth: true,
      },
      "POST /api/policies": {
        description: "Create policy",
        auth: true,
        role: "finance_admin",
      },
      "PATCH /api/policies/:id": {
        description: "Update policy",
        auth: true,
        role: "finance_admin",
      },

      // Team
      "GET /api/team": {
        description: "List team members",
        auth: true,
      },
      "POST /api/team/invite": {
        description: "Invite team member",
        auth: true,
        role: "finance_admin",
      },
      "PATCH /api/team/:id": {
        description: "Update team member",
        auth: true,
        role: "finance_admin",
      },

      // Analytics
      "GET /api/analytics": {
        description: "Get dashboard metrics",
        auth: true,
        query: ["period"],
      },
      "GET /api/reports/vat": {
        description: "VAT report",
        auth: true,
        query: ["month", "year"],
      },
      "GET /api/reports/audit": {
        description: "Audit trail",
        auth: true,
        query: ["page", "pageSize", "entityType", "from", "to"],
      },

      // Batch Operations
      "POST /api/batch": {
        description: "Batch CRUD operations",
        auth: true,
        body: ["operation", "entity", "items"],
        operations: ["create", "update", "delete"],
        entities: ["invoices", "expenses", "clients"],
      },
      "PATCH /api/batch": {
        description: "Batch status update",
        auth: true,
        body: ["entity", "ids", "status", "reason"],
      },

      // Export
      "GET /api/export": {
        description: "Export data to CSV/PDF/Excel",
        auth: true,
        query: ["entity", "format", "from", "to", "status", "clientId"],
        formats: ["csv", "pdf", "xlsx"],
      },
      "POST /api/export": {
        description: "Generate single invoice PDF",
        auth: true,
        body: ["invoiceId", "format"],
      },

      // Upload
      "POST /api/upload": {
        description: "Upload files",
        auth: true,
        body: ["file", "type", "folder"],
        types: ["receipt", "avatar", "invoice", "general"],
      },
      "DELETE /api/upload": {
        description: "Delete uploaded file",
        auth: true,
        query: ["url"],
      },

      // Notifications
      "GET /api/notifications": {
        description: "Get notifications",
        auth: true,
        query: ["unread", "page", "pageSize"],
      },
      "PATCH /api/notifications": {
        description: "Mark notification as read",
        auth: true,
        body: ["notificationId", "markAll"],
      },
      "DELETE /api/notifications": {
        description: "Delete notification",
        auth: true,
        query: ["id"],
      },

      // Health
      "GET /api/health": {
        description: "Health check",
        auth: false,
      },
      "GET /api/docs": {
        description: "API documentation",
        auth: false,
      },
    },

    statusCodes: {
      200: "Success",
      201: "Created",
      400: "Bad Request - Validation error",
      401: "Unauthorized - Not authenticated",
      403: "Forbidden - Insufficient permissions",
      404: "Not Found - Resource doesn't exist",
      409: "Conflict - Resource already exists",
      429: "Too Many Requests - Rate limit exceeded",
      500: "Internal Server Error",
    },

    responseFormat: {
      success: {
        data: "Response data",
        error: null,
      },
      error: {
        data: null,
        error: {
          message: "Error message",
          errors: ["Array of validation errors (optional)"],
        },
      },
    },
  };

  return applySecurityHeaders(
    NextResponse.json(docs, { status: 200 })
  );
}
