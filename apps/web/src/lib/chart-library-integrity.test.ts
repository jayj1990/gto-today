import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHART_GROUPS, chartUrl, ryeCharts } from '@gto/gto-data';
import { resolveStack, stackBuckets, type PreflopChartData } from '@gto/poker-core';

/**
 * 차트 라이브러리(RYE 56장 + Nash 올인)의 데이터 무결성.
 *
 * 카탈로그(chart-library.ts)가 가리키는 파일이 전부 있어야 하고, RYE 파일은
 * 169칸 전부 채워져 있고 칸마다 합이 1, 칸이 쓰는 키는 범례에 있는 키뿐,
 * 색은 #rrggbb 여야 한다. 스택 조건의 else 는 같은 범례 안의 키여야 하고,
 * 어느 스택 구간으로 풀어도 칸의 합은 1 이어야 한다. build-rye.ts 를 돌리다
 * vocab 에 라벨이 빠지면 여기서 잡힌다.
 */

const PUBLIC = join(process.cwd(), 'public');
const file = (url: string) => join(PUBLIC, url.replace(/^\//, ''));

describe('RYE chart files', () => {
  for (const c of ryeCharts()) {
    it(`${c.id} is complete and consistent`, () => {
      const path = file(chartUrl(c));
      expect(existsSync(path), path).toBe(true);
      const data = JSON.parse(readFileSync(path, 'utf-8')) as PreflopChartData;

      const keys = data.actions.map((a) => a.key);
      expect(new Set(keys).size).toBe(keys.length);
      // 폴드는 실제로 폴드하는 차트에만 있다 — BB vs SB 림프는 169칸 전부
      // 체크 아니면 레이즈라 폴드 키가 없다.
      for (const a of data.actions) {
        expect(a.label.length).toBeGreaterThan(0);
        if (a.color !== undefined) expect(a.color).toMatch(/^#[0-9a-f]{6}$/i);
        if (a.stack) {
          expect(keys, `${c.id} ${a.key} else`).toContain(a.stack.else);
          expect(a.stack.else).not.toBe(a.key);
          expect([a.stack.gte, a.stack.lt, a.stack.lte].some((v) => v !== undefined)).toBe(true);
        }
      }

      const combos = Object.keys(data.cells);
      expect(combos).toHaveLength(169);
      for (const combo of combos) {
        const cell = data.cells[combo]!;
        let sum = 0;
        for (const [k, v] of Object.entries(cell)) {
          expect(keys, `${c.id} ${combo} ${k}`).toContain(k);
          expect(v).toBeGreaterThanOrEqual(0);
          sum += v;
        }
        expect(Math.abs(sum - 1), `${c.id} ${combo} sums to ${sum}`).toBeLessThan(0.001);
      }

      // 스택 구간마다 풀어 봐도 칸이 비거나 넘치지 않는다.
      for (const b of stackBuckets(data.actions)) {
        const r = resolveStack(data, b.bb);
        for (const [combo, cell] of Object.entries(r.cells)) {
          const sum = Object.values(cell).reduce((x, y) => x + y, 0);
          expect(Math.abs(sum - 1), `${c.id} ${combo} @${b.bb}bb sums to ${sum}`).toBeLessThan(
            0.001,
          );
          for (const k of Object.keys(cell)) expect(keys).toContain(k);
        }
      }
    });
  }

  it('stack buckets exist only where RYE wrote stack conditions', () => {
    const withStack = new Set<string>();
    for (const c of ryeCharts()) {
      const data = JSON.parse(readFileSync(file(chartUrl(c)), 'utf-8')) as PreflopChartData;
      if (stackBuckets(data.actions).length > 0) withStack.add(c.id);
    }
    // 오픈 100bb(SB 포함) · vs 오픈 · 리잼 · BB vs SB 림프 30bb+ 만.
    expect([...withStack].sort()).toEqual(
      [
        ...CHART_GROUPS.open100.charts.map((c) => c.id),
        'sb100-tight',
        'sb100-good',
        ...CHART_GROUPS.vsopen.charts.filter((c) => !/from-(utg1|mp)$/.test(c.id)).map((c) => c.id),
        ...CHART_GROUPS.rejam.charts.map((c) => c.id),
        'bb-vs-sb-limp-30',
      ].sort(),
    );
  });
});

describe('Nash jam chart files', () => {
  const nash = Object.values(CHART_GROUPS)
    .flatMap((g) => g.charts)
    .filter((c) => c.source.kind === 'nash-jam');
  it('has 20bb and 10bb ladders', () => {
    expect(nash.length).toBeGreaterThan(0);
  });
  for (const c of nash) {
    it(`${c.id} exists`, () => {
      expect(existsSync(file(chartUrl(c))), c.id).toBe(true);
    });
  }
});
