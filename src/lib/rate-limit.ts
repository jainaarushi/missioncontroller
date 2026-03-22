/**
 * Simple in-memory rate limiter for API routes.
 * Works on Vercel serverless (per-instance, best-effort).
 * For production scale, use Redis (Upstash) instead.
 */

const hits = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of hits) {
    if (val.resetAt < now) hits.delete(key);
  }
}, 60_000);

export function rateLimit(
  key: string,
  { maxRequests = 10, windowMs = 60_000 }: { maxRequests?: number; windowMs?: number } = {}
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetIn = entry.resetAt - now;

  return { allowed: entry.count <= maxRequests, remaining, resetIn };
}
