import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { PaginatedResponse, TeamMember } from "@/lib/types";
import { auditLog } from "@/lib/utils/audit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json({ data: null, error: { message: "No workspace found" } }, { status: 403 });
  }

  let query = supabase
    .from("profiles")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (role) query = query.eq("role", role);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 });
  }

  const response: PaginatedResponse<TeamMember> = {
    data: data as TeamMember[],
    pagination: { page, pageSize, total: data?.length || 0 },
  };

  return NextResponse.json({ data: response, error: null });
}

export async function POST(request: Request) {
  // Invite team member: creates auth user + profile with pending status
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json({ data: null, error: { message: "No workspace found" } }, { status: 403 });
  }

  const body = await request.json();
  const { email, full_name, role = "team_member", department } = body;

  if (!email) {
    return NextResponse.json({ data: null, error: { message: "Email is required" } }, { status: 400 });
  }

  // Invite user via Supabase Auth
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: full_name || "", org_id: profile.org_id, role },
  });

  if (inviteError) {
    return NextResponse.json({ data: null, error: { message: inviteError.message } }, { status: 500 });
  }

  await auditLog({
    supabase,
    actorId: user.id,
    orgId: profile.org_id,
    action: "create",
    entityType: "team",
    entityId: email,
    detail: { email, role },
  });

  return NextResponse.json({ data: inviteData, error: null }, { status: 201 });
}
