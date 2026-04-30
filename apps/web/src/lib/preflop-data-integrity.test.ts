import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Regression test for preflop chart data integrity.
 *
 * History: the MTT defense charts shipped with raise frequencies
 * stacked on top of an already-summed call/fold pair, producing
 * combos like `97s: { call: 1, raise: 0.0609, fold: 0 }` (sum 1.06).
 * The result sheet rendered "콜 100% · 레이즈 6.1%" which is
 * mathematically nonsense and confused users. Every combo's mix
 * must sum to 1 (within rounding tolerance).
 */

const DATA_DIR = join(process.cwd(), 'public', 'data', 'preflop');

// Schema-incompatible files — the qb_decisions file uses size-bucketed
// schemas (different action shape per node), and the manifest is just
// an index. Skip both.
const SKIP = new Set(['manifest.json', '6max_100bb_qb_decisions.json']);

interface MaybeMix {
  call?: unknown;
  raise?: unknown;
  fold?: unknown;
}

function isThreeWayMix(v: unknown): v is { call: number; raise: number; fold: number } {
  if (!v || typeof v !== 'object') return false;
  const m = v as MaybeMix;
  return typeof m.call === 'number' && typeof m.raise === 'number' && typeof m.fold === 'number';
}

describe('preflop chart sums', () => {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.json') && !SKIP.has(f));

  for (const file of files) {
    it(`every combo in ${file} sums to 1`, () => {
      const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf-8')) as Record<
        string,
        unknown
      >;
      const broken: string[] = [];
      for (const [combo, mix] of Object.entries(data)) {
        if (!isThreeWayMix(mix)) continue; // tolerates mixed schemas
        const sum = mix.call + mix.raise + mix.fold;
        if (Math.abs(sum - 1) > 0.005) {
          broken.push(`${combo}=${JSON.stringify(mix)} (sum ${sum.toFixed(3)})`);
        }
      }
      expect(broken, `${file} has malformed mixes`).toEqual([]);
    });
  }
});
