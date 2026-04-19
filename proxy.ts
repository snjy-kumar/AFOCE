// ============================================================
// Next.js Proxy - Auth, Security, and Rate Limiting
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  checkRateLimitMemory,
  rateLimitResponse,
} from "@/lib/utils/rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Security headers to add to all responses
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; font-src 'self'; connect-src 'self' https://*.supabase.co;",
};

// Check if request is from demo user
function isDemoUser(request: NextRequest): boolean {
  return request.cookies.get("demo_user") !== undefined;
}

// Check if user is rate limited (memory-based for edge)
async function checkMiddlewareRateLimit(
  request: NextRequest,
): Promise<{ allowed: boolean; response?: NextResponse }> {
  // Skip rate limiting for static assets
  if (
    request.nextUrl.pathname.match(
      /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/,
    )
  ) {
    return { allowed: true };
  }

  // Stricter limits for auth endpoints
  const isAuthEndpoint = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth",
    "/api/auth",
  ].some((path) => request.nextUrl.pathname.startsWith(path));

  if (isAuthEndpoint) {
    const rateLimit = await checkRateLimitMemory(request, 10, 60000); // 10 requests per minute
    if (!rateLimit.success) {
      return {
        allowed: false,
        response: rateLimitResponse(rateLimit.remaining, rateLimit.reset),
      };
    }
  }

  return { allowed: true };
}

// Apply security headers to response
function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export async function proxy(request: NextRequest) {
  // Check rate limiting first
  const rateLimitCheck = await checkMiddlewareRateLimit(request);
  if (!rateLimitCheck.allowed && rateLimitCheck.response) {
    return rateLimitCheck.response;
  }

  // Create Supabase client
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Get current user via JWT claims (Next.js 16 SSR pattern — no network round-trip)
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const demoUser = isDemoUser(request);
  const isAuthenticated = user || demoUser;

  // Define protected routes
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  // Auth pages: login, register, forgot/reset password, and all /auth/* routes
  // (email confirm, verify-email, etc.) — accessible without authentication
  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth",
  ].some((path) => request.nextUrl.pathname.startsWith(path));

  // Check if API route needs auth (exclude health and docs)
  const isPublicApi = ["/api/health", "/api/docs"].some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  // Redirect unauthenticated users from dashboard
  if (isDashboard && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    const response = NextResponse.redirect(url);
    return applySecurityHeaders(response);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const response = NextResponse.redirect(url);
    return applySecurityHeaders(response);
  }

  // Protect API routes (except public ones)
  if (isApiRoute && !isPublicApi && !isAuthenticated) {
    return applySecurityHeaders(
      NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 },
      ),
    );
  }

  // Handle OPTIONS requests (CORS preflight)
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    return response;
  }

  // Apply security headers to response
  return applySecurityHeaders(supabaseResponse);
}

export const config = {
  matcher: [
    // Dashboard routes
    "/dashboard/:path*",
    // Auth pages (login, register, forgot/reset password)
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    // Public auth flow routes (confirm, verify-email, etc.)
    "/auth/:path*",
    // API routes (for auth check)
    "/api/:path*",
  ],
};
