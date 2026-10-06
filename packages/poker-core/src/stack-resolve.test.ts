import { describe, expect, it } from 'vitest';
import type { ActionSpec, PreflopChartData } from './preflop-action';
import {
  bucketContains,
  resolveStack,
  stackBuckets,
  stackRuleHolds,
  stackThresholds,
} from './stack-resolve';

// RYE 오픈 차트의 축소판 — 조건이 붙은 계획들과 그 else.
const OPEN: readonly ActionSpec[] = [
  { key: 'fold-vs-3bet', kind: 'raise', label: '오픈 · 3벳엔 폴드' },
  { key: 'call-vs-3bet', kind: 'raise', label: '오픈 · 3벳엔 콜' },
  {
    key: 'call-3bet-50bb',
    kind: 'raise',
    label: '오픈 · 3벳엔 콜',
    stack: { gte: 50, else: 'fold-vs-3bet' },
  },
  {
    key: '4bet-jam-30bb',
    kind: 'raise',
    label: '오픈 · 4벳 올인',
    stack: { lt: 30, else: 'call-vs-3bet' },
  },
  {
    key: '4bet-bluff-50bb',
    kind: 'raise',
    intent: 'bluff',
    label: '오픈 · 4벳',
    stack: { lt: 50, else: 'fold-vs-3bet' },
  },
  { key: 'fold', kind: 'fold', label: '폴드' },
];

const chart: PreflopChartData = {
  actions: OPEN,
  cells: {
    T9s: { 'call-3bet-50bb': 1 },
    '99': { '4bet-jam-30bb': 1 },
    A5s: { '4bet-bluff-50bb': 0.5, 'call-vs-3bet': 0.5 },
    AJo: { 'fold-vs-3bet': 1 },
    QJo: { 'fold-vs-3bet': 0.5, 'call-vs-3bet': 0.5 },
    '72o': { fold: 1 },
  },
};

describe('stackRuleHolds', () => {
  it('gte / lt / lte 경계', () => {
    expect(stackRuleHolds({ gte: 50, else: 'x' }, 50)).toBe(true);
    expect(stackRuleHolds({ gte: 50, else: 'x' }, 49.9)).toBe(false);
    expect(stackRuleHolds({ lt: 30, else: 'x' }, 30)).toBe(false);
    expect(stackRuleHolds({ lt: 30, else: 'x' }, 29)).toBe(true);
    expect(stackRuleHolds({ lte: 25, else: 'x' }, 25)).toBe(true);
    expect(stackRuleHolds({ lte: 25, else: 'x' }, 25.5)).toBe(false);
  });
});

