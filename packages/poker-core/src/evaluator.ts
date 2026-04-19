/// <reference path="./pokersolver.d.ts" />
import { Hand } from 'pokersolver';
import type { CardCode } from './types';

/**
 * Ranking of hand categories (0 = worst, 9 = best). Maps to pokersolver
 * internal ranks but is exposed as a typed enum for consumers.
 */
export type HandCategory =
  | 'high-card'
  | 'pair'
  | 'two-pair'
  | 'three-of-a-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-of-a-kind'
  | 'straight-flush'
  | 'royal-flush';

export interface HandRank {
  readonly category: HandCategory;
  readonly description: string;
  /** Higher is better. Collapses a full hand to a single comparable integer. */
  readonly strength: number;
}

const CATEGORY_ORDER: HandCategory[] = [
  'high-card',
  'pair',
  'two-pair',
  'three-of-a-kind',
  'straight',
  'flush',
  'full-house',
  'four-of-a-kind',
  'straight-flush',
  'royal-flush',
];

/**
 * pokersolver takes single-character ranks directly (T, J, Q, K, A) — it only
 * uses multi-character "10" in its own toString output, not input. Pass the
 * card code through unchanged.
 */
function toSolverCard(code: CardCode): string {
  return code as string;
}

function classifyFromSolverName(name: string, descr: string): HandCategory {
  const n = name.toLowerCase();
  if (n.startsWith('royal')) return 'royal-flush';
  if (n.startsWith('straight flush')) {
    // pokersolver sets descr to "Royal Flush" when the straight-flush tops out at Ace.
    if (/royal/i.test(descr)) return 'royal-flush';
    return 'straight-flush';
  }
  if (n.startsWith('four')) return 'four-of-a-kind';
  if (n.startsWith('full')) return 'full-house';
  if (n === 'flush') return 'flush';
  if (n === 'straight') return 'straight';
  if (n.startsWith('three')) return 'three-of-a-kind';
  if (n.startsWith('two')) return 'two-pair';
  if (n === 'pair') return 'pair';
  return 'high-card';
}

/**
 * Evaluate 5-7 cards and return a typed hand rank.
 * Accepts any mix of hole cards + board cards (total must be 5-7).
 */
export function evaluateHand(cards: readonly CardCode[]): HandRank {
  if (cards.length < 5 || cards.length > 7) {
    throw new Error(`evaluateHand: expected 5-7 cards, got ${cards.length}`);
  }
  const solved = Hand.solve(cards.map(toSolverCard));
  const category = classifyFromSolverName(solved.name, solved.descr);
  const base = CATEGORY_ORDER.indexOf(category) * 1_000_000;
  return {
    category,
    description: solved.descr,
    strength: base + solved.rank,
  };
}

/** Returns the index(es) of the winning hand(s). Supports ties. */
export function compareHands(handsCards: readonly (readonly CardCode[])[]): number[] {
  const solved = handsCards.map((c) => Hand.solve(c.map(toSolverCard)));
  const winners = Hand.winners(solved);
  const winnerSet = new Set(winners);
  const result: number[] = [];
  for (let i = 0; i < solved.length; i++) {
    const hand = solved[i];
    if (hand !== undefined && winnerSet.has(hand)) result.push(i);
  }
  return result;
}
