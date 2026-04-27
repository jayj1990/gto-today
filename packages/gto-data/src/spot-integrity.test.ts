import { describe, expect, it } from 'vitest';
import { listPostflopSpots } from './postflop';

/**
 * Data-integrity tests for the shipped postflop spot pool. These run
 * against whatever solver-spots.ts currently bundles, so a bad parser
 * commit (or a regression in gen-next-phase.mjs that puts duplicate
 * cards on a board) fails CI before users ever see "K♠ K♠ T♠" on a
 * quiz table.
 *
 * Caught a real bug in 2026-04-27: 322 paired-flop spots had two of
 * the same card on board because the iso enumerator allowed
 * paired-rank triples (i ≤ j) to share a suit pattern with three-
 * distinct-rank triples (which is fine for non-paired but produces
 * [Ks, Ks, Td] when r0 == r1).
 */
describe('postflop spot pool integrity', () => {
  const spots = listPostflopSpots();

  it('every spot has 2 hero cards and 3+ board cards', () => {
    for (const s of spots) {
      expect(s.hero.length).toBe(2);
      expect(s.board.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('hero cards are never duplicates of each other', () => {
    for (const s of spots) {
      expect(new Set(s.hero).size, `hero dup in ${s.id}`).toBe(s.hero.length);
    }
  });

  it('board cards are never duplicates of each other', () => {
    for (const s of spots) {
      expect(new Set(s.board).size, `board dup in ${s.id}`).toBe(s.board.length);
    }
  });

  it('hero cards never appear on the board', () => {
    for (const s of spots) {
      const board = new Set(s.board);
      for (const c of s.hero) {
        expect(board.has(c), `hero ${c} on board in ${s.id}`).toBe(false);
      }
    }
  });

  it('every card matches the rank+suit format (Xs/Xh/Xd/Xc)', () => {
    const re = /^[2-9TJQKA][shdc]$/;
    for (const s of spots) {
      for (const c of [...s.board, ...s.hero]) {
        expect(re.test(c), `bad card "${c}" in ${s.id}`).toBe(true);
      }
    }
  });
});
