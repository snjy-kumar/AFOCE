import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auditLog } from "@/lib/utils/audit";
import { errorResponse, validationErrorResponse } from "@/lib/utils/error-handler";
import { createPolicySchema } from "@/lib/utils/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return errorResponse(401, "Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return errorResponse(403, "No workspace found");
  }

  let query = supabase
    .from("policies")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return errorResponse(500, error.message);
  }

  return NextResponse.json({ data, error: null });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return errorResponse(401, "Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return errorResponse(403, "No workspace found");
  }

  const body = await request.json();
  const validation = createPolicySchema.safeParse(body);
  if (!validation.success) {
    return validationErrorResponse(validation.error);
  }
  const policy = validation.data;
  const executable = normalizePolicyDefinition(policy);

  const { data, error } = await supabase
    .from("policies")
    .insert({
      org_id: profile.org_id,
      id: `POL-${Date.now()}`,
      name: policy.name,
      description: policy.description || null,
      category: policy.category,
      status: policy.status,
      trigger_type: policy.trigger_type,
      conditions: executable.conditions,
      actions: executable.actions,
      priority: policy.priority,
      version: policy.version,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return errorResponse(500, error.message);
  }

  await auditLog({
    supabase,
    actorId: user.id,
    orgId: profile.org_id,
    action: "create",
    entityType: "policies",
    entityId: data.id,
    detail: {
      name: policy.name,
      category: policy.category,
      trigger_type: policy.trigger_type,
      conditions: executable.conditions,
      actions: executable.actions,
    },
  });

  return NextResponse.json({ data, error: null }, { status: 201 });
}

function normalizePolicyDefinition(policy: ReturnType<typeof createPolicySchema.parse>) {
  if (policy.conditions.length > 0 || policy.actions.length > 0) {
    return {
      conditions: policy.conditions,
      actions: policy.actions,
    };
  }

  const rules = policy.rules || [];
  return {
    conditions: rules.map((rule) => ({
      fact: rule.field,
      operator: rule.operator === "contains" ? "in" : rule.operator,
      value: rule.value,
    })),
    actions: rules.map((rule) => ({
      type: rule.action === "auto_approve" ? "approve" : rule.action,
      reason: `Legacy rule requested ${rule.action}.`,
      confidence: rule.action === "block" ? 95 : 75,
    })),
  };
}
