import type { BoardState, MixedStrategy, Spot } from '@gto/poker-core';

export type BoardTextureBucket = Brand<number, 'BoardTextureBucket'>;
type Brand<T, B extends string> = T & { readonly __brand: B };

export interface PostflopQuery {
  readonly spot: Spot;
  readonly bucket: BoardTextureBucket;
}

/**
 * Phase 3: Board texture clustering produces 50 buckets (dry/semi-wet/wet/paired/monotone/etc).
 * This stub returns null until data generation is wired up.
 */
export function classifyBoard(_board: BoardState): BoardTextureBucket {
  return 0 as BoardTextureBucket;
}

export function getPostflopStrategy(_query: PostflopQuery): MixedStrategy | null {
  return null;
}
