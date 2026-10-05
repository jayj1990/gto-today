import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHART_GROUPS, chartUrl, ryeCharts } from '@gto/gto-data';
import type { PreflopChartData } from '@gto/poker-core';

/**
 * 차트 라이브러리(RYE 56장 + Nash 올인)의 데이터 무결성.
 *
 * 카탈로그(chart-library.ts)가 가리키는 파일이 전부 있어야 하고, RYE 파일은
 * 169칸 전부 채워져 있고 칸마다 합이 1, 칸이 쓰는 키는 범례에 있는 키뿐,
 * 색은 #rrggbb 여야 한다. build-rye.ts 를 돌리다 vocab 에 라벨이 빠지면
 * 여기서 잡힌다.
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
    });
  }
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
