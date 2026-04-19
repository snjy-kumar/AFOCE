// ============================================================
// Health Check API
// ============================================================

import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import { applySecurityHeaders } from "@/lib/utils/security";

type CheckStatus = {
  status: "healthy" | "unhealthy" | "configured" | "not_configured";
  responseTime?: number;
  error?: string;
};

function getMissingEnvVars() {
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ];

  return requiredEnvVars.filter((name) => !process.env[name]);
}

export async function GET() {
  const checks: Record<string, CheckStatus> = {};
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

  const missingEnvVars = getMissingEnvVars();

  checks.environment = {
    status: missingEnvVars.length > 0 ? "unhealthy" : "healthy",
    error:
      missingEnvVars.length > 0
        ? `Missing: ${missingEnvVars.join(", ")}`
        : undefined,
  };

  if (missingEnvVars.length > 0) {
    overallStatus = "unhealthy";
  }

  if (overallStatus !== "unhealthy") {
    try {
      const start = Date.now();
      const supabase = createPublicClient();

      const { error } = await supabase
        .from("workspaces")
        .select("id", { head: true, count: "exact" });

      checks.database = {
        status: error ? "unhealthy" : "healthy",
        responseTime: Date.now() - start,
        error: error?.message,
      };

      if (error) {
        overallStatus = "degraded";
      }
    } catch (error) {
      checks.database = {
        status: "unhealthy",
        error:
          error instanceof Error ? error.message : "Unknown database error",
      };
      overallStatus = "unhealthy";
    }
  } else {
    checks.database = {
      status: "unhealthy",
      error: "Skipped because required environment variables are missing",
    };
  }

  checks.email = {
    status: process.env.RESEND_API_KEY ? "configured" : "not_configured",
  };

  checks.redis = {
    status: process.env.UPSTASH_REDIS_REST_URL
      ? "configured"
      : "not_configured",
  };

  const statusCode =
    overallStatus === "healthy"
      ? 200
      : overallStatus === "degraded"
        ? 503
        : 500;

  return applySecurityHeaders(
    NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "0.1.0",
        checks,
      },
      { status: statusCode },
    ),
  );
}
