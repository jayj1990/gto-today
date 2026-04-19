import { describe, expect, it } from 'vitest';
import { compareHands, evaluateHand } from './evaluator';
import type { CardCode } from './types';

const c = (s: string) => s as CardCode;

describe('evaluateHand', () => {
  it('detects royal flush', () => {
    const r = evaluateHand([c('As'), c('Ks'), c('Qs'), c('Js'), c('Ts')]);
    expect(r.category).toBe('royal-flush');
  });

  it('detects straight flush', () => {
    const r = evaluateHand([c('9s'), c('8s'), c('7s'), c('6s'), c('5s')]);
    expect(r.category).toBe('straight-flush');
  });

  it('detects four of a kind', () => {
    const r = evaluateHand([c('Ks'), c('Kh'), c('Kd'), c('Kc'), c('2s')]);
    expect(r.category).toBe('four-of-a-kind');
  });

  it('detects full house', () => {
    const r = evaluateHand([c('As'), c('Ah'), c('Ad'), c('2s'), c('2h')]);
    expect(r.category).toBe('full-house');
  });

  it('detects flush', () => {
    const r = evaluateHand([c('As'), c('Ts'), c('8s'), c('5s'), c('2s')]);
    expect(r.category).toBe('flush');
  });

  it('detects straight (wheel)', () => {
    const r = evaluateHand([c('As'), c('2h'), c('3d'), c('4c'), c('5s')]);
    expect(r.category).toBe('straight');
  });

  it('detects three of a kind', () => {
    const r = evaluateHand([c('Qs'), c('Qh'), c('Qd'), c('7s'), c('2c')]);
    expect(r.category).toBe('three-of-a-kind');
  });

  it('detects two pair', () => {
    const r = evaluateHand([c('Ks'), c('Kh'), c('5d'), c('5c'), c('2s')]);
    expect(r.category).toBe('two-pair');
  });

  it('detects pair', () => {
    const r = evaluateHand([c('As'), c('Ah'), c('Kd'), c('7s'), c('2c')]);
    expect(r.category).toBe('pair');
  });

  it('detects high card', () => {
    const r = evaluateHand([c('As'), c('Jh'), c('9d'), c('5c'), c('2s')]);
    expect(r.category).toBe('high-card');
  });

  it('works with 7 cards (hole + board)', () => {
    // Hero holds AA, board completes top set
    const r = evaluateHand([
      c('As'),
      c('Ah'),
      c('Ad'),
      c('Kc'),
      c('7s'),
      c('2h'),
      c('3d'),
    ]);
    expect(r.category).toBe('three-of-a-kind');
  });

  it('throws on invalid length', () => {
    expect(() => evaluateHand([c('As'), c('Ks')])).toThrow();
    expect(() =>
      evaluateHand([
        c('As'),
        c('Ks'),
        c('Qs'),
        c('Js'),
        c('Ts'),
        c('9s'),
        c('8s'),
        c('7s'),
      ]),
    ).toThrow();
  });
});

describe('compareHands', () => {
  it('straight beats trips', () => {
    const board = [c('5s'), c('6h'), c('7d'), c('2c'), c('Jh')];
    const hero = [c('3c'), c('4s'), ...board]; // straight 3-7
    const villain = [c('Js'), c('Jd'), ...board]; // trips jacks
    const winners = compareHands([hero, villain]);
    expect(winners).toEqual([0]);
  });

  it('ties split', () => {
    const board = [c('As'), c('Kh'), c('Qd'), c('Jc'), c('Ts')];
    const hero = [c('2c'), c('3c'), ...board];
    const villain = [c('4d'), c('5h'), ...board];
    const winners = compareHands([hero, villain]);
    expect(winners.length).toBe(2); // both play the board: royal/Broadway
  });
});
