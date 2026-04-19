// ============================================================
// Notification System
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { sendEmail, emailTemplates } from "./email";

export type NotificationType =
  | "expense_submitted"
  | "expense_approved"
  | "expense_rejected"
  | "invoice_created"
  | "invoice_paid"
  | "invoice_overdue"
  | "bank_match_found"
  | "team_invite"
  | "welcome";

export interface NotificationPayload {
  type: NotificationType;
  userId?: string;
  email?: string;
  orgId: string;
  data: Record<string, unknown>;
}

// In-app notification
export async function createInAppNotification({
  supabase,
  userId,
  type,
  title,
  message,
  link,
  data = {},
}: {
  supabase: ReturnType<typeof createServerClient>;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    link,
    data,
    read: false,
  });

  if (error) {
    console.error("Failed to create notification:", error);
  }

  return { error };
}

// Get unread notifications count
export async function getUnreadNotificationsCount(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) return 0;
  return count || 0;
}

// Mark notification as read
export async function markNotificationAsRead(
  supabase: ReturnType<typeof createServerClient>,
  notificationId: string,
  userId: string
) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);

  return { error };
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("read", false);

  return { error };
}

// Send notification (email + in-app)
export async function sendNotification({
  supabase,
  payload,
  sendEmail: shouldSendEmail = true,
}: {
  supabase: ReturnType<typeof createServerClient>;
  payload: NotificationPayload;
  sendEmail?: boolean;
}) {
  const { type, userId, email, orgId, data } = payload;

  // Get user email if not provided
  let recipientEmail = email;
  if (!recipientEmail && userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();
    recipientEmail = profile?.email;
  }

  // Create in-app notification
  if (userId) {
    const title = getNotificationTitle(type);
    const message = getNotificationMessage(type, data);
    await createInAppNotification({
      supabase,
      userId,
      type,
      title,
      message,
      link: data.link as string | undefined,
      data,
    });
  }

  // Send email if enabled
  if (shouldSendEmail && recipientEmail) {
    const emailContent = buildEmailContent(type, data);
    if (emailContent) {
      await sendEmail({
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }
  }
}

// Get notification title based on type
function getNotificationTitle(type: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    expense_submitted: "New Expense Submitted",
    expense_approved: "Expense Approved",
    expense_rejected: "Expense Rejected",
    invoice_created: "New Invoice Created",
    invoice_paid: "Invoice Paid",
    invoice_overdue: "Invoice Overdue",
    bank_match_found: "Bank Match Found",
    team_invite: "Team Invitation",
    welcome: "Welcome to AFOCE",
  };
  return titles[type];
}

// Get notification message based on type and data
function getNotificationMessage(type: NotificationType, data: Record<string, unknown>): string {
  switch (type) {
    case "expense_submitted":
      return `${data.employee} submitted an expense of NPR ${data.amount} for approval.`;
    case "expense_approved":
      return `Your expense #${data.expenseId} has been approved.`;
    case "expense_rejected":
      return `Your expense #${data.expenseId} has been rejected. Reason: ${data.reason}`;
    case "invoice_created":
      return `Invoice #${data.invoiceNumber} for NPR ${data.amount} has been created.`;
    case "invoice_paid":
      return `Invoice #${data.invoiceNumber} has been marked as paid.`;
    case "invoice_overdue":
      return `Invoice #${data.invoiceNumber} is now overdue by ${data.daysOverdue} days.`;
    case "bank_match_found":
      return `A bank transaction has been matched with ${data.entityType} ${data.entityId}.`;
    case "team_invite":
      return `You've been invited to join ${data.workspaceName} as ${data.role}.`;
    case "welcome":
      return "Welcome to AFOCE Accounting! Your workspace has been created.";
    default:
      return "New notification";
  }
}

// Build email content based on notification type
function buildEmailContent(
  type: NotificationType,
  data: Record<string, unknown>
): { subject: string; html: string } | null {
  switch (type) {
    case "expense_submitted":
      return emailTemplates.expenseApprovalRequest(
        String(data.expenseId),
        Number(data.amount),
        String(data.employee),
        String(data.category),
        String(data.approveUrl)
      );
    case "expense_approved":
      return emailTemplates.expenseApproved(
        String(data.expenseId),
        Number(data.amount),
        String(data.approvedBy)
      );
    case "invoice_created":
      return emailTemplates.invoiceCreated(
        String(data.invoiceNumber),
        Number(data.amount),
        String(data.clientName),
        String(data.viewUrl)
      );
    case "invoice_overdue":
      return emailTemplates.invoiceOverdue(
        String(data.invoiceNumber),
        Number(data.amount),
        Number(data.daysOverdue),
        String(data.viewUrl)
      );
    case "bank_match_found":
      return emailTemplates.bankMatchFound(
        String(data.transactionId),
        Number(data.amount),
        String(data.entityType),
        Number(data.confidence)
      );
    case "welcome":
      return emailTemplates.welcome(
        String(data.userName),
        String(data.workspaceName),
        String(data.loginUrl)
      );
    default:
      return null;
  }
}

// Bulk send notifications
export async function bulkSendNotifications({
  supabase,
  notifications,
}: {
  supabase: ReturnType<typeof createServerClient>;
  notifications: NotificationPayload[];
}): Promise<{ successful: number; failed: number }> {
  const results = await Promise.allSettled(
    notifications.map((payload) => sendNotification({ supabase, payload }))
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return { successful, failed };
}
