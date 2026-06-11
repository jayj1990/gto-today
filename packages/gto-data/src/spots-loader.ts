import type { PostflopSpot, PotType } from './postflop';
import type { Position } from '@gto/poker-core';

/**
 * Runtime spot loading. The solver dataset (~128K spots, growing) used
 * to be compiled into the client bundle as TS modules; at Phase B scale
 * that produced a 57 MB JS chunk that OOM-crashed mobile Safari on
 * every screen (2026-06-12). Spots now live as static JSON under
 * /data/postflop/ and are fetched one pairing at a time.
 *
 * All functions memoise in module scope — repeat calls per session hit
 * the cache, and the service worker's runtime caching layer makes the
 * underlying fetches offline-friendly.
 */

export interface PairingChunkMeta {
  readonly key: string;
  readonly count: number;
  readonly heroPos: Position;
  readonly villainPos: Position;
  readonly potType: PotType;
  readonly summary: string;
}

interface SpotsManifest {
  readonly version: number;
  readonly chunks: readonly PairingChunkMeta[];
}

const BASE = '/data/postflop';

let manifestPromise: Promise<readonly PairingChunkMeta[]> | null = null;
const chunkCache = new Map<string, Promise<PostflopSpot[]>>();

/** Pairing metadata for every available chunk, ordered by real-game
 *  frequency. Fetched once per session. */
export function fetchPairings(): Promise<readonly PairingChunkMeta[]> {
  manifestPromise ??= fetch(`${BASE}/manifest.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`manifest ${r.status}`);
      return r.json() as Promise<SpotsManifest>;
    })
    .then((m) => sortByFrequency(m.chunks))
    .catch((err) => {
      manifestPromise = null; // allow retry on next call
      throw err;
    });
  return manifestPromise;
}

/** Every spot for one pairing chunk (~8K spots, one ~5 MB JSON fetch,
 *  then cached for the session). */
export function fetchPairingSpots(key: string): Promise<PostflopSpot[]> {
  let p = chunkCache.get(key);
  if (!p) {
    p = fetch(`${BASE}/${key}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`chunk ${key} ${r.status}`);
        return r.json() as Promise<PostflopSpot[]>;
      })
      .catch((err) => {
        chunkCache.delete(key); // allow retry on next call
        throw err;
      });
    chunkCache.set(key, p);
  }
  return p;
}

/** Deterministically pick one pairing for a date-seeded surface (daily
 *  quiz, postflop training). Same date → same pairing on every device.
 *  `gameType: 'mtt'` resolves to the legacy chunk (where MTT spots
 *  live); cash rotates through the solver pairings. */
export async function fetchDailyPairingSpots(
  dateKey: string,
  gameType?: 'cash' | 'mtt',
): Promise<PostflopSpot[]> {
  const pairings = await fetchPairings();
  if (gameType === 'mtt') {
    const legacy = pairings.find((p) => p.key === 'legacy');
    if (legacy) {
      const spots = await fetchPairingSpots(legacy.key);
      const mtt = spots.filter((s) => s.context.potType === 'mtt');
      if (mtt.length > 0) return mtt;
    }
  }
  const cash = pairings.filter((p) => p.key !== 'legacy');
  const pool = cash.length > 0 ? cash : pairings;
  if (pool.length === 0) return [];
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  const picked = pool[h % pool.length]!;
  const spots = await fetchPairingSpots(picked.key);
  return gameType === 'cash' ? spots.filter((s) => s.context.potType !== 'mtt') : spots;
}

/** PAIRING display order — late-position steals first (matches the
 *  frequency rationale in solver-run/all-tiers.sh). */
const PAIRING_ORDER = [
  'full-bb-btn',
  'full-bb-co',
  'full-bb-sb',
  'full-bb-mp',
  'full-bb-utg',
  'full-btn-co',
  'full-btn-mp',
  'full-btn-utg',
  'full3-sb-btn',
  'full3-sb-co',
  'full3-sb-mp',
  'full3-sb-utg',
  'full3-co-mp',
  'full3-co-utg',
  'full3-mp-utg',
  'legacy',
];

function sortByFrequency(chunks: readonly PairingChunkMeta[]): readonly PairingChunkMeta[] {
  const rank = (k: string) => {
    const i = PAIRING_ORDER.indexOf(k);
    return i < 0 ? 99 : i;
  };
  return [...chunks].sort((a, b) => rank(a.key) - rank(b.key));
}
