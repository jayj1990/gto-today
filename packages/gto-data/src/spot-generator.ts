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
 * Only the narrow 50/50 band counts as truly mixed — any clear lean
 * (e.g. 70/30) has a dominant action and should not be graded as "both OK".
 */
export function classifyAnswer(raise: number): 'raise' | 'fold' | 'mixed' {
  if (Math.abs(raise - 0.5) <= 0.05) return 'mixed';
  return raise > 0.5 ? 'raise' : 'fold';
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
 * Pick an educational combo. Excludes universal trivials (AA, 72o, etc.)
 * and samples the remaining pool nearly uniformly so the player sees the
 * full spectrum of ratios — 20/80, 50/50, 80/20 all have comparable odds.
 *
 * Previously we weighted 50/50 spots 14× harder, which caused the lineup
 * to feel monotone ("everything is always mixed"). Flat sampling exposes
 * the true shape of the range instead.
 */
function pickCombo(chart: PreflopStrategyJson, rng: () => number): ComboKey {
  const scored: Array<{ combo: ComboKey; weight: number }> = [];
  for (const c of allCombos()) {
    if (UNIVERSAL_RAISES.has(c)) continue;
    const r = chart[c]?.raise ?? 0;
    // Skip universal-fold combos: raise=0 hands are free-decision noise.
    if (r === 0) continue;
    // Also skip near-100% combos that aren't universal but are still trivial
    // at this position (e.g. AQs UTG is 100% — nothing to learn).
    if (r >= 0.97) continue;
    // Flat weight with a tiny mixed-ness nudge so truly fresh 50/50 spots
    // don't vanish among the many 70/30 ones — 1.3× vs 1.0×.
    const m = mixedness(r);
    scored.push({ combo: c, weight: 1 + m * 0.3 });
  }
  if (scored.length === 0) {
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

/**
 * Grade the user's answer against the GTO mix:
 *   • True 50/50 band (|raise − 0.5| ≤ 0.05) → either action is "acceptable"
 *   • Otherwise → picking the higher-frequency action = "sharp",
 *     picking the lower-frequency action = "wrong"
 *
 * Previously anything from 0.25–0.75 collapsed to "acceptable", which made
 * a clear 70/30 lean feel like a coin flip and produced an endless stream
 * of Playable verdicts.
 */
export function gradeAnswer(spot: TrainingSpot, answer: 'raise' | 'fold'): AnswerGrade {
  const r = spot.gtoRaise;
  if (Math.abs(r - 0.5) <= 0.05) return 'acceptable';
  const dominant: 'raise' | 'fold' = r > 0.5 ? 'raise' : 'fold';
  return answer === dominant ? 'sharp' : 'wrong';
}

// Re-export so consumers don't need to import RANKS from poker-core separately.
export { RANKS };
