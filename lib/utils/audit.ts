import type { ApiResponse, AuditEntry } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// Audit Logging Helper
// Used by all mutation API routes
// ============================================================

export interface AuditLogParams {
  supabase: SupabaseClient;
  actorId: string;
  orgId: string;
  action: "create" | "update" | "delete";
  entityType: string;
  entityId: string;
  detail?: Record<string, unknown>;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
}

export async function auditLog({
  supabase,
  actorId,
  orgId,
  action,
  entityType,
  entityId,
  detail,
  changes,
}: AuditLogParams): Promise<void> {
  try {
    await supabase.from("audit_log").insert({
      org_id: orgId,
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      detail,
      changes,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging shouldn't break the main operation
  }
}

// ============================================================
// Build audit query helper
// ============================================================

export interface AuditQueryParams {
  supabase: SupabaseClient;
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
}: AuditQueryParams): Promise<{
  data: AuditEntry[] | null;
  error: { message: string } | null;
}> {
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

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return {
    data: (data as AuditEntry[]) || [],
    error: null,
  };
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditLog(
  supabase: SupabaseClient,
  orgId: string,
  entityType: string,
  entityId: string
): Promise<{
  data: AuditEntry[] | null;
  error: { message: string } | null;
}> {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("org_id", orgId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: (data as AuditEntry[]) || [], error: null };
}

/**
 * Get audit logs for a specific actor
 */
export async function getActorAuditLog(
  supabase: SupabaseClient,
  orgId: string,
  actorId: string,
  limit: number = 50
): Promise<{
  data: AuditEntry[] | null;
  error: { message: string } | null;
}> {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("org_id", orgId)
    .eq("actor_id", actorId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data: (data as AuditEntry[]) || [], error: null };
}

/**
 * Export audit logs as CSV
 */
export function exportAuditLogsAsCSV(logs: AuditEntry[]): string {
  if (logs.length === 0) {
    return "created_at,actor_id,action,entity_type,entity_id\n";
  }

  const headers = ["created_at", "actor_id", "action", "entity_type", "entity_id", "detail"];
  const rows = logs.map((log) => [
    log.created_at,
    log.actor_id,
    log.action,
    log.entity_type,
    log.entity_id || "",
    JSON.stringify(log.detail || {}),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return csvContent;
}
