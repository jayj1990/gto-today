'use client';

import { useState } from 'react';
import {
  ComboDetailSheet,
  RangeGrid,
  RangeLegend,
  type ActionSpec,
  type ComboActions,
} from '@gto/ui';

/**
 * /dev/showcase — 액션 어휘 확장 데모.
 *
 * 레이즈를 밸류와 블러프로 가르고, 체크·림프·잼까지 한 격자에 올렸을 때
 * 어떻게 읽히는지 보려고 둔 화면이다. 여기 수치는 렌더링 확인용 샘플이지
 * 솔버 결과가 아니다 — 실제 차트가 붙기 전까지 상품 화면에 쓰지 말 것.
 */

const SB_LIMP_ACTIONS: readonly ActionSpec[] = [
  { key: 'jam', kind: 'jam', label: '올인' },
  { key: 'raise_value', kind: 'raise', intent: 'value', size: '3.5x', label: '레이즈' },
  {
    key: 'raise_bluff',
    kind: 'raise',
    intent: 'bluff',
    size: '3.5x',
    label: '레이즈',
    note: '블러프',
  },
  { key: 'check', kind: 'check', label: '체크 비하인드' },
];

const OPEN_ACTIONS: readonly ActionSpec[] = [
  { key: 'raise_value', kind: 'raise', intent: 'value', size: '2.5x', label: '오픈' },
  {
    key: 'raise_bluff',
    kind: 'raise',
    intent: 'bluff',
    size: '2.5x',
    label: '오픈',
    note: '블러프',
  },
  { key: 'limp', kind: 'limp', label: '림프' },
  { key: 'fold', kind: 'fold', label: '폴드' },
];

const RANKS = 'AKQJT98765432';

function combo(r: number, c: number): string {
  const hi = RANKS[Math.min(r, c)]!;
  const lo = RANKS[Math.max(r, c)]!;
  if (r === c) return `${hi}${hi}`;
  return `${hi}${lo}${c > r ? 's' : 'o'}`;
}

/** 샘플 생성기 — 강한 핸드는 밸류, 변두리 핸드는 블러프 쪽으로 기운다. */
function sampleChart(mode: 'limp' | 'open'): Record<string, ComboActions> {
  const out: Record<string, ComboActions> = {};
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const key = combo(r, c);
      const strength = 1 - (r + c) / 24; // 0..1, 좌상단이 강함
      const suited = c > r;
      const gap = Math.abs(r - c);
      if (mode === 'limp') {
        if (strength > 0.78) out[key] = { raise_value: 1 };
        else if (strength > 0.62) out[key] = { raise_value: 0.65, jam: 0.35 };
        else if (suited && gap <= 3 && strength > 0.3) out[key] = { raise_bluff: 0.5, check: 0.5 };
        else if (strength > 0.45) out[key] = { jam: 0.3, check: 0.7 };
        else out[key] = { check: 1 };
      } else {
        if (strength > 0.72) out[key] = { raise_value: 1 };
        else if (strength > 0.55) out[key] = { raise_value: 0.7, fold: 0.3 };
        else if (suited && gap <= 4 && strength > 0.28) out[key] = { raise_bluff: 0.6, fold: 0.4 };
        else if (gap <= 1 && strength > 0.3)
          out[key] = { raise_bluff: 0.35, limp: 0.25, fold: 0.4 };
        else out[key] = { fold: 1 };
      }
    }
  }
  return out;
}

const CHARTS = {
  limp: { label: 'BB vs SB 림프 · 15-20bb', actions: SB_LIMP_ACTIONS, cells: sampleChart('limp') },
  open: { label: 'BTN 오픈 · 100bb', actions: OPEN_ACTIONS, cells: sampleChart('open') },
} as const;

export function BluffRangeDemo() {
  const [which, setWhich] = useState<keyof typeof CHARTS>('limp');
  const [picked, setPicked] = useState<string | null>(null);
  const chart = CHARTS[which];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CHARTS) as Array<keyof typeof CHARTS>).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setWhich(k)}
            style={{ touchAction: 'manipulation' }}
            className={
              'border-hair select-none rounded-full px-3 py-1.5 font-mono text-[13px] transition-colors active:scale-[0.96] ' +
              (k === which
                ? 'text-noir bg-[color:var(--color-accent)] font-semibold'
                : 'text-fg-muted')
            }
          >
            {CHARTS[k].label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="w-full max-w-[420px] space-y-3">
          <RangeGrid
            actions={chart.actions}
            cells={chart.cells}
            onCellClick={setPicked}
            highlight="AA"
          />
          <RangeLegend actions={chart.actions} cells={chart.cells} />
        </div>
        <div className="max-w-sm space-y-2 text-[13px]">
          <p>
            레이즈는 색(빨강)으로 묶고 밸류와 블러프는 사선 무늬로 가릅니다. 멀리서는 공격 빈도가
            한눈에 남고, 가까이 보면 블러프 비중이 읽힙니다.
          </p>
          <p className="text-fg-muted text-[12px]">
            칸을 누르면 액션별 빈도가 아래 시트로 올라옵니다. 이 수치는 렌더링 확인용 샘플이고, 실제
            차트 데이터가 아닙니다.
          </p>
        </div>
      </div>

      <ComboDetailSheet
        open={picked !== null}
        combo={picked}
        actions={chart.actions}
        cell={picked ? chart.cells[picked] : undefined}
        onClose={() => setPicked(null)}
      />
    </div>
  );
}
