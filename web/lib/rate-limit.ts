// Lightweight in-memory fixed-window rate limiter.
//
// Note: state lives per warm serverless instance, so this is a first-layer
// throttle (good against brute-force / spam bursts), not a globally consistent
// limiter. For strict distributed limits, back this with Upstash/Vercel KV.

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number; // seconds until the window resets
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow unbounded.
  if (store.size > 5000) {
    for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
  }

  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
