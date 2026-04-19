import { describe, expect, it } from 'vitest';
import { calculateEquity, seededRng } from './equity';
import type { CardCode } from './types';

const c = (s: string) => s as CardCode;

describe('calculateEquity', () => {
  it('AA vs 22 preflop ≈ 82%', () => {
    const result = calculateEquity({
      hero: [c('As'), c('Ah')],
      villainCombos: [[c('2c'), c('2d')]],
      board: [],
      iterations: 2500,
      rng: seededRng(1234),
    });
    // True analytic answer: ~81.94%. 2500 iter gives tight CI.
    expect(result.heroEquity).toBeGreaterThan(0.75);
    expect(result.heroEquity).toBeLessThan(0.88);
  });

  it('AKs vs QQ preflop ≈ 46%', () => {
    const result = calculateEquity({
      hero: [c('As'), c('Ks')],
      villainCombos: [[c('Qd'), c('Qh')]],
      board: [],
      iterations: 2500,
      rng: seededRng(99),
    });
    // Classic coin flip with slight QQ lead — ~46%.
    expect(result.heroEquity).toBeGreaterThan(0.4);
    expect(result.heroEquity).toBeLessThan(0.52);
  });

  it('flopped set has ~90%+ equity vs overpair', () => {
    // Hero: 77 on 7-2-3 rainbow vs KK
    const result = calculateEquity({
      hero: [c('7s'), c('7h')],
      villainCombos: [[c('Ks'), c('Kd')]],
      board: [c('7d'), c('2c'), c('3h')],
      iterations: 2000,
      rng: seededRng(42),
    });
    expect(result.heroEquity).toBeGreaterThan(0.88);
  });

  it('dead hand (blockers on board) returns 0 or near-zero wins', () => {
    // Hero: 2s 2h, board has 2d 2c → no villain combo can be 22
    const result = calculateEquity({
      hero: [c('2s'), c('2h')],
      villainCombos: [[c('As'), c('Ks')]],
      board: [c('2d'), c('2c'), c('Ah')],
      iterations: 500,
      rng: seededRng(7),
    });
    // Hero has quads. Villain cannot win short of a running royal (impossible here).
    expect(result.heroEquity).toBeGreaterThan(0.99);
  });

  it('throws when villainCombos is empty', () => {
    expect(() =>
      calculateEquity({
        hero: [c('As'), c('Ks')],
        villainCombos: [],
        board: [],
      }),
    ).toThrow();
  });
});

describe('seededRng', () => {
  it('is deterministic', () => {
    const a = seededRng(42);
    const b = seededRng(42);
    for (let i = 0; i < 10; i++) {
      expect(a()).toBe(b());
    }
  });

  it('returns values in [0, 1)', () => {
    const rng = seededRng(1);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
