import { describe, expect, it } from 'vitest';
import type { CardCode } from '@gto/poker-core';
import { findSpotsByBoard } from './postflop';
import { POSTFLOP_SEEDS } from './ranges/postflop-seeds';

const flop = (a: string, b: string, c: string) =>
  [a, b, c] as unknown as readonly [CardCode, CardCode, CardCode];

describe('findSpotsByBoard', () => {
  const seedPool = POSTFLOP_SEEDS;

  it('returns exact match on canonical key (suit-iso)', () => {
    const res = findSpotsByBoard(flop('Kh', '7s', '2c'), { pool: seedPool });
    expect(res.match).toBe('exact');
    expect(res.distance).toBe(0);
    expect(res.queryKey).toBe('K72r');
    expect(res.matchKey).toBe('K72r');
    expect(res.spots.length).toBeGreaterThan(0);
  });

  it('matches across different suit assignments (iso)', () => {
    const a = findSpotsByBoard(flop('Kh', '7s', '2c'), { pool: seedPool });
    const b = findSpotsByBoard(flop('Ks', '7c', '2h'), { pool: seedPool });
    expect(b.match).toBe('exact');
    expect(b.matchKey).toBe(a.matchKey);
  });

  it('falls back to nearest neighbor when no exact match', () => {
    const res = findSpotsByBoard(flop('Ah', '8s', '2c'), { pool: seedPool });
    expect(res.match).toBe('nearest');
    expect(res.distance).toBeGreaterThan(0);
    expect(res.distance).toBeLessThanOrEqual(2);
    expect(res.spots.length).toBeGreaterThan(0);
  });

  it('returns match: none when closest is beyond maxDistance', () => {
    const res = findSpotsByBoard(flop('9h', '7h', '3h'), {
      pool: seedPool,
      maxDistance: 0,
    });
    expect(res.match).toBe('none');
    expect(res.spots).toEqual([]);
  });

  it('filters by position', () => {
    const res = findSpotsByBoard(flop('Kh', '7s', '2c'), {
      pool: seedPool,
      position: 'BTN',
    });
    expect(res.match).toBe('exact');
    expect(res.spots.every((s) => s.context.heroPos === 'BTN')).toBe(true);
  });

  it('returns none if position filter eliminates all candidates', () => {
    const res = findSpotsByBoard(flop('Kh', '7s', '2c'), {
      pool: seedPool,
      position: 'UTG',
      maxDistance: 0,
    });
    expect(res.match).toBe('none');
  });

  it('ignores non-flop (turn/river) entries in the pool', () => {
    const res = findSpotsByBoard(flop('9h', '8s', '7s'), { pool: seedPool });
    expect(res.match).toBe('exact');
    expect(res.spots.every((s) => s.board.length === 3)).toBe(true);
  });

  it('exposes canonical keys for debugging', () => {
    const res = findSpotsByBoard(flop('Qs', '8s', '4s'), { pool: seedPool });
    expect(res.queryKey).toBe('Q84mono');
  });
});
