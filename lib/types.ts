// ============================================================
// AFOCE Unified Type Definitions
// ============================================================

export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue" | "rejected";
export type ExpenseStatus = "pending_approval" | "manager_review" | "blocked" | "approved" | "rejected";
export type ClientType = "client" | "vendor";
export type PolicyCategory = "expenses" | "approvals" | "invoicing";
export type BankLineState = "matched" | "needs_review" | "unmatched";
export type UserRole = "finance_admin" | "manager" | "team_member";
export type UserStatus = "active" | "inactive" | "pending";

// ============================================================
// Invoice
// ============================================================

export interface InvoiceRecord {
  id: string;
  org_id: string;
  client_id: string;
  bs_date: string;
  ad_date: string;
  due_days: number;
  amount: number;
  vat: number;
  status: InvoiceStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceRecordWithClient extends InvoiceRecord {
  client_name?: string;
  client_pan?: string;
}

// ============================================================
// Expense
// ============================================================

export interface ExpenseRecord {
  id: string;
  org_id: string;
  employee: string;
  category: string;
  amount: number;
  bs_date: string;
  ad_date: string;
  status: ExpenseStatus;
  policy_id: string | null;
  receipt_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Client / Contact
// ============================================================

export interface ClientRecord {
  id: string;
  org_id: string;
  name: string;
  pan: string;
  email: string | null;
  phone: string | null;
  type: ClientType;
  address: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Aggregates
  total_invoices?: number;
  total_amount?: number;
}

// ============================================================
// Bank Reconciliation
// ============================================================

export interface BankLineRecord {
  id: string;
  org_id: string;
  date: string;
  description: string | null;
  amount: number;
  matched_invoice_id: string | null;
  matched_expense_id: string | null;
  confidence: number | null;
  state: BankLineState;
  match?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Policy
// ============================================================

export interface PolicyRecord {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  category: PolicyCategory;
  status: "active" | "inactive";
  created_by: string;
  created_at: string;
  updated_at: string;
  // Computed
  triggers_count?: number;
}

// ============================================================
// Team
// ============================================================

export interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  department: string | null;
  status: UserStatus;
  last_active: string | null;
  org_id: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Profile / Workspace
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  department: string | null;
  status: UserStatus;
  last_active: string | null;
  org_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  business_pan: string | null;
  fiscal_year: string;
  active_period: string;
  base_currency: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Reports / VAT
// ============================================================

export interface VATSummary {
  month: string;
  output_tax: number;
  input_tax: number;
  net_payable: number;
}

export interface AuditEntry {
  id: number;
  org_id: string;
  actor_id: string;
  action: "create" | "update" | "delete";
  entity_type: string;
  entity_id: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
  // Joined
  actor_email?: string;
}

export interface ReportCard {
  title: string;
  value: string;
  detail: string;
}

// ============================================================
// Analytics
// ============================================================

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
  color: string;
  bg: string;
}

// ============================================================
// API Response Shapes
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
