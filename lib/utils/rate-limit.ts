// ============================================================
// Rate Limiting with Upstash Redis
// ============================================================

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const memoryStore = new Map<string, { count: number; resetAt: number }>();

async function createRatelimit(
  redisClient: Redis,
  limit: number,
  window: string,
  prefix: string
): Promise<Ratelimit> {
  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(limit, window as "1 m" | "1 h" | "1 d"),
    analytics: true,
    prefix,
  });
}

let rateLimits: {
  auth: Ratelimit | null;
  api: Ratelimit | null;
  export: Ratelimit | null;
  upload: Ratelimit | null;
  batch: Ratelimit | null;
} | null = null;

async function initRateLimits() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  return {
    auth: await createRatelimit(redis, 5, "1 m", "ratelimit:auth"),
    api: await createRatelimit(redis, 100, "1 m", "ratelimit:api"),
    export: await createRatelimit(redis, 10, "1 m", "ratelimit:export"),
    upload: await createRatelimit(redis, 20, "1 h", "ratelimit:upload"),
    batch: await createRatelimit(redis, 30, "1 m", "ratelimit:batch"),
  };
}

function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() ||
    real ||
    "127.0.0.1";
}

export async function checkRateLimit(
  request: Request,
  type: "auth" | "api" | "export" | "upload" | "batch",
  identifier?: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (!rateLimits) {
    rateLimits = await initRateLimits();
  }

  const key = identifier || getIP(request);

  if (!rateLimits) {
    const now = Date.now();
    return { success: true, limit: 100, remaining: 100, reset: now + 60000 };
  }

  const limiter = rateLimits[type];
  if (!limiter) {
    const now = Date.now();
    return { success: true, limit: 100, remaining: 100, reset: now + 60000 };
  }

  try {
    const result = await limiter.limit(key);
    return result;
  } catch {
    const now = Date.now();
    return { success: true, limit: 100, remaining: 100, reset: now + 60000 };
  }
}

export function rateLimitResponse(
  remaining: number,
  reset: number
): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
      },
    }
  );
}

export async function checkRateLimitMemory(
  request: Request,
  maxRequests: number = 100,
  windowMs: number = 60000
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = getIP(request);
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || record.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0, reset: record.resetAt };
  }

  record.count++;
  return { success: true, remaining: maxRequests - record.count, reset: record.resetAt };
}