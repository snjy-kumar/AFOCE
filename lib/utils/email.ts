// ============================================================
// Email Service with Resend
// ============================================================

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const emailTemplates = {
  // Password reset
  passwordReset: (resetUrl: string, userName: string) => ({
    subject: "Reset your password - AFOCE Accounting",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  }),

  // Invoice notification
  invoiceCreated: (invoiceNumber: string, amount: number, clientName: string, viewUrl: string) => ({
    subject: `New Invoice #${invoiceNumber} - AFOCE Accounting`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Invoice Created</h2>
        <p>A new invoice has been created for <strong>${clientName}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Invoice Number</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${invoiceNumber}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Amount</td><td style="padding: 8px; border: 1px solid #e5e7eb;">NPR ${amount.toLocaleString()}</td></tr>
        </table>
        <a href="${viewUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          View Invoice
        </a>
      </div>
    `,
  }),

  // Invoice overdue reminder
  invoiceOverdue: (invoiceNumber: string, amount: number, daysOverdue: number, viewUrl: string) => ({
    subject: `Invoice #${invoiceNumber} Overdue - AFOCE Accounting`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Invoice Overdue</h2>
        <p>Invoice <strong>#${invoiceNumber}</strong> is now <strong>${daysOverdue} days overdue</strong>.</p>
        <p>Amount due: <strong>NPR ${amount.toLocaleString()}</strong></p>
        <a href="${viewUrl}" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px;">
          View & Pay
        </a>
      </div>
    `,
  }),

  // Expense approval request
  expenseApprovalRequest: (expenseId: string, amount: number, employee: string, category: string, approveUrl: string) => ({
    subject: `Expense Approval Required - NPR ${amount.toLocaleString()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Expense Approval Request</h2>
        <p><strong>${employee}</strong> has submitted an expense for approval.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Expense ID</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${expenseId}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Amount</td><td style="padding: 8px; border: 1px solid #e5e7eb;">NPR ${amount.toLocaleString()}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Category</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${category}</td></tr>
        </table>
        <a href="${approveUrl}" style="display: inline-block; padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin-right: 8px;">
          Approve
        </a>
        <a href="${approveUrl}?action=reject" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px;">
          Reject
        </a>
      </div>
    `,
  }),

  // Expense approved notification
  expenseApproved: (expenseId: string, amount: number, approvedBy: string) => ({
    subject: `Expense Approved - NPR ${amount.toLocaleString()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Expense Approved</h2>
        <p>Your expense <strong>#${expenseId}</strong> has been approved by ${approvedBy}.</p>
        <p>Amount: <strong>NPR ${amount.toLocaleString()}</strong></p>
      </div>
    `,
  }),

  // Bank reconciliation match
  bankMatchFound: (transactionId: string, amount: number, matchedEntity: string, confidence: number) => ({
    subject: `Bank Transaction Match Found - AFOCE Accounting`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Potential Match Found</h2>
        <p>A bank transaction has been matched with ${matchedEntity}.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Transaction ID</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${transactionId}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Amount</td><td style="padding: 8px; border: 1px solid #e5e7eb;">NPR ${amount.toLocaleString()}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Confidence</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${confidence}%</td></tr>
        </table>
      </div>
    `,
  }),

  // Weekly summary
  weeklySummary: (metrics: { revenue: number; expenses: number; pendingInvoices: number; pendingExpenses: number }) => ({
    subject: "Weekly Summary - AFOCE Accounting",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Weekly Summary</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
          <div style="padding: 16px; background: #dcfce7; border-radius: 8px;">
            <p style="margin: 0; color: #166534;">Revenue</p>
            <p style="margin: 8px 0 0; font-size: 24px; font-weight: bold; color: #166534;">NPR ${metrics.revenue.toLocaleString()}</p>
          </div>
          <div style="padding: 16px; background: #fee2e2; border-radius: 8px;">
            <p style="margin: 0; color: #991b1b;">Expenses</p>
            <p style="margin: 8px 0 0; font-size: 24px; font-weight: bold; color: #991b1b;">NPR ${metrics.expenses.toLocaleString()}</p>
          </div>
        </div>
        <p><strong>${metrics.pendingInvoices}</strong> invoices pending payment</p>
        <p><strong>${metrics.pendingExpenses}</strong> expenses awaiting approval</p>
      </div>
    `,
  }),

  // Welcome email
  welcome: (userName: string, workspaceName: string, loginUrl: string) => ({
    subject: "Welcome to AFOCE Accounting",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to AFOCE!</h2>
        <p>Hi ${userName},</p>
        <p>Your workspace <strong>${workspaceName}</strong> has been created successfully.</p>
        <p>You can now start managing your accounting:</p>
        <ul>
          <li>Create and send invoices</li>
          <li>Track expenses and approvals</li>
          <li>Manage clients and vendors</li>
          <li>Generate tax reports</li>
        </ul>
        <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Go to Dashboard
        </a>
      </div>
    `,
  }),
};

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  from = "AFOCE Accounting <noreply@afoce.app>",
  attachments,
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set, email not sent:", { to, subject });
    return { id: null, error: null };
  }

  try {
    const { data, error } = await resend!.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      attachments,
    });

    if (error) throw error;

    return { id: data?.id, error: null };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { id: null, error };
  }
}

// Send batch emails
export async function sendBatchEmails(
  emails: { to: string; subject: string; html: string }[]
): Promise<{ successful: number; failed: number }> {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return { successful, failed };
}
