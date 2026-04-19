// ============================================================
// Security Utilities
// ============================================================

import { NextResponse } from "next/server";
import validator from "validator";

// Sanitize user input
export function sanitizeInput(input: string): string {
  return validator.escape(validator.trim(input));
}

// Sanitize object values
export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Validate and sanitize file name
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  const baseName = fileName.replace(/\.\//g, "").replace(/\.\./g, "");
  // Remove special characters except safe ones
  return baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

// Security headers for API responses
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// CORS configuration
export const corsConfig = {
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
  allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400, // 24 hours
};

// Check if origin is allowed
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return corsConfig.allowedOrigins.includes(origin) || corsConfig.allowedOrigins.includes("*");
}

// Handle CORS preflight
export function corsResponse(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set("Access-Control-Allow-Methods", corsConfig.allowedMethods.join(", "));
    response.headers.set("Access-Control-Allow-Headers", corsConfig.allowedHeaders.join(", "));
    response.headers.set("Access-Control-Max-Age", String(corsConfig.maxAge));
    return response;
  }

  return null;
}

// Apply CORS headers to response
export function applyCORS(response: NextResponse, request: Request): NextResponse {
  const origin = request.headers.get("origin");
  if (isOriginAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}

// CSRF token validation
export function validateCSRFToken(token: string | null, sessionToken: string): boolean {
  if (!token) return false;
  // Simple comparison - in production use timing-safe comparison
  return token === sessionToken;
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

// IP address extraction with proxy support
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const cf = request.headers.get("cf-connecting-ip");

  return cf || forwarded?.split(",")[0]?.trim() || real || "127.0.0.1";
}

// SQL injection detection (basic)
export function detectSQLInjection(input: string): boolean {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT)\b)|(--)|(\/\*)|(\*\/)/i;
  return sqlPattern.test(input);
}

// XSS detection (basic)
export function detectXSS(input: string): boolean {
  const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  return xssPattern.test(input);
}

// Validate request body size
export function validateBodySize(body: string, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return Buffer.byteLength(body, "utf8") <= maxBytes;
}

// API key validation
export function validateAPIKey(key: string | null): boolean {
  if (!key) return false;
  const validKey = process.env.API_KEY;
  if (!validKey) return false;
  // Simple comparison - use timing-safe comparison in production
  return key === validKey;
}
