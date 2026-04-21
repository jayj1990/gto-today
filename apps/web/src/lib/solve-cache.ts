/**
 * Live-solve cache with Upstash Redis when available, in-memory
 * fallback otherwise. The in-memory map is per Fluid Compute warm
 * instance, so it's useful on repeats from the same user but
 * misses when Vercel spins up a new instance. Redis fixes that.
 *
 * Configure: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * as env vars. No Redis pkg required — the REST API is a plain
 * fetch() away.
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_REDIS = Boolean(REDIS_URL && REDIS_TOKEN);

const MEM_TTL_MS = 60 * 60 * 1000; // 1h
const REDIS_TTL_SEC = 24 * 60 * 60; // 24h — safe to cache longer once shared

interface MemEntry<T> {
  value: T;
  expiresAt: number;
}

const mem = new Map<string, MemEntry<unknown>>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (USE_REDIS) {
    try {
      const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN!}` },
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const body = (await res.json()) as { result: string | null };
      if (body.result == null) return null;
      return JSON.parse(body.result) as T;
    } catch (e) {
      console.warn('[solve-cache] Redis GET failed, falling back:', e);
      // fall through to memory
    }
  }
  const hit = mem.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    mem.delete(key);
    return null;
  }
  return hit.value as T;
}

export async function cacheSet<T>(key: string, value: T): Promise<void> {
  if (USE_REDIS) {
    try {
      const payload = JSON.stringify(value);
      await fetch(
        `${REDIS_URL}/set/${encodeURIComponent(key)}?EX=${REDIS_TTL_SEC}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${REDIS_TOKEN!}`,
            'Content-Type': 'text/plain',
          },
          body: payload,
        },
      );
      return;
    } catch (e) {
      console.warn('[solve-cache] Redis SET failed, using memory:', e);
    }
  }
  mem.set(key, { value, expiresAt: Date.now() + MEM_TTL_MS });
}

/** Runtime tag so we know which backing store served the value. */
export const CACHE_BACKEND: 'redis' | 'memory' = USE_REDIS ? 'redis' : 'memory';
