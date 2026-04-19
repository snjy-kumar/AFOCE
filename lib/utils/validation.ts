// ============================================================
// Zod Validation Schemas
// ============================================================

import { z } from "zod";

// ============================================================
// Base Schemas
// ============================================================

export const idSchema = z.string().min(1, "ID is required");

export const emailSchema = z.string().email("Invalid email address");

export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-\+\(\)]{10,20}$/, "Invalid phone number");

// Nepali PAN (Permanent Account Number) - typically 9 digits
export const panSchema = z
  .string()
  .regex(/^\d{9}$/, "PAN must be 9 digits");

// Nepali date format (Baisakh 2081, Jestha 2081, etc.)
export const bsDateSchema = z.string().regex(
  /^(Baisakh|Jestha|Ashadh|Shrawan|Bhadra|Ashwin|Kartik|Mangsir|Poush|Magh|Falgun|Chaitra)\s+\d{4}$/,
  "Invalid BS date format (e.g., 'Baisakh 2081')"
);

// ============================================================
// Invoice Schemas
// ============================================================

export const invoiceStatusSchema = z.enum([
  "draft",
  "pending",
  "paid",
  "overdue",
  "rejected",
]);

export const createInvoiceSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  bs_date: bsDateSchema,
  ad_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  due_days: z.number().int().min(1).max(365).default(30),
  amount: z.number().positive("Amount must be positive"),
  status: invoiceStatusSchema.optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        rate: z.number().positive(),
        amount: z.number().positive(),
      })
    )
    .optional(),
  notes: z.string().max(1000).optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  id: idSchema,
});

export const invoiceStatusTransitionSchema = z.object({
  id: idSchema,
  status: invoiceStatusSchema,
  reason: z.string().max(500).optional(),
});

// ============================================================
// Expense Schemas
// ============================================================

export const expenseStatusSchema = z.enum([
  "pending_approval",
  "manager_review",
  "blocked",
  "approved",
  "rejected",
]);

export const createExpenseSchema = z.object({
  employee: z.string().min(1, "Employee name is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  bs_date: bsDateSchema,
  ad_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  receipt_url: z.string().url().optional().nullable(),
  policy_id: z.string().optional().nullable(),
  description: z.string().max(500).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: idSchema,
});

export const expenseApprovalSchema = z.object({
  id: idSchema,
  action: z.enum(["approve", "reject", "request_review"]),
  notes: z.string().max(500).optional(),
});

// ============================================================
// Client Schemas
// ============================================================

export const clientTypeSchema = z.enum(["client", "vendor"]);

export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  pan: panSchema,
  email: z.union([emailSchema, z.literal("")]).optional().nullable(),
  phone: z.union([phoneSchema, z.literal("")]).optional().nullable(),
  type: clientTypeSchema.default("client"),
  address: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateClientSchema = createClientSchema.partial().extend({
  id: idSchema,
});

// ============================================================
// Policy Schemas
// ============================================================

export const policyCategorySchema = z.enum(["expenses", "approvals", "invoicing"]);

export const createPolicySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  category: policyCategorySchema,
  status: z.enum(["active", "inactive"]).default("active"),
  rules: z
    .array(
      z.object({
        field: z.string(),
        operator: z.enum(["gt", "gte", "lt", "lte", "eq", "neq", "in", "contains"]),
        value: z.union([z.string(), z.number(), z.array(z.string())]),
        action: z.enum(["auto_approve", "require_review", "block"]),
      })
    )
    .optional(),
});

export const updatePolicySchema = createPolicySchema.partial().extend({
  id: idSchema,
});

// ============================================================
// Bank Line Schemas
// ============================================================

export const bankLineStateSchema = z.enum(["matched", "needs_review", "unmatched"]);

export const createBankLineSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  description: z.string().max(500).optional(),
  amount: z.number().refine((n) => n !== 0, "Amount cannot be zero"),
});

export const matchBankLineSchema = z.object({
  id: idSchema,
  matched_invoice_id: z.string().optional().nullable(),
  matched_expense_id: z.string().optional().nullable(),
  confidence: z.number().min(0).max(100).optional(),
});

// ============================================================
// Team Member Schemas
// ============================================================

export const userRoleSchema = z.enum(["finance_admin", "manager", "team_member"]);
export const userStatusSchema = z.enum(["active", "inactive", "pending"]);

export const inviteTeamMemberSchema = z.object({
  email: emailSchema,
  full_name: z.string().min(1).max(100),
  role: userRoleSchema,
  department: z.string().max(50).optional(),
});

export const updateTeamMemberSchema = z.object({
  id: idSchema,
  role: userRoleSchema.optional(),
  department: z.string().max(50).optional().nullable(),
  status: userStatusSchema.optional(),
});

// ============================================================
// Report/Export Schemas
// ============================================================

export const exportFormatSchema = z.enum(["csv", "pdf", "xlsx"]);

export const exportQuerySchema = z.object({
  entity: z.enum(["invoices", "expenses", "clients", "bank_lines"]),
  format: exportFormatSchema,
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.string().optional(),
  clientId: z.string().optional(),
});

// ============================================================
// Batch Operation Schemas
// ============================================================

export const batchOperationSchema = z.object({
  operation: z.enum(["create", "update", "delete"]),
  entity: z.enum(["invoices", "expenses", "clients"]),
  items: z.array(z.record(z.string(), z.unknown())).min(1).max(100),
});

export const batchUpdateStatusSchema = z.object({
  entity: z.enum(["invoices", "expenses"]),
  ids: z.array(idSchema).min(1).max(100),
  status: z.string(),
  reason: z.string().max(500).optional(),
});

// ============================================================
// Query Parameter Schemas
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchQuerySchema = z.object({
  q: z.string().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================================
// Type Exports
// ============================================================

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;
export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
export type BatchOperationInput = z.infer<typeof batchOperationSchema>;
