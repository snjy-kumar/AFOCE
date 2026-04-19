// ============================================================
// Expense Approval Workflow API
// ============================================================

import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/server";
import { canTransitionExpense, getExpenseNextStatus } from "@/lib/utils/workflow";
import { expenseApprovalSchema } from "@/lib/utils/validation";
import { auditLog } from "@/lib/utils/audit";
import { sendNotification } from "@/lib/utils/notifications";
import { applySecurityHeaders, applyCORS } from "@/lib/utils/security";

export async function POST(
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

  // Get profile with org_id and role
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return applyCORS(
      NextResponse.json({ error: { message: "No workspace found" } }, { status: 403 }),
      request
    );
  }

  // Get current expense
  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .select("*, submitter:profiles!created_by(id, email)")
    .eq("id", id)
    .eq("org_id", profile.org_id)
    .single();

  if (expenseError || !expense) {
    return applyCORS(
      NextResponse.json({ error: { message: "Expense not found" } }, { status: 404 }),
      request
    );
  }

  const body = await request.json();

  // Validate request
  const validation = expenseApprovalSchema.safeParse({ id, ...body });
  if (!validation.success) {
    return applyCORS(
      NextResponse.json(
        { error: { message: "Invalid request", errors: validation.error.issues } },
        { status: 400 }
      ),
      request
    );
  }

  const { action, notes } = validation.data;

  // Determine new status based on action
  const newStatus = getExpenseNextStatus(expense.status, action === "request_review" ? "escalate" : action);

  if (!newStatus) {
    return applyCORS(
      NextResponse.json(
        { error: { message: `Cannot ${action} from status ${expense.status}` } },
        { status: 400 }
      ),
      request
    );
  }

  // Check if transition is allowed
  const transitionCheck = canTransitionExpense(expense.status, newStatus);
  if (!transitionCheck.allowed) {
    return applyCORS(
      NextResponse.json(
        { error: { message: transitionCheck.reason } },
        { status: 400 }
      ),
      request
    );
  }

  // Check role permissions
  const rolePermissions: Record<string, string[]> = {
    approved: ["finance_admin", "manager"],
    rejected: ["finance_admin", "manager"],
    manager_review: ["team_member"],
    blocked: ["manager"],
  };

  if (rolePermissions[newStatus] && !rolePermissions[newStatus].includes(profile.role)) {
    return applyCORS(
      NextResponse.json(
        { error: { message: `Insufficient permissions to ${action}` } },
        { status: 403 }
      ),
      request
    );
  }

  // Update expense
  const updateData: Record<string, unknown> = {
    status: newStatus,
    approved_by: newStatus === "approved" ? user.id : null,
    approved_at: newStatus === "approved" ? new Date().toISOString() : null,
    notes: notes || null,
  };

  if (action === "request_review") {
    updateData.review_requested_by = user.id;
    updateData.review_requested_at = new Date().toISOString();
  }

  const { data: updatedExpense, error: updateError } = await supabase
    .from("expenses")
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
    entityType: "expenses",
    entityId: id,
    detail: { status: newStatus, previous_status: expense.status, action, notes },
  });

  // Send notifications
  if (newStatus === "approved") {
    await sendNotification({
      supabase,
      payload: {
        type: "expense_approved",
        userId: expense.created_by,
        orgId: profile.org_id,
        data: {
          expenseId: id,
          amount: expense.amount,
          approvedBy: profile.full_name || user.email,
        },
      },
    });
  } else if (newStatus === "rejected") {
    await sendNotification({
      supabase,
      payload: {
        type: "expense_rejected",
        userId: expense.created_by,
        orgId: profile.org_id,
        data: {
          expenseId: id,
          amount: expense.amount,
          reason: notes,
        },
      },
    });
  } else if (newStatus === "manager_review") {
    // Notify finance admins
    const { data: financeAdmins } = await supabase
      .from("profiles")
      .select("id")
      .eq("org_id", profile.org_id)
      .eq("role", "finance_admin");

    if (financeAdmins) {
      for (const admin of financeAdmins) {
        await sendNotification({
          supabase,
          payload: {
            type: "expense_submitted",
            userId: admin.id,
            orgId: profile.org_id,
            data: {
              expenseId: id,
              employee: expense.employee,
              amount: expense.amount,
              category: expense.category,
            },
          },
        });
      }
    }
  }

  return applyCORS(
    applySecurityHeaders(
      NextResponse.json({
        data: updatedExpense,
        error: null,
      })
    ),
    request
  );
}
