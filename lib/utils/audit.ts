import type { ApiResponse, AuditEntry } from "@/lib/types";

// ============================================================
// Audit Logging Helper
// Used by all mutation API routes
// ============================================================

export interface AuditLogParams {
  supabase: import("@supabase/supabase-js").SupabaseClient;
  actorId: string;
  orgId: string;
  action: "create" | "update" | "delete";
  entityType: string;
  entityId: string;
  detail?: Record<string, unknown>;
}

export async function auditLog({
  supabase,
  actorId,
  orgId,
  action,
  entityType,
  entityId,
  detail,
}: AuditLogParams): Promise<void> {
  await supabase.from("audit_log").insert({
    org_id: orgId,
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    detail,
  });
}

// ============================================================
// Build audit query helper
// ============================================================

export interface AuditQueryParams {
  supabase: import("@supabase/supabase-js").SupabaseClient;
  orgId: string;
  entityType?: string;
  actorId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function queryAuditTrail({
  supabase,
  orgId,
  entityType,
  actorId,
  from,
  to,
  page = 1,
  pageSize = 50,
}: AuditQueryParams) {
  let query = supabase
    .from("audit_log")
    .select("*, actor_email:profiles!actor_id(email)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (entityType) query = query.eq("entity_type", entityType);
  if (actorId) query = query.eq("actor_id", actorId);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data, error } = await query;

  if (error) return { data: null, error: { message: error.message } };
  return { data: data as AuditEntry[], error: null };
}
