import type { Position, TableFormat } from '@gto/poker-core';
import { allCombos } from './combos';
import { classifyAnswer, type TrainingSpot } from './spot-generator';
import { getPreflopChart } from './preflop';
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

export async function generateRandomSpot(opts: RandomSpotOptions = {}): Promise<TrainingSpot | null> {
  const format: TableFormat = opts.format ?? '9max';
  const defaults = format === '6max' ? POSITIONS_6MAX : POSITIONS_9MAX;
  const positions = opts.positions ?? defaults;
  const position = positions[Math.floor(Math.random() * positions.length)]!;
  const chart = await getPreflopChart(format, position);
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
  };
}
