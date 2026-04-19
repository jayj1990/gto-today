import { createHash } from 'node:crypto';
import type { TrainingSpot } from '@gto/gto-data';

/**
 * Deterministic cache key for an AI explanation request.
 *
 * We hash the canonicalized spot attributes that actually affect the
 * explanation (scenario, opener, combo, position, stack) plus the user's
 * locale and tone. Two users hitting the same spot with the same tone
 * share the same cache entry, which is how we keep Claude API costs flat
 * regardless of traffic.
 */
export interface FingerprintInput {
  spot: TrainingSpot;
  locale: 'ko' | 'en';
  tone: 'beginner' | 'advanced';
}

export function fingerprint(input: FingerprintInput): string {
  const { spot, locale, tone } = input;
  const canonical = JSON.stringify({
    s: spot.scenario,
    o: spot.opener ?? null,
    os: spot.openSize ?? null,
    c: spot.combo,
    p: spot.position,
    f: spot.format,
    st: spot.stackBB,
    l: locale,
    t: tone,
  });
  return createHash('sha256').update(canonical).digest('hex').slice(0, 32);
}
