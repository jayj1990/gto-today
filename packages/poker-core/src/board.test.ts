import { describe, expect, it } from 'vitest';
import { boardDistance, canonicalizeFlop, type FlopCards } from './board';
import type { CardCode } from './types';

const flop = (a: string, b: string, c: string): FlopCards =>
  [a, b, c] as unknown as readonly [CardCode, CardCode, CardCode];

describe('canonicalizeFlop', () => {
  it('sorts ranks high to low', () => {
    const c = canonicalizeFlop(flop('2d', 'Ah', '7s'));
    expect(c.ranks).toEqual(['A', '7', '2']);
  });

  it('detects rainbow (3 suits)', () => {
    expect(canonicalizeFlop(flop('Ah', '7s', '2d')).pattern).toBe('r');
  });

  it('detects two-tone (2 suits)', () => {
    expect(canonicalizeFlop(flop('As', 'Ks', '7h')).pattern).toBe('tt');
  });

  it('detects monotone (1 suit)', () => {
    expect(canonicalizeFlop(flop('9h', '7h', '3h')).pattern).toBe('mono');
  });

  it('produces iso-equivalent key for suit-swapped boards', () => {
    const a = canonicalizeFlop(flop('Ah', '7s', '2d'));
    const b = canonicalizeFlop(flop('As', '7d', '2c'));
    expect(a.key).toBe(b.key);
    expect(a.key).toBe('A72r');
  });

  it('distinguishes paired boards by ranks', () => {
    expect(canonicalizeFlop(flop('Kh', 'Kd', '2s')).key).toBe('KK2r');
    expect(canonicalizeFlop(flop('Ah', '2s', 'Ks')).key).not.toBe('KK2r');
  });

  it('emits deterministic key for monotone', () => {
    expect(canonicalizeFlop(flop('Qs', '8s', '4s')).key).toBe('Q84mono');
  });
});

describe('boardDistance', () => {
  const A72r = canonicalizeFlop(flop('Ah', '7s', '2d'));
  const A72tt = canonicalizeFlop(flop('Ah', '7h', '2d'));
  const K72r = canonicalizeFlop(flop('Kh', '7s', '2d'));
  const T98r = canonicalizeFlop(flop('Th', '9s', '8d'));

  it('returns 0 for identical canonical forms', () => {
    expect(boardDistance(A72r, A72r)).toBe(0);
  });

  it('penalizes pattern mismatch by 1', () => {
    expect(boardDistance(A72r, A72tt)).toBe(1);
  });

  it('counts rank differences', () => {
    expect(boardDistance(A72r, K72r)).toBe(1); // one rank (A vs K) differs
    expect(boardDistance(A72r, T98r)).toBe(3); // no overlap
  });
});
