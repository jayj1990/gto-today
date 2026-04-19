import type { ComboKey, MixedStrategy, Position } from '@gto/poker-core';

export interface PreflopQuery {
  readonly combo: ComboKey;
  readonly position: Position;
  readonly stackBB: number;
  readonly scenario: 'rfi' | 'vs_open' | 'vs_3bet' | 'vs_4bet' | 'srp_multi';
}

/**
 * Phase 3 will replace this stub with a real JSON lookup.
 * JSON files live under apps/web/public/data/preflop/{position}-{stack}.json.gz
 * and are fetched once per session then cached in IndexedDB via Serwist.
 */
export function getPreflopStrategy(_query: PreflopQuery): MixedStrategy | null {
  return null;
}
