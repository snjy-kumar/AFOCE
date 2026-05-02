import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  errorResponse,
  validationErrorResponse,
  logError,
} from "@/lib/utils/error-handler";
import { auditLog } from "@/lib/utils/audit";
import { updateExpenseSchema, idSchema } from "@/lib/utils/validation";

/**
 * GET /api/expenses/[id] - Get expense by ID
 *
 * @param id - Expense ID
 * @returns {ExpenseRecord} Expense details
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    const idValidation = idSchema.safeParse(id);
    if (!idValidation.success) {
      return validationErrorResponse(idValidation.error);
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse(401, "Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) return errorResponse(403, "No workspace found");

    const { data, error } = await supabase
      .from("expenses")
      .select("*, policy_title:policies!policy_id(name)")
      .eq("id", id)
      .eq("org_id", profile.org_id)
      .single();

    if (error || !data) {
      return errorResponse(404, "Expense not found");
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    logError(error, { method: "GET", path: "/api/expenses/[id]" });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * PATCH /api/expenses/[id] - Update expense
 *
 * @param id - Expense ID
 * @body {UpdateExpenseInput} Fields to update
 * @returns {ExpenseRecord} Updated expense
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

    const body = await request.json();

    // Validate update payload
    const validation = updateExpenseSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse(401, "Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) return errorResponse(403, "No workspace found");

    const { data, error } = await supabase
      .from("expenses")
      .update(validation.data)
      .eq("id", id)
      .eq("org_id", profile.org_id)
      .select()
      .single();

    if (error) {
      logError(error, {
        method: "PATCH",
        path: "/api/expenses/[id]",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to update expense");
    }

    await auditLog({
      supabase,
      actorId: user.id,
      orgId: profile.org_id,
      action: "update",
      entityType: "expenses",
      entityId: id,
      detail: validation.data,
    });

    return NextResponse.json({ data, error: null });
  } catch (error) {
    logError(error, { method: "PATCH", path: "/api/expenses/[id]" });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * DELETE /api/expenses/[id] - Delete expense
 *
 * @param id - Expense ID
 * @returns Success response
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    const idValidation = idSchema.safeParse(id);
    if (!idValidation.success) {
      return validationErrorResponse(idValidation.error);
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse(401, "Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) return errorResponse(403, "No workspace found");

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("org_id", profile.org_id);

    if (error) {
      logError(error, {
        method: "DELETE",
        path: "/api/expenses/[id]",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to delete expense");
    }

    await auditLog({
      supabase,
      actorId: user.id,
      orgId: profile.org_id,
      action: "delete",
      entityType: "expenses",
      entityId: id,
    });

    return NextResponse.json({ data: { id }, error: null }, { status: 200 });
  } catch (error) {
    logError(error, { method: "DELETE", path: "/api/expenses/[id]" });
    return errorResponse(500, "Internal server error");
  }
}
