import { compareHands } from './evaluator';
import { fullDeck, parseCard } from './cards';
import type { CardCode, EquityResult } from './types';

export interface EquityInput {
  /** Hero's exact 2-card holding. */
  readonly hero: readonly [CardCode, CardCode];
  /**
   * Villain's range expressed as concrete 2-card combos (e.g. every AKs combo
   * expands to 4 entries). For a single pair vs pair comparison, provide one
   * combo. Range expansion is the caller's job to keep this API lean.
   */
  readonly villainCombos: readonly (readonly [CardCode, CardCode])[];
  /** 0-5 community cards already dealt. */
  readonly board: readonly CardCode[];
  /** Number of Monte Carlo trials (more = tighter confidence interval). */
  readonly iterations?: number;
  /** Optional PRNG for deterministic tests. */
  readonly rng?: () => number;
}

const DEFAULT_ITERATIONS = 5_000;

/**
 * Estimate hero's equity against the villain range on the given board.
 * Uses Monte Carlo — analytic enumeration is out of scope for runtime.
 */
export function calculateEquity(input: EquityInput): EquityResult {
  const iterations = input.iterations ?? DEFAULT_ITERATIONS;
  const rng = input.rng ?? Math.random;
  const heroCards = input.hero.map((c) => parseCard(c));
  const boardKnown = input.board.map((c) => parseCard(c));
  const villainCombos = input.villainCombos.map(
    (c) => [parseCard(c[0]), parseCard(c[1])] as readonly [CardCode, CardCode],
  );

  if (villainCombos.length === 0) {
    throw new Error('calculateEquity: villainCombos must contain at least one combo');
  }

  const heroWins = { count: 0 };
  const ties = { count: 0 };
  let trials = 0;

  for (let i = 0; i < iterations; i++) {
    // Pick a villain combo at random
    const villain = villainCombos[Math.floor(rng() * villainCombos.length)];
    if (!villain) continue;

    // Build remaining deck
    const used = new Set<string>([...heroCards, ...boardKnown, ...villain]);
    if (hasDuplicate([...heroCards, ...villain, ...boardKnown])) continue;

    const deck = fullDeck().filter((c) => !used.has(c));

    // Draw remaining board cards
    const need = 5 - boardKnown.length;
    const drawn: CardCode[] = [];
    const deckCopy = deck.slice();
    for (let j = 0; j < need; j++) {
      const idx = Math.floor(rng() * deckCopy.length);
      const card = deckCopy[idx];
      if (!card) continue;
      drawn.push(card);
      deckCopy.splice(idx, 1);
    }

    const fullBoard = [...boardKnown, ...drawn];
    const heroFinal: readonly CardCode[] = [...heroCards, ...fullBoard];
    const villainFinal: readonly CardCode[] = [...villain, ...fullBoard];

    const winners = compareHands([heroFinal, villainFinal]);
    if (winners.length === 2) {
      ties.count++;
    } else if (winners[0] === 0) {
      heroWins.count++;
    }
    trials++;
  }

  if (trials === 0) {
    return { heroEquity: 0, tieEquity: 0, iterations: 0 };
  }

  return {
    heroEquity: heroWins.count / trials + ties.count / (2 * trials),
    tieEquity: ties.count / trials,
    iterations: trials,
  };
}

function hasDuplicate(cards: readonly CardCode[]): boolean {
  const seen = new Set<string>();
  for (const c of cards) {
    if (seen.has(c)) return true;
    seen.add(c);
  }
  return false;
}

/**
 * Deterministic seeded PRNG (mulberry32) — used by tests and reproducible
 * demos. Returns a `()=>number` conforming to Math.random.
 */
export function seededRng(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
