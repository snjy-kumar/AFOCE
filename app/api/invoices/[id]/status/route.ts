// ============================================================
// Invoice Status Workflow API
// ============================================================

import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/server";
import { validateInvoiceTransition } from "@/lib/utils/workflow";
import { invoiceStatusTransitionSchema } from "@/lib/utils/validation";
import { auditLog } from "@/lib/utils/audit";
import { sendNotification } from "@/lib/utils/notifications";
import { applySecurityHeaders, applyCORS } from "@/lib/utils/security";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Authentication
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return applyCORS(
      NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 }),
      request
    );
  }

  // Get profile with org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return applyCORS(
      NextResponse.json({ error: { message: "No workspace found" } }, { status: 403 }),
      request
    );
  }

  // Get current invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*, client:clients(name, email)")
    .eq("id", id)
    .eq("org_id", profile.org_id)
    .single();

  if (invoiceError || !invoice) {
    return applyCORS(
      NextResponse.json({ error: { message: "Invoice not found" } }, { status: 404 }),
      request
    );
  }

  const body = await request.json();

  // Validate request
  const validation = invoiceStatusTransitionSchema.safeParse({ id, ...body });
  if (!validation.success) {
    return applyCORS(
      NextResponse.json(
        { error: { message: "Invalid request", errors: validation.error.issues } },
        { status: 400 }
      ),
      request
    );
  }

  const { status: newStatus, reason } = validation.data;

  // Check if transition is allowed
  const transitionCheck = validateInvoiceTransition(
    invoice.status,
    newStatus,
    { reason }
  );

  if (!transitionCheck.valid) {
    return applyCORS(
      NextResponse.json(
        { error: { message: transitionCheck.error } },
        { status: 400 }
      ),
      request
    );
  }

  // Check role permissions for status changes
  const rolePermissions: Record<string, string[]> = {
    paid: ["finance_admin"],
    rejected: ["finance_admin", "manager"],
    overdue: ["finance_admin", "manager"],
    pending: ["finance_admin", "manager", "team_member"],
  };

  if (rolePermissions[newStatus] && !rolePermissions[newStatus].includes(profile.role)) {
    return applyCORS(
      NextResponse.json(
        { error: { message: `Only ${rolePermissions[newStatus].join(" or ")} can set status to ${newStatus}` } },
        { status: 403 }
      ),
      request
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
    return applyCORS(
      NextResponse.json({ error: { message: updateError.message } }, { status: 500 }),
      request
    );
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
}
