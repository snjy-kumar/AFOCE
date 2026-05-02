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
    .select("role")
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

  // ── Send invite via admin client ───────────────────────────
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name,
      role,
      invited_by: user.id,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard`,
  });

  if (error) {
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
