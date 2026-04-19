// ============================================================
// Workflow Engine - Status Transitions and State Machines
// ============================================================

import { InvoiceStatus, ExpenseStatus } from "@/lib/types";

// ============================================================
// Invoice Workflow
// ============================================================

export const invoiceTransitions: Record<
  InvoiceStatus,
  { allowed: InvoiceStatus[]; requires?: string[]; notifications?: string[] }
> = {
  draft: {
    allowed: ["pending"],
    requires: ["client_id", "amount", "bs_date", "ad_date"],
  },
  pending: {
    allowed: ["paid", "overdue", "rejected"],
    notifications: ["client"],
  },
  paid: {
    allowed: [],
  },
  overdue: {
    allowed: ["paid", "rejected"],
    notifications: ["client", "finance_admin"],
  },
  rejected: {
    allowed: ["draft"],
    requires: ["rejection_reason"],
  },
};

export function canTransitionInvoice(
  from: InvoiceStatus,
  to: InvoiceStatus
): { allowed: boolean; reason?: string } {
  const transitions = invoiceTransitions[from];

  if (!transitions.allowed.includes(to)) {
    return {
      allowed: false,
      reason: `Cannot transition from ${from} to ${to}. Allowed: ${transitions.allowed.join(", ") || "none"}`,
    };
  }

  return { allowed: true };
}

