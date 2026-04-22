import type { ComboKey, Position, TableFormat } from '@gto/poker-core';

export interface BbDefenseMix {
  readonly call: number;
  readonly raise: number;
  readonly fold: number;
}

export type BbDefenseStrategyJson = Record<string, BbDefenseMix>;

type Loader = (key: string) => Promise<BbDefenseStrategyJson | null>;

const cache = new Map<string, BbDefenseStrategyJson>();
const pending = new Map<string, Promise<BbDefenseStrategyJson | null>>();

let basePath = '/data/preflop';
export function setBbDefenseBasePath(path: string): void {
  basePath = path;
}

let loader: Loader = defaultLoader;
export function setBbDefenseLoader(fn: Loader): void {
  loader = fn;
}

async function defaultLoader(key: string): Promise<BbDefenseStrategyJson | null> {
  try {
    const res = await fetch(`${basePath}/${key}.json`, { cache: 'force-cache' });
    if (!res.ok) return null;
    return (await res.json()) as BbDefenseStrategyJson;
  } catch {
    return null;
  }
}

async function load(key: string): Promise<BbDefenseStrategyJson | null> {
  const hit = cache.get(key);
  if (hit) return hit;
  const existing = pending.get(key);
  if (existing) return existing;
  const p = loader(key).then((data) => {
    pending.delete(key);
    if (data) cache.set(key, data);
    return data;
  });
  pending.set(key, p);
  return p;
}

/** Positions we currently have BB-defense data for. */
export const SUPPORTED_OPENERS: Position[] = ['UTG', 'CO', 'BTN'];

/**
 * Every defender × opener pairing we ship preflop data for. Used by
 * the daily generator to pick 3bet / defense spots beyond the BB-only
 * slice. Ordered so the most "standard" lines come first; the generator
 * samples uniformly so order doesn't bias output.
 */
export interface DefensePairing {
  readonly defender: Position;
  readonly opener: Position;
}

export const DEFENSE_PAIRINGS: readonly DefensePairing[] = [
  // BB vs every 6max opener
  { defender: 'BB', opener: 'UTG' },
  { defender: 'BB', opener: 'MP' },
  { defender: 'BB', opener: 'CO' },
  { defender: 'BB', opener: 'BTN' },
  { defender: 'BB', opener: 'SB' },
  // SB vs later-position opens (3bet or call out of position)
  { defender: 'SB', opener: 'UTG' },
  { defender: 'SB', opener: 'MP' },
  { defender: 'SB', opener: 'CO' },
  { defender: 'SB', opener: 'BTN' },
  // BTN in-position defense (most-raised 3bet frequency spots)
  { defender: 'BTN', opener: 'UTG' },
  { defender: 'BTN', opener: 'MP' },
  { defender: 'BTN', opener: 'CO' },
  // CO vs early-position opens
  { defender: 'CO', opener: 'UTG' },
  { defender: 'CO', opener: 'MP' },
  // MP squeezing UTG open
  { defender: 'MP', opener: 'UTG' },
];

export interface BbDefenseQuery {
  readonly combo: ComboKey;
  readonly opener: Position;
  readonly format?: TableFormat;
  readonly stackBB?: number;
}

export interface BbDefenseStrategy {
  readonly combo: ComboKey;
  readonly opener: Position;
  readonly call: number;
  readonly raise: number;
  readonly fold: number;
  /** The dominant action when one is clearly preferred. */
  readonly primary: 'call' | 'raise' | 'fold' | 'mixed';
}

function dominantAction(mix: BbDefenseMix): BbDefenseStrategy['primary'] {
  if (mix.fold >= 0.75) return 'fold';
  if (mix.raise >= 0.6 && mix.call <= 0.2) return 'raise';
  if (mix.call >= 0.7 && mix.raise <= 0.15) return 'call';
  return 'mixed';
}

export async function getBbDefenseStrategy(
  query: BbDefenseQuery & { gameType?: 'cash' | 'mtt' },
): Promise<BbDefenseStrategy | null> {
  const format = query.format ?? '6max';
  const prefix = query.gameType === 'mtt' ? 'mtt_' : '';
  const key = `${prefix}${format}_100bb_bb_vs_${query.opener}`;
  let chart = await load(key);
  if (!chart && query.gameType === 'mtt') {
    chart = await load(`${format}_100bb_bb_vs_${query.opener}`);
  }
  if (!chart) return null;
  const entry = chart[query.combo];
  if (!entry) {
    return {
      combo: query.combo,
      opener: query.opener,
      call: 0,
      raise: 0,
      fold: 1,
      primary: 'fold',
    };
  }
  return {
    combo: query.combo,
    opener: query.opener,
    call: entry.call,
    raise: entry.raise,
    fold: entry.fold,
    primary: dominantAction(entry),
  };
}

export async function getBbDefenseChart(
  opener: Position,
  format: TableFormat = '6max',
  gameType: 'cash' | 'mtt' = 'cash',
): Promise<BbDefenseStrategyJson | null> {
  return getDefenseChart('BB', opener, format, gameType);
}

/**
 * Generic defender-vs-opener chart loader. Supersedes `getBbDefenseChart`.
 * Filename convention: `{format}_100bb_{defender_lower}_vs_{opener}.json`.
 * Falls back to the cash variant when MTT isn't shipped for the pair.
 */
export async function getDefenseChart(
  defender: Position,
  opener: Position,
  format: TableFormat = '6max',
  gameType: 'cash' | 'mtt' = 'cash',
): Promise<BbDefenseStrategyJson | null> {
  const prefix = gameType === 'mtt' ? 'mtt_' : '';
  const defLower = defender.toLowerCase();
  const key = `${prefix}${format}_100bb_${defLower}_vs_${opener}`;
  const data = await load(key);
  if (data || gameType !== 'mtt') return data;
  return load(`${format}_100bb_${defLower}_vs_${opener}`);
}

export function clearBbDefenseCache(): void {
  cache.clear();
  pending.clear();
}
