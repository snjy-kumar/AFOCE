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

const TEAM_ROLES = ["finance_admin", "manager", "team_member"] as const;

function isTeamRole(value: unknown): value is (typeof TEAM_ROLES)[number] {
  return typeof value === "string" && TEAM_ROLES.includes(value as (typeof TEAM_ROLES)[number]);
}

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

  const { data: actorProfile, error: actorProfileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (actorProfileError || !actorProfile) {
    return forbiddenResponse("Profile not found");
  }

  if (actorProfile.role !== "finance_admin") {
    return forbiddenResponse("Only finance_admin can invite team members");
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

  if (!isTeamRole(role)) {
    return NextResponse.json(
      { data: null, error: { message: "Invalid role" } },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const inviteFullName = typeof full_name === "string" ? full_name.trim() : "";
  const inviteDepartment =
    typeof department === "string" ? department.trim() : "";
  const adminSupabase = createAdminClient();
  const { error: pendingInviteError } = await adminSupabase
    .from("pending_invites")
    .upsert(
      {
        email: normalizedEmail,
        org_id: orgId,
        role,
        full_name: inviteFullName || null,
        department: inviteDepartment || null,
        invited_by: user.id,
      },
      { onConflict: "email" },
    );

  if (pendingInviteError) {
    return NextResponse.json(
      { data: null, error: { message: pendingInviteError.message } },
      { status: 500 },
    );
  }

  const inviteOptions: {
    data: Record<string, string>;
    redirectTo?: string;
  } = {
    data: {
      full_name: inviteFullName,
      department: inviteDepartment,
      invited_by: user.id,
    },
  };

  if (typeof redirectTo === "string" && redirectTo.length > 0) {
    inviteOptions.redirectTo = redirectTo;
  }

  const { data: inviteData, error: inviteError } =
    await adminSupabase.auth.admin.inviteUserByEmail(normalizedEmail, inviteOptions);

  if (inviteError) {
    await adminSupabase.from("pending_invites").delete().eq("email", normalizedEmail);
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
    entityId: normalizedEmail,
    detail: {
      email: normalizedEmail,
      role,
      department: department || null,
      invited_user_id: inviteData.user?.id ?? null,
    },
  });

  return NextResponse.json({ data: inviteData, error: null }, { status: 201 });
}
