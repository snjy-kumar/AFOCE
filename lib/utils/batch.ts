// ============================================================
// Batch Operations Helper
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { auditLog } from "./audit";

export interface BatchResult<T> {
  successful: T[];
  failed: { item: unknown; error: string; index: number }[];
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}

// Execute batch operations with partial failure handling
export async function executeBatch<T>({
  items,
  operation,
  onSuccess,
  onError,
}: {
  items: unknown[];
  operation: (item: unknown, index: number) => Promise<T>;
  onSuccess?: (result: T, index: number) => Promise<void>;
  onError?: (error: Error, item: unknown, index: number) => void;
}): Promise<BatchResult<T>> {
  const results = await Promise.allSettled(
    items.map((item, index) => operation(item, index))
  );

  const successful: T[] = [];
  const failed: { item: unknown; error: string; index: number }[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successful.push(result.value);
      onSuccess?.(result.value, index);
    } else {
      failed.push({ item: items[index], error: result.reason.message, index });
      onError?.(result.reason as Error, items[index], index);
    }
  });

  return {
    successful,
    failed,
    summary: {
      total: items.length,
      succeeded: successful.length,
      failed: failed.length,
    },
  };
}

// Batch insert with audit logging
export async function batchInsert<T>({
  supabase,
  table,
  items,
  orgId,
  userId,
  entityType,
}: {
  supabase: SupabaseClient;
  table: string;
  items: Record<string, unknown>[];
  orgId: string;
  userId: string;
  entityType: string;
}): Promise<BatchResult<T & { id: string }>> {
  return executeBatch<T & { id: string }>({
    items,
    operation: async (item, index) => {
      const { data, error } = await supabase
        .from(table)
        .insert({ ...(item as Record<string, unknown>), org_id: orgId, created_by: userId })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as T & { id: string };
    },
    onSuccess: async (result, index) => {
      await auditLog({
        supabase,
        actorId: userId,
        orgId,
        action: "create",
        entityType,
        entityId: result.id,
        detail: result,
      });
    },
  });
}

// Batch update with audit logging
export async function batchUpdate<T>({
  supabase,
  table,
  items,
  orgId,
  userId,
  entityType,
  idField = "id",
}: {
  supabase: SupabaseClient;
  table: string;
  items: { id: string }[];
  orgId: string;
  userId: string;
  entityType: string;
  idField?: string;
}): Promise<BatchResult<T & { id: string }>> {
  return executeBatch<T & { id: string }>({
    items,
    operation: async (item: unknown, index: number) => {
      const { id, ...updates } = item as { id: string };
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq(idField, id)
        .eq("org_id", orgId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as T & { id: string };
    },
    onSuccess: async (result, index) => {
      await auditLog({
        supabase,
        actorId: userId,
        orgId,
        action: "update",
        entityType,
        entityId: result.id,
        detail: result,
      });
    },
  });
}

// Batch delete with audit logging
export async function batchDelete<T>({
  supabase,
  table,
  ids,
  orgId,
  userId,
  entityType,
  idField = "id",
}: {
  supabase: SupabaseClient;
  table: string;
  ids: string[];
  orgId: string;
  userId: string;
  entityType: string;
  idField?: string;
}): Promise<BatchResult<T & { id: string }>> {
  return executeBatch<T & { id: string }>({
    items: ids.map((id) => ({ id })),
    operation: async (item: unknown, index: number) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idField, (item as { id: string }).id)
        .eq("org_id", orgId);

      if (error) throw new Error(error.message);
      return { id: (item as { id: string }).id } as T & { id: string };
    },
    onSuccess: async (result, index) => {
      await auditLog({
        supabase,
        actorId: userId,
        orgId,
        action: "delete",
        entityType,
        entityId: result.id,
        detail: { deleted: true },
      });
    },
  });
}

// Batch status update
export async function batchUpdateStatus<T>({
  supabase,
  table,
  ids,
  status,
  orgId,
  userId,
  entityType,
  reason,
}: {
  supabase: SupabaseClient;
  table: string;
  ids: string[];
  status: string;
  orgId: string;
  userId: string;
  entityType: string;
  reason?: string;
}): Promise<BatchResult<T & { id: string }>> {
  return executeBatch<T & { id: string }>({
    items: ids.map((id) => ({ id })),
    operation: async (item: unknown, index: number) => {
      const { data, error } = await supabase
        .from(table)
        .update({ status })
        .eq("id", (item as { id: string }).id)
        .eq("org_id", orgId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as T & { id: string };
    },
    onSuccess: async (result, index) => {
      await auditLog({
        supabase,
        actorId: userId,
        orgId,
        action: "update",
        entityType,
        entityId: result.id,
        detail: { status, reason },
      });
    },
  });
}
