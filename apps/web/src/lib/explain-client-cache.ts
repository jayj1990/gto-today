/**
 * Client-side memo for AI explanations.
 *
 * Server-side: /api/explain caches in Upstash Redis (permanent, cross-
 * device). Client-side: this module mirrors successful responses in
 * localStorage so a second view of the same spot + answer on the same
 * device skips the fetch entirely — no spinner, no network.
 *
 * Key schema mirrors the server fingerprint logic (spot + userAnswer +
 * locale) so a single flat namespace covers every surface that calls
 * /api/explain (ResultSheet, PostflopResult, future /review flows).
 *
 * Storage is best-effort: quota errors / Safari private mode / missing
 * window just degrade to "not cached" without breaking the explain
 * flow. Values also carry a version prefix so a prompt-template bump
 * invalidates stale entries cleanly.
 */

const VERSION = 'v4'; // bump when the Claude system prompt changes
const KEY_PREFIX = `gto.explain.${VERSION}:`;

export interface CacheKeyInput {
  readonly spotId: string;
  readonly userAnswer: string | null;
  readonly locale?: string;
}

export function cacheKey({ spotId, userAnswer, locale = 'ko' }: CacheKeyInput): string {
  return `${KEY_PREFIX}${locale}:${spotId}:${userAnswer ?? '_'}`;
}

export function readCached(input: CacheKeyInput): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(cacheKey(input));
  } catch {
    return null;
  }
}

export function writeCached(input: CacheKeyInput, text: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(cacheKey(input), text);
  } catch {
    // Quota exceeded or storage disabled — ignore.
  }
}
