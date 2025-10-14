/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if identifier has exceeded rate limit
 * @param identifier - Unique identifier (e.g., email, IP address)
 * @param limit - Maximum number of attempts allowed
 * @param windowMs - Time window in milliseconds (default: 60 seconds)
 * @returns true if under limit, false if exceeded
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const key = `rate-limit:${identifier}`;

  let entry = rateLimitStore.get(key);

  // Initialize or reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;

  const allowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string): void {
  const key = `rate-limit:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(identifier: string): {
  count: number;
  resetAt: number | null;
} {
  const key = `rate-limit:${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < Date.now()) {
    return { count: 0, resetAt: null };
  }

  return {
    count: entry.count,
    resetAt: entry.resetAt,
  };
}
