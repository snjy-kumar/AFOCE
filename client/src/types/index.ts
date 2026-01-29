// ============================================
// Common Types for AFOCE
// Adaptive Financial Operations & Compliance Engine
// ============================================

// User & Authentication
export interface User {
    id: string;
    email: string;
    businessName: string;
    panNumber?: string;
    vatNumber?: string;
    address?: string;
    phone?: string;
    logoUrl?: string;
    settings: Record<string, unknown>;
    language: 'en' | 'ne';
    createdAt: string;
    updatedAt: string;
}

// Account Types
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export interface Account {
    id: string;
    code: string;
    name: string;
    nameNe?: string;
    type: AccountType;
    description?: string;
    parentId?: string;
    isSystem: boolean;
    isActive: boolean;
    children?: Account[];
}

// Customer
export interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    panNumber?: string;
    address?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Vendor
export interface Vendor {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    panNumber?: string;
    address?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Invoice
export type InvoiceStatus = 
    | 'DRAFT' 
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'REJECTED'
    | 'SENT' 
    | 'PAID' 
    | 'PARTIALLY_PAID' 
    | 'OVERDUE' 
    | 'CANCELLED';

export interface InvoiceItem {
    id: string;
    accountId: string;
    account?: Account;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    sortOrder: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customer?: Customer;
    issueDate: string;
    dueDate: string;
    status: InvoiceStatus;
    requiresApproval?: boolean;
    workflowStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedAt?: string;
    approvedBy?: { id: string; name: string };
    rejectedAt?: string;
    rejectedBy?: { id: string; name: string };
    rejectionReason?: string;
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    discountAmount: number;
    total: number;
    paidAmount: number;
    notes?: string;
    terms?: string;
    pdfUrl?: string;
    items: InvoiceItem[];
    createdAt: string;
    updatedAt: string;
}

// Expense
export interface Expense {
    id: string;
    expenseNumber: string;
    vendorId?: string;
    vendor?: Vendor;
    accountId: string;
    account?: Account;
    date: string;
    description: string;
    amount: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    workflowStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
    receiptUrl?: string;
    notes?: string;
    isPaid: boolean;
    createdAt: string;
    updatedAt: string;
}

// VAT Record
export type VatRecordStatus = 'PENDING' | 'FILED' | 'PAID';

export interface VatRecord {
    id: string;
    periodStart: string;
    periodEnd: string;
    periodLabel: string;
    salesVat: number;
    purchaseVat: number;
    netVat: number;
    status: VatRecordStatus;
    filedDate?: string;
    notes?: string;
}

// Bank Account
export interface BankAccount {
    id: string;
    name: string;
    bankName?: string;
    accountNumber?: string;
    openingBalance: number;
    currentBalance: number;
    isActive: boolean;
    transactionCount?: number;
    unreconciledCount?: number;
}

// Bank Transaction
export interface BankTransaction {
    id: string;
    bankAccountId: string;
    date: string;
    description: string;
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    reference?: string;
    isReconciled: boolean;
    reconciledAt?: string;
    invoiceId?: string;
    invoice?: Invoice;
    expenseId?: string;
    expense?: Expense;
    notes?: string;
}

// Dashboard Stats
export interface DashboardStats {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    outstandingInvoices: number;
    vatPayable: number;
    // Period-over-period change percentages
    revenueChange?: number;
    expenseChange?: number;
    profitChange?: number;
    // Workflow metrics
    pendingApprovals: number;
    pendingApprovalsValue?: number;
    overdueInvoices: number;
    missingReceipts: number;
    recentInvoices: Invoice[];
    recentExpenses: Expense[];
    monthlyRevenue: { month: string; amount: number }[];
    expensesByCategory: { category: string; amount: number }[];
}

// Pagination
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Form Types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    businessName: string;
    panNumber?: string;
    vatNumber?: string;
}

export interface CustomerFormData {
    name: string;
    email?: string;
    phone?: string;
    panNumber?: string;
    address?: string;
    notes?: string;
}

export interface VendorFormData {
    name: string;
    email?: string;
    phone?: string;
    panNumber?: string;
    address?: string;
    notes?: string;
}

export interface InvoiceFormData {
    customerId: string;
    issueDate: string;
    dueDate: string;
    items: {
        accountId: string;
        description: string;
        quantity: number;
        rate: number;
    }[];
    notes?: string;
    terms?: string;
    discountAmount?: number;
}

export interface ExpenseFormData {
    vendorId?: string;
    accountId: string;
    date: string;
    description: string;
    amount: number;
    vatRate?: number;
    notes?: string;
    isPaid?: boolean;
}