describe('resolveStack', () => {
  it('조건이 없는 차트는 그대로 돌려준다', () => {
    const plain: PreflopChartData = {
      actions: OPEN.slice(0, 2),
      cells: { AA: { 'call-vs-3bet': 1 } },
    };
    expect(resolveStack(plain, 40)).toBe(plain);
  });

  it('맞는 조건은 그대로, 빗나간 조건은 else 로', () => {
    const deep = resolveStack(chart, 100).cells;
    expect(deep['T9s']).toEqual({ 'call-3bet-50bb': 1 });
    expect(deep['99']).toEqual({ 'call-vs-3bet': 1 });
    const short = resolveStack(chart, 25).cells;
    expect(short['T9s']).toEqual({ 'fold-vs-3bet': 1 });
    expect(short['99']).toEqual({ '4bet-jam-30bb': 1 });
  });

  it('둘로 갈린 칸: 조건이 맞으면 그쪽만, 빗나가면 조건 없는 쪽이 받는다', () => {
    expect(resolveStack(chart, 45).cells['A5s']).toEqual({ '4bet-bluff-50bb': 1 });
    expect(resolveStack(chart, 60).cells['A5s']).toEqual({ 'call-vs-3bet': 1 });
  });

  it('조건 없는 칸은 손대지 않는다(빈도 믹스 보존)', () => {
    const r = resolveStack(chart, 45).cells;
    expect(r['QJo']).toEqual({ 'fold-vs-3bet': 0.5, 'call-vs-3bet': 0.5 });
    expect(r['AJo']).toEqual({ 'fold-vs-3bet': 1 });
    expect(r['72o']).toEqual({ fold: 1 });
  });

  it('else 에 또 조건이 있으면 맞을 때까지 따라간다', () => {
    const actions: readonly ActionSpec[] = [
      { key: 'a', kind: 'raise', label: 'a', stack: { gte: 75, else: 'b' } },
      { key: 'b', kind: 'raise', label: 'b', stack: { gte: 50, else: 'c' } },
      { key: 'c', kind: 'raise', label: 'c' },
    ];
    const d: PreflopChartData = { actions, cells: { AA: { a: 1 } } };
    expect(resolveStack(d, 80).cells['AA']).toEqual({ a: 1 });
    expect(resolveStack(d, 60).cells['AA']).toEqual({ b: 1 });
    expect(resolveStack(d, 40).cells['AA']).toEqual({ c: 1 });
  });

  it('리잼: N bb 는 N 이하에서만 올인, 깊으면 같은 칸의 3벳·콜로', () => {
    const actions: readonly ActionSpec[] = [
      { key: '3bet-call', kind: 'raise', label: '3벳 · 올인엔 콜' },
      { key: '30bb', kind: 'jam', label: '리잼', stack: { lte: 30, else: 'fold' } },
      { key: '15bb', kind: 'jam', label: '리잼', stack: { lte: 15, else: 'fold' } },
      { key: 'fold', kind: 'fold', label: '폴드' },
    ];
    const d: PreflopChartData = {
      actions,
      cells: { AQs: { '30bb': 0.5, '3bet-call': 0.5 }, KTs: { '15bb': 1 } },
    };
    expect(resolveStack(d, 20).cells).toEqual({ AQs: { '30bb': 1 }, KTs: { fold: 1 } });
    expect(resolveStack(d, 12).cells).toEqual({ AQs: { '30bb': 1 }, KTs: { '15bb': 1 } });
    expect(resolveStack(d, 40).cells).toEqual({ AQs: { '3bet-call': 1 }, KTs: { fold: 1 } });
  });

  it('푼 칸의 합은 1 이다', () => {
    for (const bb of [10, 25, 35, 45, 60, 100]) {
      for (const cell of Object.values(resolveStack(chart, bb).cells)) {
        const sum = Object.values(cell).reduce((a, b) => a + b, 0);
        expect(Math.abs(sum - 1)).toBeLessThan(1e-9);
      }
    }
  });
});

describe('stackThresholds / stackBuckets', () => {
  it('경계를 큰 것부터 중복 없이', () => {
    expect(stackThresholds(OPEN)).toEqual([50, 30]);
    expect(stackThresholds(OPEN.slice(0, 2))).toEqual([]);
  });

  it('경계 사이를 구간으로, 대표값은 구간 안에', () => {
    const b = stackBuckets(OPEN);
    expect(b).toEqual([
      { min: 50, bb: 55 },
      { min: 30, max: 50, bb: 40 },
      { max: 30, bb: 25 },
    ]);
    for (const x of b) expect(bucketContains(x, x.bb)).toBe(true);
    expect(stackBuckets(OPEN.slice(0, 2))).toEqual([]);
  });

  it('bucketContains 는 경계를 위 구간에 붙인다', () => {
    const [top, mid, low] = stackBuckets(OPEN);
    expect(bucketContains(top!, 50)).toBe(true);
    expect(bucketContains(mid!, 50)).toBe(false);
    expect(bucketContains(mid!, 30)).toBe(true);
    expect(bucketContains(low!, 30)).toBe(false);
    expect(bucketContains(low!, 1)).toBe(true);
  });
});
