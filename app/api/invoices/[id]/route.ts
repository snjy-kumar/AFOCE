import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  errorResponse,
  validationErrorResponse,
  logError,
} from "@/lib/utils/error-handler";
import { auditLog } from "@/lib/utils/audit";
import { updateInvoiceSchema, idSchema } from "@/lib/utils/validation";

/**
 * GET /api/invoices/[id] - Get invoice by ID
 *
 * @param id - Invoice ID
 * @returns {InvoiceRecord} Invoice details
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
      .from("invoices")
      .select("*, client_name:clients!client_id(name, pan)")
      .eq("id", id)
      .eq("org_id", profile.org_id)
      .single();

    if (error || !data) {
      return errorResponse(404, "Invoice not found");
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    logError(error, { method: "GET", path: "/api/invoices/[id]" });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * PATCH /api/invoices/[id] - Update invoice
 *
 * @param id - Invoice ID
 * @body {UpdateInvoiceInput} Fields to update
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

    const body = await request.json();

    // Validate update payload
    const validation = updateInvoiceSchema.safeParse(body);
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
      .from("invoices")
      .update(validation.data)
      .eq("id", id)
      .eq("org_id", profile.org_id)
      .select()
      .single();

    if (error) {
      logError(error, {
        method: "PATCH",
        path: "/api/invoices/[id]",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to update invoice");
    }

    await auditLog({
      supabase,
      actorId: user.id,
      orgId: profile.org_id,
      action: "update",
      entityType: "invoices",
      entityId: id,
      detail: validation.data,
    });

    return NextResponse.json({ data, error: null });
  } catch (error) {
    logError(error, { method: "PATCH", path: "/api/invoices/[id]" });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * DELETE /api/invoices/[id] - Delete invoice
 *
 * @param id - Invoice ID
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
      .from("invoices")
      .delete()
      .eq("id", id)
      .eq("org_id", profile.org_id);

    if (error) {
      logError(error, {
        method: "DELETE",
        path: "/api/invoices/[id]",
        userId: user.id,
        orgId: profile.org_id,
      });
      return errorResponse(500, "Failed to delete invoice");
    }

    await auditLog({
      supabase,
      actorId: user.id,
      orgId: profile.org_id,
      action: "delete",
      entityType: "invoices",
      entityId: id,
    });

    return NextResponse.json({ data: { id }, error: null }, { status: 200 });
  } catch (error) {
    logError(error, { method: "DELETE", path: "/api/invoices/[id]" });
    return errorResponse(500, "Internal server error");
  }
}
