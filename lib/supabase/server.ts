// ============================================================
// Supabase Server Client Utilities
// Shared auth, public, and admin helpers for server contexts
// ============================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getSupabaseUrl(): string {
  return getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
}

function getSupabasePublishableKey(): string {
  return getRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

function getSupabaseServiceRoleKey(): string {
  return getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

function buildCookieAdapter(
  cookieStore: CookieStore,
  allowSetCookies: boolean,
) {
  return {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(
      cookiesToSet: Array<{
        name: string;
        value: string;
        options?: Record<string, unknown>;
      }>,
    ) {
      if (!allowSetCookies) {
        return;
      }

      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch {
        // Cookie writes may fail in some server contexts.
        // Middleware should handle session refresh when needed.
      }
    },
  };
}

// Create authenticated Supabase client for API routes / server contexts
export async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: buildCookieAdapter(cookieStore, false),
  });
}

// Create Supabase client for server components/actions where cookie writes are allowed
export async function createServerComponentClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: buildCookieAdapter(cookieStore, true),
  });
}

// Create unauthenticated server-side client for public/internal read checks
export function createPublicClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Create privileged admin client for secure backend-only operations
export function createAdminClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Get current user with error handling
export async function getCurrentUser(
  supabase: Pick<SupabaseClient, "auth">,
): Promise<{
  user: { id: string; email?: string | null } | null;
  error: string | null;
}> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    error: null,
  };
}

// Get user profile with workspace relation
export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ profile: Record<string, unknown> | null; error: string | null }> {
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

// Get current user's org_id
export async function getCurrentOrgId(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ orgId: string | null; error: string | null }> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", userId)
    .single();

  if (error || !profile?.org_id) {
    return { orgId: null, error: "No workspace found" };
  }

  return { orgId: profile.org_id as string, error: null };
}

// Verify user belongs to org
export async function verifyOrgAccess(
  supabase: SupabaseClient,
  userId: string,
  orgId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", userId)
    .eq("org_id", orgId)
    .single();

  return !!data;
}

// Demo mode check
export async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("demo_user") !== undefined;
}

// Standard error responses
export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ data: null, error: { message } }, { status: 401 });
}

export function forbiddenResponse(message = "Access denied"): NextResponse {
  return NextResponse.json({ data: null, error: { message } }, { status: 403 });
}

export function notFoundResponse(entity = "Resource"): NextResponse {
  return NextResponse.json(
    { data: null, error: { message: `${entity} not found` } },
    { status: 404 },
  );
}

export function validationErrorResponse(errors: string[]): NextResponse {
  return NextResponse.json(
    { data: null, error: { message: "Validation failed", errors } },
    { status: 400 },
  );
}

export function serverErrorResponse(message: string): NextResponse {
  return NextResponse.json({ data: null, error: { message } }, { status: 500 });
}

// Success response helper
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data, error: null }, { status });
}
