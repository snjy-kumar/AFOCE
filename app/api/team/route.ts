import { NextResponse } from "next/server";
import type { PaginatedResponse, TeamMember } from "@/lib/types";
import {
  createAdminClient,
  createAuthClient,
  forbiddenResponse,
  getCurrentOrgId,
  getCurrentUser,
  unauthorizedResponse,
} from "@/lib/supabase/server";
import { auditLog } from "@/lib/utils/audit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  const supabase = await createAuthClient();
  const { user, error: userError } = await getCurrentUser(supabase);

  if (!user) {
    return unauthorizedResponse(userError || "Unauthorized");
  }

  const { orgId, error: orgError } = await getCurrentOrgId(supabase, user.id);

  if (!orgId) {
    return forbiddenResponse(orgError || "No workspace found");
  }

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (role) query = query.eq("role", role);
  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { data: null, error: { message: error.message } },
      { status: 500 },
    );
  }

  const response: PaginatedResponse<TeamMember> = {
    data: (data || []) as TeamMember[],
    pagination: {
      page,
      pageSize,
      total: count ?? data?.length ?? 0,
    },
  };

  return NextResponse.json({ data: response, error: null });
}

export async function POST(request: Request) {
  const supabase = await createAuthClient();
  const { user, error: userError } = await getCurrentUser(supabase);

  if (!user) {
    return unauthorizedResponse(userError || "Unauthorized");
  }

  const { orgId, error: orgError } = await getCurrentOrgId(supabase, user.id);

  if (!orgId) {
    return forbiddenResponse(orgError || "No workspace found");
  }

  const body = await request.json();
  const {
    email,
    full_name,
    role = "team_member",
    department,
    redirectTo,
  } = body ?? {};

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { data: null, error: { message: "Email is required" } },
      { status: 400 },
    );
  }

  const adminSupabase = createAdminClient();

  const inviteOptions: {
    data: Record<string, string>;
    redirectTo?: string;
  } = {
    data: {
      full_name: typeof full_name === "string" ? full_name : "",
      org_id: orgId,
      role: typeof role === "string" ? role : "team_member",
      department: typeof department === "string" ? department : "",
    },
  };

  if (typeof redirectTo === "string" && redirectTo.length > 0) {
    inviteOptions.redirectTo = redirectTo;
  }

  const { data: inviteData, error: inviteError } =
    await adminSupabase.auth.admin.inviteUserByEmail(email, inviteOptions);

  if (inviteError) {
    return NextResponse.json(
      { data: null, error: { message: inviteError.message } },
      { status: 500 },
    );
  }

  await auditLog({
    supabase,
    actorId: user.id,
    orgId,
    action: "create",
    entityType: "team",
    entityId: email,
    detail: {
      email,
      role,
      department: department || null,
      invited_user_id: inviteData.user?.id ?? null,
    },
  });

  return NextResponse.json({ data: inviteData, error: null }, { status: 201 });
}
