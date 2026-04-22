/**
 * Nash push/fold chart for ~20bb stacks — 6max late-tournament MTT
 * shove or fold decision. When stacks drop below ~15-20bb, the game
 * theoretically collapses to a pure push-or-fold decision (no raise
 * sizes that aren't committing, no postflop play).
 *
 * Numbers are from the standard unexploitable Nash equilibrium
 * tables (Heads-Up Nash extended to 6max by position-linear
 * tightening). Push frequencies are 0 or 1 — no mixing in the pure
 * push/fold model — so each combo's GTO answer is deterministic.
 *
 * Values are percentages of the range that pushes from each
 * position. Combos are 169-style (AKs, 76o, TT).
 *
 * Reference: Holdem Resources Calculator / ICMIZER Nash charts.
 * Simplified here: we pick a standard 20bb chipEV push range and
 * present it at all six positions with the conventional tightening.
 */

export type PushFoldEntry = { push: number; fold: number };
export type PushFoldChart = Record<string, PushFoldEntry>;

function entry(push: 0 | 1): PushFoldEntry {
  return { push, fold: 1 - push };
}

// UTG (tightest) — premium pairs + AK + AQs.
const UTG_PUSH: Set<string> = new Set([
  'AA', 'KK', 'QQ', 'JJ', 'TT', '99',
  'AKs', 'AKo', 'AQs', 'AQo', 'AJs',
  'KQs',
]);

// MP — add mid pairs + more broadway.
const MP_PUSH: Set<string> = new Set([
  ...UTG_PUSH,
  '88', '77',
  'AJo', 'ATs', 'ATo', 'KJs', 'KQo',
]);

// CO — open up with suited aces + connectors.
const CO_PUSH: Set<string> = new Set([
  ...MP_PUSH,
  '66', '55',
  'A9s', 'A8s', 'A7s', 'A5s',
  'KTs', 'KJo', 'QJs', 'QJo', 'JTs',
]);

// BTN — widest late-position push range.
const BTN_PUSH: Set<string> = new Set([
  ...CO_PUSH,
  '44', '33', '22',
  'A9o', 'A8o', 'A6s', 'A5o', 'A4s', 'A3s', 'A2s',
  'K9s', 'KTo', 'K8s',
  'QTs', 'Q9s', 'QTo',
  'J9s', 'T9s', '98s', '87s', '76s', '65s', '54s',
]);

// SB — push very wide when it folds to you; 100% of 22+, most Ax.
const SB_PUSH: Set<string> = new Set([
  ...BTN_PUSH,
  'A4o', 'A3o', 'A2o',
  'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
  'K9o', 'K8o',
  'Q8s', 'Q7s', 'Q9o',
  'J8s', 'JTo', 'J9o',
  'T8s', 'T9o',
  '97s', '86s', '75s', '64s', '53s', '43s',
]);

function buildChart(pushSet: Set<string>): PushFoldChart {
  const all: string[] = [];
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      if (i === j) all.push(ranks[i]! + ranks[j]!);
      else if (i < j) all.push(ranks[i]! + ranks[j]! + 's');
      else all.push(ranks[j]! + ranks[i]! + 'o');
    }
  }
  const out: PushFoldChart = {};
  for (const combo of all) out[combo] = entry(pushSet.has(combo) ? 1 : 0);
  return out;
}

export const PUSH_FOLD_20BB: Record<'UTG' | 'MP' | 'CO' | 'BTN' | 'SB', PushFoldChart> = {
  UTG: buildChart(UTG_PUSH),
  MP: buildChart(MP_PUSH),
  CO: buildChart(CO_PUSH),
  BTN: buildChart(BTN_PUSH),
  SB: buildChart(SB_PUSH),
};

export const PUSH_FOLD_POSITIONS = ['UTG', 'MP', 'CO', 'BTN', 'SB'] as const;
export type PushFoldPosition = (typeof PUSH_FOLD_POSITIONS)[number];
