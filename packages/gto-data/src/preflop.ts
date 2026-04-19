import { POSITION_FALLBACK, type Position, type TableFormat, type ComboKey } from '@gto/poker-core';

/**
 * JSON file shape emitted by scripts/build-preflop.ts
 * Each 169 combo maps to { raise, fold } frequencies.
 */
export type PreflopStrategyJson = Record<string, { raise: number; fold: number }>;

export interface PreflopMixedStrategy {
  readonly combo: ComboKey;
  readonly raise: number;
  readonly fold: number;
  /** True when data came from a fallback (e.g. 10-max UTG2 → 9-max UTG1). */
  readonly approximated: boolean;
  /** Action recommendation from the mix (> 0.5 raise → "raise"). */
  readonly primary: 'raise' | 'fold' | 'mixed';
}

export interface PreflopQuery {
  readonly combo: ComboKey;
  readonly position: Position;
  readonly format?: TableFormat;
  readonly stackBB?: number;
  /** Scenario defaults to 'rfi' (raise first in — action folds to hero). */
  readonly scenario?: 'rfi';
}

type Loader = (key: string) => Promise<PreflopStrategyJson | null>;

const cache = new Map<string, PreflopStrategyJson>();
const pending = new Map<string, Promise<PreflopStrategyJson | null>>();

/**
 * The base URL under which preflop JSON files live.
 * Override in Node / tests. Defaults to `/data/preflop` in the browser.
 */
let basePath = '/data/preflop';

export function setPreflopBasePath(path: string): void {
  basePath = path;
}

/** Replace the default fetch-based loader for tests / SSR. */
let loader: Loader = defaultBrowserLoader;
export function setPreflopLoader(fn: Loader): void {
  loader = fn;
}

async function defaultBrowserLoader(key: string): Promise<PreflopStrategyJson | null> {
  try {
    const res = await fetch(`${basePath}/${key}.json`, { cache: 'force-cache' });
    if (!res.ok) return null;
    return (await res.json()) as PreflopStrategyJson;
  } catch {
    return null;
  }
}

async function loadStrategyFile(key: string): Promise<PreflopStrategyJson | null> {
  const cached = cache.get(key);
  if (cached) return cached;
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

function stackBucketFor(stackBB: number): '100bb' {
  // Phase 3 only ships 100bb. 50bb / 200bb buckets come later.
  // The bucket is fixed so `stackBB` is advisory for now.
  void stackBB;
  return '100bb';
}

function normalizeKey(format: TableFormat, stack: '100bb', scenario: string, pos: Position): string {
  return `${format}_${stack}_${scenario}_${pos}`;
}

/**
 * Look up the GTO-adjacent strategy for a hero combo at a given position.
 *
 * 10/11-max positions that don't have native data (e.g. UTG2, UTG3) are
 * resolved via `POSITION_FALLBACK` — the caller learns via `approximated`.
 */
export async function getPreflopStrategy(query: PreflopQuery): Promise<PreflopMixedStrategy | null> {
  const scenario = query.scenario ?? 'rfi';
  const stack = stackBucketFor(query.stackBB ?? 100);
  const format = query.format ?? '6max';
  const tableFormat: TableFormat = format === '10max' || format === '11max' ? '9max' : format;

  // Resolve the actual position we have data for.
  let resolvedPos = query.position;
  let approximated = false;
  const fallback = POSITION_FALLBACK[resolvedPos];
  if (tableFormat !== format || fallback) {
    if (fallback) {
      resolvedPos = fallback;
      approximated = true;
    } else if (tableFormat !== format) {
      approximated = true;
    }
  }

  const key = normalizeKey(tableFormat, stack, scenario, resolvedPos);
  const data = await loadStrategyFile(key);
  if (!data) return null;

  const entry = data[query.combo];
  if (!entry) {
    return {
      combo: query.combo,
      raise: 0,
      fold: 1,
      approximated,
      primary: 'fold',
    };
  }

  return {
    combo: query.combo,
    raise: entry.raise,
    fold: entry.fold,
    approximated,
    primary: entry.raise >= 0.75 ? 'raise' : entry.raise <= 0.25 ? 'fold' : 'mixed',
  };
}

/** Returns the whole chart as a map, used by the range-grid visualization. */
export async function getPreflopChart(
  format: TableFormat,
  position: Position,
  opts: { stackBB?: number; scenario?: 'rfi' } = {},
): Promise<PreflopStrategyJson | null> {
  const tableFormat: TableFormat =
    format === '10max' || format === '11max' ? '9max' : format;
  const fallback = POSITION_FALLBACK[position];
  const resolvedPos = fallback ?? position;
  const scenario = opts.scenario ?? 'rfi';
  const stack = stackBucketFor(opts.stackBB ?? 100);
  const key = normalizeKey(tableFormat, stack, scenario, resolvedPos);
  return loadStrategyFile(key);
}

export function clearPreflopCache(): void {
  cache.clear();
  pending.clear();
}
