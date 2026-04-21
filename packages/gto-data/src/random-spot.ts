import type { Position, TableFormat } from '@gto/poker-core';
import { allCombos } from './combos';
import { classifyAnswer, type TrainingSpot } from './spot-generator';
import { getPreflopChart } from './preflop';
import { getBbDefenseChart, SUPPORTED_OPENERS } from './bb-defense';
import { listPostflopSpots, type PostflopSpot } from './postflop';
import { SUITS } from '@gto/poker-core';
import type { CardCode, ComboKey } from '@gto/poker-core';

/**
 * Non-deterministic single-spot generator for the /sim (free practice) mode.
 * Unlike generateDailySpots, this uses Math.random — the user is exploring,
 * not following a shared daily lineup.
 */
export interface RandomSpotOptions {
  readonly format?: TableFormat;
  readonly positions?: readonly Position[];
  readonly difficulty?: 'mixed-only' | 'clear-only' | 'any';
  readonly stackBB?: number;
  /** Filter preflop charts + postflop spots to cash- or MTT-tagged
   *  pool. MTT preflop uses the heuristic widening in
   *  mtt_6max_100bb_*.json. Falls back to cash if MTT missing. */
  readonly gameType?: 'cash' | 'mtt';
}

const POSITIONS_9MAX: readonly Position[] = [
  'UTG',
  'UTG1',
  'MP',
  'LJ',
  'HJ',
  'CO',
  'BTN',
  'SB',
];
const POSITIONS_6MAX: readonly Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB'];

function comboCards(combo: ComboKey): readonly [CardCode, CardCode] {
  const r1 = combo[0];
  const r2 = combo[1];
  const suffix = combo.length === 3 ? combo[2] : undefined;
  if (!r1 || !r2) throw new Error(`Invalid combo: ${combo}`);
  if (!suffix) {
    const suits = [...SUITS];
    const s1 = suits.splice(Math.floor(Math.random() * suits.length), 1)[0]!;
    const s2 = suits[Math.floor(Math.random() * suits.length)]!;
    return [`${r1}${s1}` as CardCode, `${r2}${s2}` as CardCode];
  }
  if (suffix === 's') {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)]!;
    return [`${r1}${suit}` as CardCode, `${r2}${suit}` as CardCode];
  }
  const s1 = SUITS[Math.floor(Math.random() * SUITS.length)]!;
  const others = SUITS.filter((s) => s !== s1);
  const s2 = others[Math.floor(Math.random() * others.length)]!;
  return [`${r1}${s1}` as CardCode, `${r2}${s2}` as CardCode];
}

const OPENER_SIZE: Record<string, number> = {
  UTG: 2.5, UTG1: 2.5, UTG2: 2.5, UTG3: 2.5,
  MP: 2.5, LJ: 2.5, HJ: 2.5, CO: 2.5, BTN: 2.5,
  SB: 3, BB: 0,
};

function classifyDefense(mix: { call: number; raise: number; fold: number }): TrainingSpot['correctAnswer'] {
  const max = Math.max(mix.call, mix.raise, mix.fold);
  const ties = [mix.call, mix.raise, mix.fold].filter((v) => Math.abs(v - max) <= 0.05).length;
  if (ties > 1) return 'mixed';
  if (max === mix.raise) return 'raise';
  if (max === mix.call) return 'call';
  return 'fold';
}

function comboCardsRand(combo: ComboKey): readonly [CardCode, CardCode] {
  return comboCards(combo);
}

export async function generateRandomSpot(opts: RandomSpotOptions = {}): Promise<TrainingSpot | null> {
  const format: TableFormat = opts.format ?? '6max';
  const defaults = format === '6max' ? POSITIONS_6MAX : POSITIONS_9MAX;
  const positions = opts.positions ?? defaults;

  // 40% chance of BB-vs-open scenario so the user sees call/3bet options.
  const wantBbDefense = Math.random() < 0.4;
  if (wantBbDefense) {
    const opener = SUPPORTED_OPENERS[Math.floor(Math.random() * SUPPORTED_OPENERS.length)]!;
    const bbChart = await getBbDefenseChart(opener, format, opts.gameType ?? 'cash');
    if (bbChart) {
      const pool = allCombos().filter((c) => (bbChart[c]?.fold ?? 1) < 0.97);
      if (pool.length > 0) {
        const combo = pool[Math.floor(Math.random() * pool.length)]!;
        const entry = bbChart[combo] ?? { call: 0, raise: 0, fold: 1 };
        const hero = comboCardsRand(combo);
        return {
          id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          combo,
          hero,
          position: 'BB',
          format,
          stackBB: opts.stackBB ?? 100,
          scenario: 'vs_open',
          opener,
          openSize: OPENER_SIZE[opener] ?? 2.5,
          gtoRaise: entry.raise,
          gtoFold: entry.fold,
          gtoCall: entry.call,
          correctAnswer: classifyDefense(entry),
          availableActions: ['fold', 'call', 'raise'],
        };
      }
    }
  }

  // RFI fallback
  const position = positions[Math.floor(Math.random() * positions.length)]!;
  const chart = await getPreflopChart(format, position, { gameType: opts.gameType ?? 'cash' });
  if (!chart) return null;

  const combos = allCombos();
  const buckets = { raise: [] as ComboKey[], fold: [] as ComboKey[], mixed: [] as ComboKey[] };
  for (const c of combos) {
    const raise = chart[c]?.raise ?? 0;
    buckets[classifyAnswer(raise)].push(c);
  }

  let pool: ComboKey[];
  if (opts.difficulty === 'mixed-only') {
    pool = buckets.mixed;
  } else if (opts.difficulty === 'clear-only') {
    pool = [...buckets.raise, ...buckets.fold];
  } else {
    // "any" default — exclude universal-fold trash (raise=0); those teach nothing
    // and would just dilute the session with rubber-stamp decisions.
    pool = combos.filter((c) => (chart[c]?.raise ?? 0) > 0);
    if (pool.length === 0) pool = combos;
  }
  if (pool.length === 0) pool = combos;

  const combo = pool[Math.floor(Math.random() * pool.length)]!;
  const entry = chart[combo] ?? { raise: 0, fold: 1 };
  const hero = comboCards(combo);

  return {
    id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    combo,
    hero,
    position,
    format,
    stackBB: opts.stackBB ?? 100,
    scenario: 'rfi',
    gtoRaise: entry.raise,
    gtoFold: entry.fold,
    correctAnswer: classifyAnswer(entry.raise),
    availableActions: ['fold', 'raise'],
  };
}

/**
 * Random training item — sometimes preflop, sometimes postflop. Mirrors
 * the shape used by generateDailyItems so /sim can consume the same
 * DailyItem union and branch rendering consistently.
 */
export type RandomItem =
  | { readonly kind: 'preflop'; readonly spot: TrainingSpot }
  | { readonly kind: 'postflop'; readonly spot: PostflopSpot };

export async function generateRandomItem(
  opts: RandomSpotOptions = {},
): Promise<RandomItem | null> {
  // 35% chance of a postflop drill. Preflop still dominates because our
  // postflop pool is only 5 seeds and would feel repetitive at 50/50.
  if (Math.random() < 0.35) {
    const pool = listPostflopSpots(opts.gameType ? { gameType: opts.gameType } : {});
    if (pool.length > 0) {
      const spot = pool[Math.floor(Math.random() * pool.length)]!;
      return { kind: 'postflop', spot };
    }
  }
  const pre = await generateRandomSpot(opts);
  return pre ? { kind: 'preflop', spot: pre } : null;
}
