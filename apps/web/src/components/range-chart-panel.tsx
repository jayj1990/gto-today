'use client';

import { useMemo, useState } from 'react';
import type { BoardRange } from '@gto/gto-data';
import { cn, RangeGrid, type ComboMix } from '@gto/ui';

/**
 * Full 169-grid postflop range chart (GTO Wizard style). Backed by the
 * per-board range data (every hand-type in the hero's range with its
 * full sizing mix). Cells colour by the 3-way aggregate (bet/check-call
 * /fold); tapping a cell reveals the exact sizing breakdown.
 *
 * Hands not in the hero's preflop range are simply absent from
 * `range.hands` → they render as empty grid cells, which is correct
 * (those hands never reach this spot).
 */

const ACTION_LABEL: Record<string, string> = {
  x: '체크',
  c: '콜',
  f: '폴드',
  b33: '1/3 벳',
  b50: '1/2 벳',
  b75: '3/4 벳',
  bpot: '팟 벳',
  bov: '오버벳',
  r: '레이즈',
};

/** Collapse the compact action-code mix → RangeGrid's raise/call/fold. */
function toComboMix(hand: Record<string, number>): ComboMix {
  let raise = 0;
  let call = 0;
  let fold = 0;
  for (const [code, pct] of Object.entries(hand)) {
    const v = pct / 100;
    if (code === 'f') fold += v;
    else if (code === 'x' || code === 'c') call += v;
    else raise += v; // bets + raises = aggression
  }
  const total = raise + call + fold || 1;
  return { raise: raise / total, call: call / total, fold: fold / total };
}

export function RangeChartPanel({ range }: { range: BoardRange }) {
  const [picked, setPicked] = useState<string | null>(null);

  const mixes = useMemo(() => {
    const out: Record<string, ComboMix> = {};
    for (const [ht, hand] of Object.entries(range.hands)) out[ht] = toComboMix(hand);
    return out;
  }, [range]);

  const pickedHand = picked ? range.hands[picked] : null;
  const handCount = Object.keys(range.hands).length;

  return (
    <section className="border-hair surface mt-3 rounded-[var(--radius-panel)] p-4">
      <p className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.18em]">
        레인지 {handCount}핸드 · 169 그리드
      </p>
      <p className="text-fg-muted mt-0.5 text-[12px]">
        셀 색은 벳/체크·콜/폴드 비율. 셀을 탭하면 정확한 사이징이 나와요.
      </p>

      <div className="mt-3">
        <RangeGrid mixes={mixes} onCellClick={setPicked} highlight={picked ?? undefined} />
      </div>

      <section className="text-fg-muted mt-2 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px]">
        <LegendDot color="var(--color-raise)" label="벳·레이즈" />
        <LegendDot color="var(--color-call)" label="체크·콜" />
        <LegendDot color="var(--color-fold)" label="폴드" />
      </section>

      {picked && pickedHand ? (
        <div className="border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/8 mt-4 rounded-[var(--radius-button)] border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-[16px] font-bold">{picked}</span>
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.18em] active:scale-[0.96]"
              aria-label="선택 해제"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-1.5">
            {Object.entries(pickedHand)
              .sort((a, b) => b[1] - a[1])
              .map(([code, pct]) => (
                <li
                  key={code}
                  className="grid items-center gap-2"
                  style={{ gridTemplateColumns: '64px minmax(0, 1fr) 48px' }}
                >
                  <span className="text-fg-muted text-right font-mono text-[11px]">
                    {ACTION_LABEL[code] ?? code}
                  </span>
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: actionColor(code) }}
                    />
                  </div>
                  <span className="text-fg text-right font-mono text-[11px] tabular-nums">
                    {pct}%
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ) : (
        <p className="text-fg-muted mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em]">
          셀을 탭해 핸드별 사이징 보기
        </p>
      )}
    </section>
  );
}

function actionColor(code: string): string {
  if (code === 'f') return 'var(--color-fold)';
  if (code === 'x' || code === 'c') return 'var(--color-call)';
  return 'var(--color-raise)';
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
