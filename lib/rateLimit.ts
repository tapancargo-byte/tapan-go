/**
 * Rate Limiting System
 * 
 * OPTIONAL FEATURE - Requires: npm install @upstash/ratelimit @upstash/redis
 * 
 * If packages are not installed, rate limiting will be disabled
 * but won't break the build.
 */

import { NextResponse } from "next/server";

let Ratelimit: any;
let Redis: any;

// Try to import optional dependencies
let packagesAvailable = false;
try {
  const ratelimit = require("@upstash/ratelimit");
  const redis = require("@upstash/redis");
  Ratelimit = ratelimit.Ratelimit;
  Redis = redis.Redis;
  packagesAvailable = true;
} catch (error) {
  console.warn(
    "⚠️  Rate limiting packages not installed. " +
    "Run: npm install @upstash/ratelimit @upstash/redis"
  );
}

// Initialize Upstash Redis (only if packages available)
const redis = packagesAvailable && process.env.UPSTASH_REDIS_REST_URL && Redis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Create rate limiters for different use cases
export const rateLimiters = {
  // API endpoints - 10 requests per 10 seconds
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
        prefix: "@ratelimit/api",
      })
    : null,

  // Authentication - 5 attempts per minute
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "@ratelimit/auth",
      })
    : null,

  // Public tracking - 30 requests per minute
  tracking: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        analytics: true,
        prefix: "@ratelimit/tracking",
      })
    : null,

  // File uploads - 5 uploads per 5 minutes
  uploads: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "5 m"),
        analytics: true,
        prefix: "@ratelimit/uploads",
      })
    : null,
};

/**
 * Check rate limit for an identifier
 * Returns { success: true } if allowed, { success: false, ... } if rate limited
 */
export async function checkRateLimit(
  limiterType: keyof typeof rateLimiters,
  identifier: string
) {
  const limiter = rateLimiters[limiterType];

  // If rate limiting not configured, allow all requests
  if (!limiter) {
    console.warn(`Rate limiting not configured for ${limiterType}`);
    return { success: true };
  }

  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}

/**
 * Middleware wrapper to rate limit API routes
 */
export function withRateLimit(
  limiterType: keyof typeof rateLimiters,
  handler: (req: Request) => Promise<NextResponse>,
  getIdentifier?: (req: Request) => string
) {
  return async (req: Request) => {
    // Get identifier (default to IP address)
    const identifier =
      getIdentifier?.(req) ||
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    // Check rate limit
    const rateLimit = await checkRateLimit(limiterType, identifier);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: rateLimit.reset
            ? Math.ceil((rateLimit.reset - Date.now()) / 1000)
            : 60,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit?.toString() || "0",
            "X-RateLimit-Remaining": rateLimit.remaining?.toString() || "0",
            "X-RateLimit-Reset": rateLimit.reset?.toString() || "0",
            "Retry-After": rateLimit.reset
              ? Math.ceil((rateLimit.reset - Date.now()) / 1000).toString()
              : "60",
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(req);
    
    if (rateLimit.limit) {
      response.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
      response.headers.set("X-RateLimit-Remaining", rateLimit.remaining?.toString() || "0");
      if (rateLimit.reset) {
        response.headers.set("X-RateLimit-Reset", rateLimit.reset.toString());
      }
    }

    return response;
  };
}

/**
 * Rate limit check for server components
 */
export async function requireRateLimit(
  limiterType: keyof typeof rateLimiters,
  identifier: string
): Promise<void> {
  const result = await checkRateLimit(limiterType, identifier);

  if (!result.success) {
    throw new Error(`Rate limit exceeded. Try again in ${result.reset ? Math.ceil((result.reset - Date.now()) / 1000) : 60} seconds.`);
  }
}

/**
 * Check if rate limiting is available
 */
export const rateLimitingAvailable = packagesAvailable && redis !== null;
