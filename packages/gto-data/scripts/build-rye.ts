#!/usr/bin/env -S node --loader tsx
/**
 * RYE(Raise Your Edge) 차트 → apps/web/public/data/rye/{id}.json.
 *
 * 입력은 data/rye/charts.source.json — 영상 슬라이드에서 추출한 격자 56장.
 * 격자마다 원본 범례(라벨 + RGB)와 169칸의 라벨별 비율이 들어 있다. 여기서
 * 하는 일은 셋뿐이다: 라벨을 우리 어휘(src/rye/vocab.ts)로 바꾸고, 원본 색을
 * ActionSpec.color 로 옮기고, 칸의 합이 1 이 되게 다듬는다. 폴드는 원본
 * 범례에 없어서(빈 칸) 마지막에 붙인다.
 *
 * Run via `pnpm --filter @gto/gto-data build:rye`.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ActionSpec, ComboActions } from '@gto/poker-core';
import { allCombos } from '../src/combos';
import { ryeCharts, type LibraryChart } from '../src/chart-library';
import { RYE_VOCAB } from '../src/rye/vocab';

/**
 * 원본 색을 바꾸는 유일한 예외. RYE 는 폴드가 흰 바탕이라 짙은 남색이
 * 잘 보이지만 우리 격자는 폴드가 파랑(--color-fold #2b5f8f)이라 남색 칸이
 * 폴드와 구분이 안 됐다(리잼 15bb, 4벳 블러프 <50bb). 같은 계열에서 벗어난
 * 보라로 민다.
 */
const COLOR_OVERRIDES: Readonly<Record<string, string>> = {
  '15bb': '#5c3d99',
  '4bet bluff <50bb': '#5b4bb0',
};

interface SourceGrid {
  slide: string;
  title: string;
  name: string;
  palette: { label: string; color: [number, number, number]; src: string }[];
  cells: Record<string, Record<string, number>>;
}

interface ChartFile {
  id: string;
  source: { slide: string; grid: string; title: string };
  actions: ActionSpec[];
  cells: Record<string, ComboActions>;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', 'data', 'rye', 'charts.source.json');
const OUT_DIR = join(__dirname, '..', '..', '..', 'apps', 'web', 'public', 'data', 'rye');

const hex = ([r, g, b]: [number, number, number]) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');

const slug = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** 같은 라벨·조건·의도·사이즈면 격자에서 한 색으로 보여야 하니 키를 합친다. */
const sameSpec = (a: ActionSpec, b: ActionSpec) =>
  a.label === b.label && a.note === b.note && a.intent === b.intent && a.size === b.size;

function convert(chart: LibraryChart, g: SourceGrid): ChartFile {
  const used = new Set<string>();
  for (const cell of Object.values(g.cells)) for (const k of Object.keys(cell)) used.add(k);

  // 원본 범례 순서대로. 안 쓰인 범례 항목은 뺀다(범례가 격자보다 길어진다).
  const actions: ActionSpec[] = [];
  const keyOf = new Map<string, string>();
  for (const p of g.palette) {
    if (!used.has(p.label)) continue;
    const v = RYE_VOCAB[p.label];
    if (!v) throw new Error(`${chart.id}: 어휘에 없는 라벨 "${p.label}"`);
    const spec: ActionSpec = {
      key: slug(p.label),
      kind: v.kind,
      ...(v.intent ? { intent: v.intent } : {}),
      ...(v.size ? { size: v.size } : {}),
      label: v.label,
      ...(v.note ? { note: v.note } : {}),
      color: COLOR_OVERRIDES[p.label] ?? hex(p.color),
    };
    const dup = actions.find((a) => sameSpec(a, spec));
    if (dup) {
      console.warn(`  ${chart.id}: "${p.label}" 을 "${dup.key}" 에 합침`);
      keyOf.set(p.label, dup.key);
      continue;
    }
    actions.push(spec);
    keyOf.set(p.label, spec.key);
  }
  if (used.has('fold')) {
    actions.push({ key: 'fold', kind: 'fold', label: '폴드' });
    keyOf.set('fold', 'fold');
  }
  for (const k of used)
    if (!keyOf.has(k)) throw new Error(`${chart.id}: 범례에 없는 셀 라벨 "${k}"`);

  const cells: Record<string, ComboActions> = {};
  for (const combo of allCombos()) {
    const src = g.cells[combo];
    if (!src) throw new Error(`${chart.id}: ${combo} 칸이 없음`);
    const cell: Record<string, number> = {};
    let total = 0;
    for (const [label, v] of Object.entries(src)) {
      if (v <= 0) continue;
      const key = keyOf.get(label)!;
      cell[key] = (cell[key] ?? 0) + v;
      total += v;
    }
    if (total <= 0) throw new Error(`${chart.id}: ${combo} 빈 칸`);
    // 추출 단계에서 0.05 단위로 반올림했으니 합이 1 에서 벗어나면 가장 큰
    // 항목에 잔차를 얹어 정확히 1 로 만든다.
    const top = Object.keys(cell).reduce((a, b) => (cell[b]! > cell[a]! ? b : a));
    cell[top] = Math.round((cell[top]! + 1 - total) * 1000) / 1000;
    cells[combo] = cell;
  }
  return { id: chart.id, source: { slide: g.slide, grid: g.name, title: g.title }, actions, cells };
}

async function main() {
  const grids = JSON.parse(await readFile(SRC, 'utf8')) as SourceGrid[];
  await mkdir(OUT_DIR, { recursive: true });
  const charts = ryeCharts();
  for (const chart of charts) {
    if (chart.source.kind !== 'rye') continue;
    const { slide, grid } = chart.source;
    const g = grids.find((x) => x.slide === slide && x.name === grid);
    if (!g) throw new Error(`${chart.id}: 소스에 ${slide}/${grid} 격자가 없음`);
    const file = convert(chart, g);
    await writeFile(join(OUT_DIR, `${chart.id}.json`), JSON.stringify(file));
    const played = Object.values(file.cells).filter((c) => (c['fold'] ?? 0) < 1).length;
    console.log(
      `${chart.id.padEnd(24)} ${String(file.actions.length).padStart(2)} actions  ${played}/169`,
    );
  }
  const unused = grids.filter(
    (g) =>
      !charts.some(
        (c) => c.source.kind === 'rye' && c.source.slide === g.slide && c.source.grid === g.name,
      ),
  );
  if (unused.length)
    console.warn(
      '카탈로그에 없는 격자:',
      unused.map((g) => `${g.slide}/${g.name}`),
    );
  console.log(`\n✓ ${charts.length} charts → ${OUT_DIR}`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
