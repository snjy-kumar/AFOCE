import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auditLog } from "@/lib/utils/audit";
import { errorResponse, validationErrorResponse } from "@/lib/utils/error-handler";
import { updatePolicySchema } from "@/lib/utils/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .eq("id", id)
    .eq("org_id", profile.org_id)
    .single();

  if (error || !data) {
    return errorResponse(404, "Policy not found");
  }

  return NextResponse.json({ data, error: null });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
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

  const validation = updatePolicySchema.safeParse({ id, ...body });
  if (!validation.success) {
    return validationErrorResponse(validation.error);
  }

  const { id: _validatedId, rules: _rules, ...updateData } = validation.data;

  const { data, error } = await supabase
    .from("policies")
    .update(updateData)
    .eq("id", id)
    .eq("org_id", profile.org_id)
    .select()
    .single();

  if (error) {
    return errorResponse(500, error.message);
  }

  await auditLog({
    supabase,
    actorId: user.id,
    orgId: profile.org_id,
    action: "update",
    entityType: "policies",
    entityId: id,
    detail: updateData,
  });

  return NextResponse.json({ data, error: null });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { error } = await supabase
    .from("policies")
    .delete()
    .eq("id", id)
    .eq("org_id", profile.org_id);

  if (error) {
    return errorResponse(500, error.message);
  }

  await auditLog({
    supabase,
    actorId: user.id,
    orgId: profile.org_id,
    action: "delete",
    entityType: "policies",
    entityId: id,
  });

  return NextResponse.json({ data: { id }, error: null });
}
