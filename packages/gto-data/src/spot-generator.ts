import type { CardCode, ComboKey, Position, TableFormat } from '@gto/poker-core';
import { RANKS, SUITS } from '@gto/poker-core';
import { allCombos } from './combos';
import { getPreflopChart, type PreflopStrategyJson } from './preflop';

export interface TrainingSpot {
  readonly id: string;
  readonly combo: ComboKey;
  readonly hero: readonly [CardCode, CardCode];
  readonly position: Position;
  readonly format: TableFormat;
  readonly stackBB: number;
  readonly scenario: 'rfi';
  readonly gtoRaise: number;
  readonly gtoFold: number;
  readonly correctAnswer: 'raise' | 'fold' | 'mixed';
}

const POSITIONS_9MAX: Position[] = ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB'];
const POSITIONS_6MAX: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB'];

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
 * Combos that are trivial everywhere — any player above beginner level
 * raises these from any position. Excluded from the daily lineup because
 * they teach nothing.
 */
const UNIVERSAL_RAISES: ReadonlySet<string> = new Set([
  'AA',
  'KK',
  'QQ',
  'JJ',
  'AKs',
  'AKo',
]);

/**
 * "Mixedness" score — how close is the raise frequency to a 50/50 coin flip?
 *   raise=0.5  → 1.0  (maximally educational, true mixed strategy)
 *   raise=0.75 → 0.5  (borderline, still teachable)
 *   raise=1.0  → 0.0  (trivial raise)
 *   raise=0.0  → 0.0  (trivial fold)
 */
function mixedness(raise: number): number {
  return 1 - Math.abs(raise - 0.5) * 2;
}

/**
 * Pick a combo skewed toward the hardest (most educational) spots.
 * Universal trivials are excluded entirely; the remaining pool is sampled
 * with weight = 0.15 + mixedness^2 * 2, so a 50/50 spot is ~14× more
 * likely than a 90/10 spot.
 */
function pickCombo(chart: PreflopStrategyJson, rng: () => number): ComboKey {
  const scored: Array<{ combo: ComboKey; weight: number }> = [];
  for (const c of allCombos()) {
    if (UNIVERSAL_RAISES.has(c)) continue;
    const r = chart[c]?.raise ?? 0;
    // Skip universal-fold combos: raise=0 hands the user will never face IRL anyway.
    if (r === 0) continue;
    const m = mixedness(r);
    scored.push({ combo: c, weight: 0.15 + m * m * 2 });
  }
  if (scored.length === 0) {
    // Fallback — shouldn't happen with any realistic chart
    const any = allCombos()[0]!;
    return any;
  }
  const total = scored.reduce((acc, s) => acc + s.weight, 0);
  let roll = rng() * total;
  for (const item of scored) {
    roll -= item.weight;
    if (roll <= 0) return item.combo;
  }
  return scored[scored.length - 1]!.combo;
}

/**
 * True if a spot is worth explaining (and caching AI explanations for).
 * Exported so Phase 5 warmup jobs can skip trivial combos.
 */
export function isEducational(raise: number, combo: string): boolean {
  if (UNIVERSAL_RAISES.has(combo)) return false;
  if (raise === 0) return false; // universal fold
  if (raise >= 0.97) return false; // effectively auto-raise
  return true;
}

export interface GenerateOptions {
  readonly count?: number;
  readonly dateSeed?: string;
  readonly format?: TableFormat;
}

/**
 * Generate today's challenge lineup.
 * Deterministic: the same date on any device produces the same 10 spots.
 */
export async function generateDailySpots(
  opts: GenerateOptions = {},
): Promise<TrainingSpot[]> {
  const count = opts.count ?? 10;
  const format: TableFormat = opts.format ?? '6max';
  const dateKey = opts.dateSeed ?? new Date().toISOString().slice(0, 10);
  const rng = seeded(seedFromDate(dateKey));
  const positions = format === '6max' ? POSITIONS_6MAX : POSITIONS_9MAX;

  const charts = new Map<Position, PreflopStrategyJson>();
  for (const p of positions) {
    const chart = await getPreflopChart(format, p);
    if (chart) charts.set(p, chart);
  }

  const out: TrainingSpot[] = [];
  for (let i = 0; i < count; i++) {
    const position = positions[i % positions.length]!;
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
      format,
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
