import { describe, expect, it } from 'vitest';
import type { LifetimeAnswer } from './challenge-store';
import { computeAchievements } from './achievements';

/**
 * Achievement evaluator regression battery. The badges drive a
 * gamification ribbon on /stats — getting an unlock wrong (e.g.
 * showing "1000 hands" earned at 999) breaks user trust. Pin down
 * thresholds, partial-progress math, and the perfect-day rule.
 */

function ans(over: Partial<LifetimeAnswer> = {}): LifetimeAnswer {
  return {
    spotId: 's',
    kind: 'preflop',
    grade: 'sharp',
    dateKey: '2026-04-30',
    at: Date.now(),
    ...over,
  };
}

function fill(count: number, over: Partial<LifetimeAnswer> = {}): LifetimeAnswer[] {
  return Array.from({ length: count }, (_, i) => ans({ spotId: `s-${i}`, ...over }));
}

describe('computeAchievements — volume tiers', () => {
  it('zero hands: every volume tier locked, progress 0', () => {
    const list = computeAchievements({ lifetimeAnswers: [], bestStreak: 0 });
    const volume = list.filter((a) => a.category === 'volume');
    expect(volume).toHaveLength(4);
    for (const a of volume) {
      expect(a.unlocked).toBe(false);
      expect(a.progress).toBe(0);
    }
  });

  it('1 hand: only "first-hand" unlocks', () => {
    const list = computeAchievements({ lifetimeAnswers: fill(1), bestStreak: 0 });
    const first = list.find((a) => a.id === 'first-hand');
    const fifty = list.find((a) => a.id === 'fifty-hands');
    expect(first?.unlocked).toBe(true);
    expect(first?.progress).toBe(1);
    expect(fifty?.unlocked).toBe(false);
    expect(fifty?.progress).toBeCloseTo(1 / 50, 5);
  });

  it('exactly threshold counts as unlocked (50 hands)', () => {
    const list = computeAchievements({ lifetimeAnswers: fill(50), bestStreak: 0 });
    const fifty = list.find((a) => a.id === 'fifty-hands');
    expect(fifty?.unlocked).toBe(true);
    expect(fifty?.progress).toBe(1);
    const twoHundred = list.find((a) => a.id === 'two-hundred-hands');
    expect(twoHundred?.unlocked).toBe(false);
    expect(twoHundred?.progress).toBeCloseTo(0.25, 5);
  });

  it('999 hands: 1000-tier still locked, 200-tier unlocked', () => {
    // Off-by-one regression — the prior version compared `>` not `>=`
    // and "999/1000" silently flagged as unlocked.
    const list = computeAchievements({ lifetimeAnswers: fill(999), bestStreak: 0 });
    const thousand = list.find((a) => a.id === 'thousand-hands');
    expect(thousand?.unlocked).toBe(false);
    expect(thousand?.progress).toBeCloseTo(0.999, 3);
  });

  it('progressLabel uses Korean unit suffix', () => {
    const list = computeAchievements({ lifetimeAnswers: fill(47), bestStreak: 0 });
    const fifty = list.find((a) => a.id === 'fifty-hands');
    expect(fifty?.progressLabel).toBe('47 / 50 핸드');
  });
});

describe('computeAchievements — streak tiers', () => {
  it('streak=2: nothing unlocked, "3일 연속" at 67%', () => {
    const list = computeAchievements({ lifetimeAnswers: [], bestStreak: 2 });
    const s3 = list.find((a) => a.id === 'streak-3');
    expect(s3?.unlocked).toBe(false);
    expect(s3?.progress).toBeCloseTo(2 / 3, 5);
    expect(s3?.progressLabel).toBe('2 / 3일');
  });

  it('streak=30: every streak tier unlocked', () => {
    const list = computeAchievements({ lifetimeAnswers: [], bestStreak: 30 });
    expect(list.find((a) => a.id === 'streak-3')?.unlocked).toBe(true);
    expect(list.find((a) => a.id === 'streak-7')?.unlocked).toBe(true);
    expect(list.find((a) => a.id === 'streak-30')?.unlocked).toBe(true);
  });

  it('streak progress capped at 1 even if best > top tier', () => {
    const list = computeAchievements({ lifetimeAnswers: [], bestStreak: 365 });
    expect(list.find((a) => a.id === 'streak-30')?.progress).toBe(1);
  });
});

describe('computeAchievements — perfect day', () => {
  it('9 sharps in a day does NOT unlock perfect-day', () => {
    const list = computeAchievements({
      lifetimeAnswers: fill(9, { dateKey: '2026-04-30', grade: 'sharp' }),
      bestStreak: 0,
    });
    const perfect = list.find((a) => a.id === 'perfect-day');
    expect(perfect?.unlocked).toBe(false);
    expect(perfect?.progressLabel).toBe('아직 없음');
  });

  it('10 sharps in a single day unlocks perfect-day', () => {
    const list = computeAchievements({
      lifetimeAnswers: fill(10, { dateKey: '2026-04-30', grade: 'sharp' }),
      bestStreak: 0,
    });
    const perfect = list.find((a) => a.id === 'perfect-day');
    expect(perfect?.unlocked).toBe(true);
    expect(perfect?.progress).toBe(1);
    expect(perfect?.progressLabel).toBe('1회 달성');
  });

  it('10 hands but one wrong — perfect-day stays locked', () => {
    // Real GTO Wizard / GTO Today users can score 10/10 with mixed
    // grades; but "perfect" must mean ZERO non-sharp entries on that
    // day. One acceptable counts as a miss.
    const day = '2026-04-30';
    const answers: LifetimeAnswer[] = [
      ...fill(9, { dateKey: day, grade: 'sharp' }),
      ans({ spotId: 'wrong-one', dateKey: day, grade: 'acceptable' }),
    ];
    const list = computeAchievements({ lifetimeAnswers: answers, bestStreak: 0 });
    expect(list.find((a) => a.id === 'perfect-day')?.unlocked).toBe(false);
  });

  it('counts multiple perfect days separately', () => {
    const answers = [
      ...fill(10, { dateKey: '2026-04-28', grade: 'sharp' }).map((a, i) => ({
        ...a,
        spotId: `a-${i}`,
      })),
      ...fill(10, { dateKey: '2026-04-29', grade: 'sharp' }).map((a, i) => ({
        ...a,
        spotId: `b-${i}`,
      })),
      ...fill(10, { dateKey: '2026-04-30', grade: 'sharp' }).map((a, i) => ({
        ...a,
        spotId: `c-${i}`,
      })),
    ];
    const list = computeAchievements({ lifetimeAnswers: answers, bestStreak: 0 });
    const perfect = list.find((a) => a.id === 'perfect-day');
    expect(perfect?.unlocked).toBe(true);
    expect(perfect?.progressLabel).toBe('3회 달성');
  });
});

describe('computeAchievements — output shape', () => {
  it('returns 8 entries (4 volume + 3 streak + 1 perfect)', () => {
    const list = computeAchievements({ lifetimeAnswers: [], bestStreak: 0 });
    expect(list).toHaveLength(8);
  });

  it('every entry has stable id + non-empty title/description', () => {
    const list = computeAchievements({ lifetimeAnswers: [], bestStreak: 0 });
    const ids = new Set<string>();
    for (const a of list) {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(ids.has(a.id)).toBe(false);
      ids.add(a.id);
    }
  });
});
