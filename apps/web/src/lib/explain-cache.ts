/**
 * In-memory explanation cache, keyed by fingerprint.
 *
 * Phase 5 upgrade: swap the Map for Upstash Redis so the cache survives
 * cold starts and is shared across all Vercel instances. The API surface
 * below stays identical so the route handler won't change.
 */

interface Entry {
  text: string;
  createdAt: number;
}

const store = new Map<string, Entry>();
const TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export function getCached(fp: string): string | null {
  const hit = store.get(fp);
  if (!hit) return null;
  if (Date.now() - hit.createdAt > TTL_MS) {
    store.delete(fp);
    return null;
  }
  return hit.text;
}

export function setCached(fp: string, text: string): void {
  store.set(fp, { text, createdAt: Date.now() });
}
