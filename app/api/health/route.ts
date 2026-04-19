// ============================================================
// Health Check API
// ============================================================

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { applySecurityHeaders } from "@/lib/utils/security";

export async function GET() {
  const checks: Record<string, { status: string; responseTime?: number; error?: string }> = {};
  let overallStatus = "healthy";

  // Check Supabase connection
  try {
    const start = Date.now();
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { error } = await supabase.from("workspaces").select("count").single();
    checks.database = {
      status: error ? "unhealthy" : "healthy",
      responseTime: Date.now() - start,
      error: error?.message,
    };

    if (error) overallStatus = "degraded";
  } catch (error) {
    checks.database = {
      status: "unhealthy",
      error: (error as Error).message,
    };
    overallStatus = "unhealthy";
  }

  // Check environment variables
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ];

  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
  checks.environment = {
    status: missingEnvVars.length > 0 ? "unhealthy" : "healthy",
    error: missingEnvVars.length > 0 ? `Missing: ${missingEnvVars.join(", ")}` : undefined,
  };

  if (missingEnvVars.length > 0) overallStatus = "unhealthy";

  // Check optional services
  if (process.env.RESEND_API_KEY) {
    checks.email = { status: "configured" };
  } else {
    checks.email = { status: "not_configured" };
  }

  if (process.env.UPSTASH_REDIS_REST_URL) {
    checks.redis = { status: "configured" };
  } else {
    checks.redis = { status: "not_configured" };
  }

  const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 503 : 500;

  return applySecurityHeaders(
    NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "0.1.0",
        checks,
      },
      { status: statusCode }
    )
  );
}
