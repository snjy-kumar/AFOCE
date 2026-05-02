// ============================================================
// Invoice Status Workflow API
// ============================================================

import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/server";
import {
  errorResponse,
  validationErrorResponse,
  logError,
} from "@/lib/utils/error-handler";
import { validateInvoiceTransition } from "@/lib/utils/workflow";
import {
  invoiceStatusTransitionSchema,
  idSchema,
} from "@/lib/utils/validation";
import { auditLog } from "@/lib/utils/audit";
import { sendNotification } from "@/lib/utils/notifications";
import { applySecurityHeaders, applyCORS } from "@/lib/utils/security";

/**
 * PATCH /api/invoices/[id]/status - Update invoice status
 *
 * @param id - Invoice ID
 * @body status - New status
 * @body reason - Reason for status change (optional)
 * @returns {InvoiceRecord} Updated invoice
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    const idValidation = idSchema.safeParse(id);
    if (!idValidation.success) {
      return validationErrorResponse(idValidation.error);
    }

    // Authentication
    const supabase = await createAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse(401, "Unauthorized");
    }

    // Get profile with org_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return errorResponse(403, "No workspace found");
    }

    // Get current invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, client:clients(name, email)")
      .eq("id", id)
      .eq("org_id", profile.org_id)
      .single();

    if (invoiceError || !invoice) {
      return errorResponse(404, "Invoice not found");
    }

    const body = await request.json();

    // Validate request
    const validation = invoiceStatusTransitionSchema.safeParse({
      id,
      ...body,
    });
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { status: newStatus, reason } = validation.data;

    // Check if transition is allowed
    const transitionCheck = validateInvoiceTransition(invoice.status, newStatus, {
      reason,
    });

    if (!transitionCheck.valid) {
      return errorResponse(400, transitionCheck.error || "Invalid status transition");
    }

    // Check role permissions for status changes
    const rolePermissions: Record<string, string[]> = {
      paid: ["finance_admin"],
      rejected: ["finance_admin", "manager"],
      overdue: ["finance_admin", "manager"],
      pending: ["finance_admin", "manager", "team_member"],
    };

    if (
      rolePermissions[newStatus] &&
      !rolePermissions[newStatus].includes(profile.role)
    ) {
      return errorResponse(
        403,
        `Only ${rolePermissions[newStatus].join(" or ")} can set status to ${newStatus}`
      );
    }

    // Update invoice status
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === "paid") {
      updateData.paid_at = new Date().toISOString();
      updateData.paid_by = user.id;
    }

    const { data: updatedInvoice, error: updateError } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)
      .eq("org_id", profile.org_id)
      .select()
      .single();

    if (updateError) {
      logError(updateError, {
        method: "PATCH",
        path: "/api/invoices/[id]/status",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to update invoice status");
    }

    // Audit log
    await auditLog({
      supabase,
      actorId: user.id,
      orgId: profile.org_id,
      action: "update",
      entityType: "invoices",
      entityId: id,
      detail: { status: newStatus, previous_status: invoice.status, reason },
    });

    // Send notification based on status change
    if (newStatus === "paid") {
      await sendNotification({
        supabase,
        payload: {
          type: "invoice_paid",
          userId: invoice.created_by,
          orgId: profile.org_id,
          data: {
            invoiceNumber: invoice.id,
            amount: invoice.amount + invoice.vat,
          },
        },
      });
    } else if (newStatus === "overdue") {
      await sendNotification({
        supabase,
        payload: {
          type: "invoice_overdue",
          email: invoice.client?.email,
          orgId: profile.org_id,
          data: {
            invoiceNumber: invoice.id,
            amount: invoice.amount + invoice.vat,
            daysOverdue: 1,
            viewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${id}`,
          },
        },
      });
    }

    return applyCORS(
      applySecurityHeaders(
        NextResponse.json({
          data: updatedInvoice,
          error: null,
        })
      ),
      request
    );
  } catch (error) {
    logError(error, {
      method: "PATCH",
      path: "/api/invoices/[id]/status",
    });
    return errorResponse(500, "Internal server error");
  }
}
