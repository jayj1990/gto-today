import { createHash } from 'node:crypto';
import type { PostflopAction, PostflopSpot, TrainingSpot } from '@gto/gto-data';

/**
 * Deterministic cache key for an AI explanation request.
 *
 * Preflop and postflop spots each canonicalize the attributes that
 * drive the explanation. Two users on the same spot + tone + answer
 * share a cache entry → Claude cost stays flat with traffic.
 */
export interface FingerprintInput {
  spot: TrainingSpot | PostflopSpot;
  locale: 'ko' | 'en';
  tone: 'beginner' | 'advanced';
  userAnswer?: PostflopAction;
}

export function fingerprint(input: FingerprintInput): string {
  const { spot, locale, tone, userAnswer } = input;
  const isPostflop = 'street' in spot && 'board' in spot;
  const canonical = isPostflop
    ? JSON.stringify({
        kind: 'pf',
        id: spot.id,
        a: userAnswer ?? null,
        l: locale,
        t: tone,
      })
    : JSON.stringify({
        kind: 'pre',
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
