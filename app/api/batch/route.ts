// ============================================================
// Batch Operations API
// ============================================================

import { NextResponse } from "next/server";
import { createAuthClient, unauthorizedResponse } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limit";
import { batchOperationSchema, batchUpdateStatusSchema } from "@/lib/utils/validation";
import { batchInsert, batchUpdate, batchDelete, batchUpdateStatus } from "@/lib/utils/batch";
import { applySecurityHeaders, applyCORS } from "@/lib/utils/security";

export async function POST(request: Request) {
  // Rate limiting
  const rateLimit = await checkRateLimit(request, "batch");
  if (!rateLimit.success) {
    return applyCORS(rateLimitResponse(rateLimit.remaining, rateLimit.reset), request);
  }

  // Authentication
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return applyCORS(unauthorizedResponse(), request);
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

  const body = await request.json();

  // Validate request body
  const validation = batchOperationSchema.safeParse(body);
  if (!validation.success) {
    return applyCORS(
      NextResponse.json(
        { error: { message: "Invalid batch operation", errors: validation.error.issues }, },
        { status: 400 }
      ),
      request
    );
  }

  const { operation, entity, items } = validation.data;

  // Check permissions for batch operations
  if (operation === "delete" && profile.role !== "finance_admin") {
    return applyCORS(
      NextResponse.json({ error: { message: "Only finance admins can batch delete" } }, { status: 403 }),
      request
    );
  }

  let result;

  switch (operation) {
    case "create":
      result = await batchInsert({
        supabase,
        table: entity,
        items,
        orgId: profile.org_id,
        userId: user.id,
        entityType: entity,
      });
      break;

    case "update":
      result = await batchUpdate({
        supabase,
        table: entity,
        items: items as { id: string }[],
        orgId: profile.org_id,
        userId: user.id,
        entityType: entity,
      });
      break;

    case "delete":
      result = await batchDelete({
        supabase,
        table: entity,
        ids: items.map((item) => (item as { id: string }).id),
        orgId: profile.org_id,
        userId: user.id,
        entityType: entity,
      });
      break;

    default:
      return applyCORS(
        NextResponse.json({ error: { message: "Invalid operation" } }, { status: 400 }),
        request
      );
  }

  return applyCORS(
    applySecurityHeaders(
      NextResponse.json({
        data: {
          operation,
          entity,
          summary: result.summary,
          successful: result.successful,
          failed: result.failed,
        },
        error: null,
      })
    ),
    request
  );
}

// Batch status update endpoint
export async function PATCH(request: Request) {
  // Rate limiting
  const rateLimit = await checkRateLimit(request, "batch");
  if (!rateLimit.success) {
    return applyCORS(rateLimitResponse(rateLimit.remaining, rateLimit.reset), request);
  }

  // Authentication
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return applyCORS(unauthorizedResponse(), request);
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

  const body = await request.json();

  // Validate request body
  const validation = batchUpdateStatusSchema.safeParse(body);
  if (!validation.success) {
    return applyCORS(
      NextResponse.json(
        { error: { message: "Invalid batch status update", errors: validation.error.issues }, },
        { status: 400 }
      ),
      request
    );
  }

  const { entity, ids, status, reason } = validation.data;

  // Check role permissions for status changes
  const allowedRoles: Record<string, string[]> = {
    pending: ["finance_admin", "manager"],
    approved: ["finance_admin", "manager"],
    paid: ["finance_admin"],
  };

  if (allowedRoles[status] && !allowedRoles[status].includes(profile.role)) {
    return applyCORS(
      NextResponse.json(
        { error: { message: `Only ${allowedRoles[status].join(" or ")} can set status to ${status}` } },
        { status: 403 }
      ),
      request
    );
  }

  const result = await batchUpdateStatus({
    supabase,
    table: entity,
    ids,
    status,
    orgId: profile.org_id,
    userId: user.id,
    entityType: entity,
    reason,
  });

  return applyCORS(
    applySecurityHeaders(
      NextResponse.json({
        data: {
          operation: "update_status",
          entity,
          new_status: status,
          summary: result.summary,
          successful: result.successful,
          failed: result.failed,
        },
        error: null,
      })
    ),
    request
  );
}
