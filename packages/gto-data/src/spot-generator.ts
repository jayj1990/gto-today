import type { CardCode, ComboKey, Position } from '@gto/poker-core';
import { RANKS, SUITS } from '@gto/poker-core';
import { allCombos } from './combos';
import { getPreflopChart, type PreflopStrategyJson } from './preflop';

export interface TrainingSpot {
  readonly id: string;
  readonly combo: ComboKey;
  readonly hero: readonly [CardCode, CardCode];
  readonly position: Position;
  readonly stackBB: number;
  readonly scenario: 'rfi';
  readonly gtoRaise: number;
  readonly gtoFold: number;
  readonly correctAnswer: 'raise' | 'fold' | 'mixed';
}

const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB'];

/** Mulberry32 — tiny deterministic PRNG. */
function seeded(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turn a YYYY-MM-DD string into a 32-bit seed. Stable across clients. */
export function seedFromDate(date: Date | string): number {
  const iso = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < iso.length; i++) {
    h ^= iso.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Pick two concrete cards that instantiate a combo key (e.g. "AKs" → [As, Ks]). */
function comboToCards(combo: ComboKey, rng: () => number): readonly [CardCode, CardCode] {
  const r1 = combo[0];
  const r2 = combo[1];
  const suffix = combo.length === 3 ? combo[2] : undefined;
  if (!r1 || !r2) throw new Error(`Invalid combo: ${combo}`);

  // Pair: two distinct suits
  if (!suffix) {
    const suits = [...SUITS];
    const i1 = Math.floor(rng() * suits.length);
    const s1 = suits.splice(i1, 1)[0]!;
    const i2 = Math.floor(rng() * suits.length);
    const s2 = suits[i2]!;
    return [`${r1}${s1}` as CardCode, `${r2}${s2}` as CardCode];
  }

  // Suited: shared suit
  if (suffix === 's') {
    const suit = SUITS[Math.floor(rng() * SUITS.length)]!;
    return [`${r1}${suit}` as CardCode, `${r2}${suit}` as CardCode];
  }

  // Offsuit: two different suits
  const s1 = SUITS[Math.floor(rng() * SUITS.length)]!;
  const others = SUITS.filter((s) => s !== s1);
  const s2 = others[Math.floor(rng() * others.length)]!;
  return [`${r1}${s1}` as CardCode, `${r2}${s2}` as CardCode];
}

/**
 * Classify a raise frequency into "primary" decision classes.
 * Exposed so the UI can pick a neutral CTA label consistently.
 */
export function classifyAnswer(raise: number): 'raise' | 'fold' | 'mixed' {
  if (raise >= 0.75) return 'raise';
  if (raise <= 0.25) return 'fold';
  return 'mixed';
}

/**
 * Weighted pick so the daily lineup has a healthy mix:
 *  - ~40% clear raise combos
 *  - ~40% clear fold combos
 *  - ~20% mixed-strategy combos (the teachable spots)
 */
function pickCombo(chart: PreflopStrategyJson, rng: () => number): ComboKey {
  const bucketed = { raise: [] as ComboKey[], fold: [] as ComboKey[], mixed: [] as ComboKey[] };
  for (const c of allCombos()) {
    const entry = chart[c];
    const r = entry?.raise ?? 0;
    const bucket = classifyAnswer(r);
    bucketed[bucket].push(c);
  }
  const roll = rng();
  const key = roll < 0.4 ? 'raise' : roll < 0.8 ? 'fold' : 'mixed';
  const bucket = bucketed[key].length > 0 ? bucketed[key] : bucketed.raise;
  return bucket[Math.floor(rng() * bucket.length)]!;
}

export interface GenerateOptions {
  readonly count?: number;
  readonly dateSeed?: string;
  /** When true, each spot rotates through a new position for variety. */
  readonly rotatePositions?: boolean;
}

/**
 * Generate today's challenge lineup.
 * Deterministic: the same date on any device produces the same 10 spots.
 */
export async function generateDailySpots(
  opts: GenerateOptions = {},
): Promise<TrainingSpot[]> {
  const count = opts.count ?? 10;
  const dateKey = opts.dateSeed ?? new Date().toISOString().slice(0, 10);
  const rng = seeded(seedFromDate(dateKey));

  // Pre-load all position charts up front; they're small and it simplifies the loop.
  const charts = new Map<Position, PreflopStrategyJson>();
  for (const p of POSITIONS) {
    const chart = await getPreflopChart('6max', p);
    if (chart) charts.set(p, chart);
  }

  const out: TrainingSpot[] = [];
  for (let i = 0; i < count; i++) {
    const position = POSITIONS[i % POSITIONS.length]!; // rotate through positions
    const chart = charts.get(position);
    if (!chart) continue;
    const combo = pickCombo(chart, rng);
    const entry = chart[combo] ?? { raise: 0, fold: 1 };
    const hero = comboToCards(combo, rng);
    out.push({
      id: `${dateKey}-${i}-${combo}-${position}`,
      combo,
      hero,
      position,
      stackBB: 100,
      scenario: 'rfi',
      gtoRaise: entry.raise,
      gtoFold: entry.fold,
      correctAnswer: classifyAnswer(entry.raise),
    });
  }
  return out;
}

/**
 * Score a user's answer against the GTO ground truth.
 * - sharp: picked the dominant action (raise >= 0.75 or fold >= 0.75)
 * - acceptable: picked a legit minority action in a mixed spot
 * - wrong: picked the clearly wrong action
 */
export type AnswerGrade = 'sharp' | 'acceptable' | 'wrong';

export function gradeAnswer(spot: TrainingSpot, answer: 'raise' | 'fold'): AnswerGrade {
  const truth = spot.correctAnswer;
  if (truth === 'mixed') {
    // Either action is playable; reward any pick.
    return 'acceptable';
  }
  return answer === truth ? 'sharp' : 'wrong';
}

// Re-export so consumers don't need to import RANKS from poker-core separately.
export { RANKS };
