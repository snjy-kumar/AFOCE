// ============================================================
// POST /api/auth/invite — Admin-only user invite
// Requires the calling user to have the `finance_admin` role.
// Sends a Supabase invite email with optional metadata.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  createAuthClient,
  getCurrentUser,
} from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/utils/rate-limit";

const TEAM_ROLES = ["finance_admin", "manager", "team_member"] as const;

function isTeamRole(value: unknown): value is (typeof TEAM_ROLES)[number] {
  return typeof value === "string" && TEAM_ROLES.includes(value as (typeof TEAM_ROLES)[number]);
}

export async function POST(req: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────
  const rl = await checkRateLimit(req, "auth");
  if (!rl.success) return rateLimitResponse(rl.remaining, rl.reset);

  // ── Auth check ─────────────────────────────────────────────
  const supabase = await createAuthClient();
  const { user, error: userError } = await getCurrentUser(supabase);

  if (!user) {
    return NextResponse.json(
      { data: null, error: { message: userError ?? "Unauthorized" } },
      { status: 401 },
    );
  }

  // ── Role check — must be finance_admin ────────────────────
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, org_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { data: null, error: { message: "Profile not found" } },
      { status: 403 },
    );
  }

  if (profile.role !== "finance_admin") {
    return NextResponse.json(
      { data: null, error: { message: "Forbidden: finance_admin role required" } },
      { status: 403 },
    );
  }

  if (!profile.org_id) {
    return NextResponse.json(
      { data: null, error: { message: "No workspace found" } },
      { status: 403 },
    );
  }

  // ── Parse + validate body ──────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: { message: "Invalid JSON body" } },
      { status: 400 },
    );
  }

  const {
    email,
    role = "team_member",
    full_name = "",
  } = body as { email?: string; role?: string; full_name?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { data: null, error: { message: "A valid email address is required" } },
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

  // ── Send invite via admin client ───────────────────────────
  const admin = createAdminClient();
  const { error: pendingInviteError } = await admin
    .from("pending_invites")
    .upsert(
      {
        email: normalizedEmail,
        org_id: profile.org_id,
        role,
        full_name: inviteFullName || null,
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

  const { data, error } = await admin.auth.admin.inviteUserByEmail(normalizedEmail, {
    data: {
      full_name: inviteFullName,
      requested_role: role,
      invited_by: user.id,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard`,
  });

  if (error) {
    await admin.from("pending_invites").delete().eq("email", normalizedEmail);
    return NextResponse.json(
      { data: null, error: { message: error.message } },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { data: { id: data.user?.id ?? null }, error: null },
    { status: 200 },
  );
}
