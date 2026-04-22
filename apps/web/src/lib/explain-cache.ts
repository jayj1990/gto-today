import { createHash } from 'node:crypto';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Cache + rate-limit for the Claude Haiku explain endpoint.
 *
 * Cost-control strategy (see memory/gto_today_build_deps for the
 * deployment-side rationale):
 *   • fingerprint the spot → sha256 → 16-char key
 *   • cache: read-through Redis GET on /api/explain before calling
 *     Claude; write-through SET (no TTL — explanations are stable)
 *   • rate-limit: per-user sliding window (60 req / hour). Raw IP
 *     fallback when unauthenticated (hard-stops abusive crawlers).
 *
 * In local dev without Upstash env vars, both adapters no-op: cache
 * always misses, rate-limit always allows. Production must set both
 * UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 */
// Accept Upstash only when BOTH env vars are present AND the URL is
// actually an https:// URL. Vercel's "Sensitive" flag can surface
// placeholder strings (literal variable names or masks) at build time,
// so a truthy check alone is not enough — Redis.fromEnv() throws a
// `UrlError` when the URL is invalid and blows up the whole Next.js
// build because /api/explain's module evaluates at collect-page-data.
const upstashUrl = process.env['UPSTASH_REDIS_REST_URL'];
const upstashToken = process.env['UPSTASH_REDIS_REST_TOKEN'];
const hasUpstash =
  typeof upstashUrl === 'string' &&
  upstashUrl.startsWith('https://') &&
  typeof upstashToken === 'string' &&
  upstashToken.length > 0;

let redis: Redis | null = null;
if (hasUpstash) {
  try {
    redis = Redis.fromEnv();
  } catch {
    // Invalid env still makes fromEnv throw — fall back to disabled
    // cache rather than taking the whole route down.
    redis = null;
  }
}

// 60 explanations per user per hour. Sliding window so a burst +
// gradual decay reads as a single budget, not daily step-function.
const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 h'),
      analytics: false,
      prefix: 'gto:explain:rl',
    })
  : null;

const KEY_PREFIX = 'gto:explain:';

export interface ExplainCacheKey {
  /** Whatever shape the POST body is. Stable JSON.stringify result. */
  readonly body: unknown;
}

export function fingerprint(body: unknown): string {
  const canon = JSON.stringify(body, Object.keys(body as object).sort());
  return createHash('sha256').update(canon).digest('hex').slice(0, 16);
}

export async function cacheGet(fp: string): Promise<string | null> {
  if (!redis) return null;
  try {
    const v = await redis.get<string>(`${KEY_PREFIX}${fp}`);
    return v ?? null;
  } catch {
    return null;
  }
}

export async function cacheSet(fp: string, value: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(`${KEY_PREFIX}${fp}`, value);
  } catch {
    /* ignore — cache failure shouldn't break the response */
  }
}

export interface RateLimitResult {
  readonly success: boolean;
  readonly remaining: number;
  readonly reset: number; // epoch ms
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  if (!ratelimit) {
    return { success: true, remaining: 60, reset: Date.now() + 3_600_000 };
  }
  const r = await ratelimit.limit(identifier);
  return { success: r.success, remaining: r.remaining, reset: r.reset };
}

/** `true` when the cache backend is actually wired up. Endpoints
 *  surface this in their response so the client can display a "cache
 *  hit" badge without the server having to return a separate flag. */
export const CACHE_BACKEND = hasUpstash ? 'upstash' : 'disabled';
