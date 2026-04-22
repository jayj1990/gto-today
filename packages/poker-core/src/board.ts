import type { BoardState, CardCode, Rank } from './types';
import { rankValue } from './cards';

export const emptyBoard: BoardState = { flop: null, turn: null, river: null };

export function boardStreet(board: BoardState): 'preflop' | 'flop' | 'turn' | 'river' {
  if (board.river !== null) return 'river';
  if (board.turn !== null) return 'turn';
  if (board.flop !== null) return 'flop';
  return 'preflop';
}

export type FlopCards = readonly [CardCode, CardCode, CardCode];

/** Suit pattern on a flop, abstracted away from specific suits.
 *  `r`   — rainbow (3 different suits)
 *  `tt`  — two-tone (2 of one suit + 1 other)
 *  `mono`— monotone (all same suit) */
export type SuitPattern = 'r' | 'tt' | 'mono';

/** Canonical representation of a flop for solver lookup. Two flops
 *  with the same canonical form are iso-equivalent under suit
 *  isomorphism (which TexasSolver uses via set_use_isomorphism=1),
 *  so they share the same pre-computed strategy.
 *
 *  Example: `Ah 7s 2d` and `As 7h 2c` both canonicalize to
 *  `{ ranks: ['A','7','2'], pattern: 'r', key: 'A72r' }`.
 */
export interface BoardCanonical {
  /** Ranks sorted high to low. */
  readonly ranks: readonly [Rank, Rank, Rank];
  readonly pattern: SuitPattern;
  /** Stable string for JSON keys / Map lookups. e.g. `A72r`, `AK7tt`, `987mono`, `KK2r`. */
  readonly key: string;
}

/** Canonicalize a flop under suit isomorphism. Suits collapse to the
 *  pattern only — a two-tone board is `tt` regardless of which suits
 *  make up the pair. */
export function canonicalizeFlop(flop: FlopCards): BoardCanonical {
  const cards = flop.map((c) => ({ r: c[0] as Rank, s: c[1] }));
  cards.sort((a, b) => rankValue(b.r) - rankValue(a.r));
  const ranks: [Rank, Rank, Rank] = [cards[0]!.r, cards[1]!.r, cards[2]!.r];
  const uniqueSuits = new Set(cards.map((c) => c.s)).size;
  const pattern: SuitPattern = uniqueSuits === 3 ? 'r' : uniqueSuits === 1 ? 'mono' : 'tt';
  return { ranks, pattern, key: `${ranks.join('')}${pattern}` };
}

/** Lower-scoring boards differ by more ranks, so this gives a cheap
 *  "how similar" score between two canonical flops for fallback
 *  nearest-neighbor lookup. Score 0 = identical ranks, 3 = no overlap.
 *  Pattern mismatch adds 1. Lower is more similar. */
export function boardDistance(a: BoardCanonical, b: BoardCanonical): number {
  const aRanks = new Set(a.ranks);
  const overlap = b.ranks.filter((r) => aRanks.has(r)).length;
  const rankDist = 3 - overlap;
  const patternDist = a.pattern === b.pattern ? 0 : 1;
  return rankDist + patternDist;
}
