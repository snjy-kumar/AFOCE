// ============================================================
// Supabase Server Client Utilities
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Create authenticated Supabase client for API routes
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // No-op for API routes
      },
    }
  );
}

// Get current user with error handling
export async function getCurrentUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }
  return { user, error: null };
}

// Get user profile with org_id
export async function getUserProfile(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*, workspace:workspaces(*)")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return { profile: null, error: "Profile not found" };
  }

  return { profile, error: null };
}

// Verify user belongs to org
export async function verifyOrgAccess(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  orgId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", userId)
    .eq("org_id", orgId)
    .single();

  return !!data;
}

// Standard error responses
export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse {
  return NextResponse.json(
    { data: null, error: { message } },
    { status: 401 }
  );
}

export function forbiddenResponse(message: string = "Access denied"): NextResponse {
  return NextResponse.json(
    { data: null, error: { message } },
    { status: 403 }
  );
}

export function notFoundResponse(entity: string = "Resource"): NextResponse {
  return NextResponse.json(
    { data: null, error: { message: `${entity} not found` } },
    { status: 404 }
  );
}

export function validationErrorResponse(errors: string[]): NextResponse {
  return NextResponse.json(
    { data: null, error: { message: "Validation failed", errors } },
    { status: 400 }
  );
}

export function serverErrorResponse(message: string): NextResponse {
  return NextResponse.json(
    { data: null, error: { message } },
    { status: 500 }
  );
}

// Success response helper
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ data, error: null }, { status });
}

// Demo mode check
export async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("demo_user") !== undefined;
}