export function validateInvoiceTransition(
  from: InvoiceStatus,
  to: InvoiceStatus,
  data?: Record<string, unknown>
): { valid: boolean; error?: string } {
  const transition = canTransitionInvoice(from, to);

  if (!transition.allowed) {
    return { valid: false, error: transition.reason };
  }

  // Check required fields
  const required = invoiceTransitions[from].requires || [];
  const missing = required.filter((field) => !data?.[field]);

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields for transition: ${missing.join(", ")}`,
    };
  }

  return { valid: true };
}

// ============================================================
// Expense Workflow
// ============================================================

export const expenseTransitions: Record<
  ExpenseStatus,
  { allowed: ExpenseStatus[]; auto?: boolean; notifications?: string[] }
> = {
  pending_approval: {
    allowed: ["manager_review", "approved", "rejected"],
    notifications: ["manager"],
  },
  manager_review: {
    allowed: ["approved", "rejected", "blocked"],
    notifications: ["finance_admin"],
  },
  blocked: {
    allowed: ["manager_review", "rejected"],
  },
  approved: {
    allowed: [],
    notifications: ["submitter"],
  },
  rejected: {
    allowed: ["pending_approval"],
  },
};

export function canTransitionExpense(
  from: ExpenseStatus,
  to: ExpenseStatus
): { allowed: boolean; reason?: string } {
  const transitions = expenseTransitions[from];

  if (!transitions.allowed.includes(to)) {
    return {
      allowed: false,
      reason: `Cannot transition from ${from} to ${to}. Allowed: ${transitions.allowed.join(", ") || "none"}`,
    };
  }

  return { allowed: true };
}

export function getExpenseNextStatus(
  current: ExpenseStatus,
  action: "submit" | "approve" | "reject" | "escalate" | "block"
): ExpenseStatus | null {
  const transitions: Record<ExpenseStatus, Record<string, ExpenseStatus>> = {
    pending_approval: {
      approve: "approved",
      reject: "rejected",
      escalate: "manager_review",
    },
    manager_review: {
      approve: "approved",
      reject: "rejected",
      block: "blocked",
    },
    blocked: {
      escalate: "manager_review",
      reject: "rejected",
    },
    approved: {},
    rejected: {
      submit: "pending_approval",
    },
  };

  return transitions[current]?.[action] || null;
}

// ============================================================
// Approval Workflow
// ============================================================

export interface ApprovalStep {
  id: string;
  name: string;
  approverRole: string;
  minAmount?: number;
  maxAmount?: number;
  autoApprove?: boolean;
  autoReject?: boolean;
}

export const defaultExpenseApprovalFlow: ApprovalStep[] = [
  {
    id: "auto",
    name: "Auto Approval",
    approverRole: "system",
    maxAmount: 1000,
    autoApprove: true,
  },
  {
    id: "manager",
    name: "Manager Review",
    approverRole: "manager",
    minAmount: 1001,
    maxAmount: 50000,
  },
  {
    id: "finance",
    name: "Finance Admin Review",
    approverRole: "finance_admin",
    minAmount: 50001,
  },
];

export function determineApprovalStep(
  amount: number,
  flow: ApprovalStep[] = defaultExpenseApprovalFlow
): ApprovalStep | null {
  return (
    flow.find((step) => {
      const minOk = step.minAmount === undefined || amount >= step.minAmount;
      const maxOk = step.maxAmount === undefined || amount <= step.maxAmount;
      return minOk && maxOk;
    }) || null
  );
}

export function shouldAutoApprove(amount: number): boolean {
  const step = determineApprovalStep(amount);
  return step?.autoApprove || false;
}

// ============================================================
// Bank Reconciliation Workflow
// ============================================================

export interface MatchCandidate {
  id: string;
  type: "invoice" | "expense";
  amount: number;
  date: string;
  confidence: number;
  reasons: string[];
}

export function findMatchCandidates(
  bankLine: { amount: number; date: string; description?: string | null },
  invoices: { id: string; amount: number; ad_date: string; status: string }[],
  expenses: { id: string; amount: number; ad_date: string; status: string }[]
): MatchCandidate[] {
  const candidates: MatchCandidate[] = [];
  const amountThreshold = 0.01; // 1% variance allowed

  // Check invoices
  invoices.forEach((inv) => {
    const amountDiff = Math.abs(inv.amount - bankLine.amount) / inv.amount;
    const daysDiff = Math.abs(
      new Date(inv.ad_date).getTime() - new Date(bankLine.date).getTime()
    ) / (1000 * 60 * 60 * 24);

    if (amountDiff <= amountThreshold && daysDiff <= 7) {
      const confidence = Math.round((1 - amountDiff) * 100);
      candidates.push({
        id: inv.id,
        type: "invoice",
        amount: inv.amount,
        date: inv.ad_date,
        confidence,
        reasons: [
          `Amount matches (${inv.amount === bankLine.amount ? "exact" : "close"})`,
          `Date within ${Math.round(daysDiff)} days`,
        ],
      });
    }
  });

  // Check expenses
  expenses.forEach((exp) => {
    const amountDiff = Math.abs(exp.amount - Math.abs(bankLine.amount)) / exp.amount;
    const daysDiff = Math.abs(
      new Date(exp.ad_date).getTime() - new Date(bankLine.date).getTime()
    ) / (1000 * 60 * 60 * 24);

    if (bankLine.amount < 0 && amountDiff <= amountThreshold && daysDiff <= 7) {
      const confidence = Math.round((1 - amountDiff) * 100);
      candidates.push({
        id: exp.id,
        type: "expense",
        amount: exp.amount,
        date: exp.ad_date,
        confidence,
        reasons: [
          `Amount matches expense (${exp.amount === Math.abs(bankLine.amount) ? "exact" : "close"})`,
          `Date within ${Math.round(daysDiff)} days`,
        ],
      });
    }
  });

  // Sort by confidence
  return candidates.sort((a, b) => b.confidence - a.confidence);
}

export function calculateMatchConfidence(
  bankAmount: number,
  entityAmount: number,
  bankDate: string,
  entityDate: string
): number {
  const amountDiff = Math.abs(bankAmount - entityAmount) / Math.max(bankAmount, entityAmount);
  const daysDiff =
    Math.abs(new Date(bankDate).getTime() - new Date(entityDate).getTime()) /
    (1000 * 60 * 60 * 24);

  // Amount similarity (70% weight)
  const amountScore = Math.max(0, 1 - amountDiff) * 70;

  // Date proximity (30% weight)
  const dateScore = Math.max(0, 1 - daysDiff / 7) * 30;

  return Math.round(amountScore + dateScore);
}

// ============================================================
// Workflow Actions
// ============================================================

export interface WorkflowAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requiresReason?: boolean;
  notifications?: string[];
}

export const invoiceActions: Record<InvoiceStatus, WorkflowAction[]> = {
  draft: [
    { id: "send", name: "Send Invoice", description: "Send to client", icon: "Send", color: "blue" },
    { id: "edit", name: "Edit", description: "Modify invoice", icon: "Edit", color: "gray" },
    { id: "delete", name: "Delete", description: "Remove invoice", icon: "Trash", color: "red" },
  ],
  pending: [
    { id: "mark_paid", name: "Mark Paid", description: "Record payment", icon: "Check", color: "green" },
    { id: "mark_overdue", name: "Mark Overdue", description: "Payment not received", icon: "Alert", color: "orange", notifications: ["client"] },
    { id: "reject", name: "Cancel", description: "Cancel invoice", icon: "X", color: "red", requiresReason: true },
  ],
  paid: [
    { id: "view", name: "View", description: "View details", icon: "Eye", color: "gray" },
    { id: "download", name: "Download PDF", description: "Download invoice", icon: "Download", color: "blue" },
  ],
  overdue: [
    { id: "mark_paid", name: "Mark Paid", description: "Record payment", icon: "Check", color: "green" },
    { id: "send_reminder", name: "Send Reminder", description: "Email client", icon: "Mail", color: "blue", notifications: ["client"] },
    { id: "reject", name: "Write Off", description: "Write off as bad debt", icon: "X", color: "red", requiresReason: true },
  ],
  rejected: [
    { id: "restore", name: "Restore", description: "Restore to draft", icon: "RotateCcw", color: "blue" },
  ],
};

export const expenseActions: Record<ExpenseStatus, WorkflowAction[]> = {
  pending_approval: [
    { id: "approve", name: "Approve", description: "Approve expense", icon: "Check", color: "green" },
    { id: "reject", name: "Reject", description: "Reject expense", icon: "X", color: "red", requiresReason: true },
    { id: "escalate", name: "Escalate", description: "Send to manager", icon: "ArrowUp", color: "blue" },
  ],
  manager_review: [
    { id: "approve", name: "Approve", description: "Approve expense", icon: "Check", color: "green" },
    { id: "reject", name: "Reject", description: "Reject expense", icon: "X", color: "red", requiresReason: true },
    { id: "block", name: "Block", description: "Block for review", icon: "Lock", color: "orange" },
  ],
  blocked: [
    { id: "escalate", name: "Escalate", description: "Send to finance", icon: "ArrowUp", color: "blue" },
    { id: "reject", name: "Reject", description: "Reject expense", icon: "X", color: "red", requiresReason: true },
  ],
  approved: [
    { id: "view", name: "View", description: "View receipt", icon: "Eye", color: "gray" },
    { id: "download", name: "Download", description: "Download receipt", icon: "Download", color: "blue" },
  ],
  rejected: [
    { id: "resubmit", name: "Resubmit", description: "Submit again", icon: "RotateCcw", color: "blue" },
  ],
};
