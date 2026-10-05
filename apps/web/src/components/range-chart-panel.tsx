'use client';

import { useMemo, useState } from 'react';
import type { BoardRange } from '@gto/gto-data';
import { actionFill, RangeGrid, RangeLegend } from '@gto/ui';
import { collectCodes, postflopActions } from '@/lib/postflop-actions';

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

export function RangeChartPanel({ range }: { range: BoardRange }) {
  const [picked, setPicked] = useState<string | null>(null);

  // 빈도는 퍼센트로 들어온다. 격자가 합으로 정규화하므로 그대로 넘긴다.
  const actions = useMemo(() => postflopActions(collectCodes(range.hands)), [range]);
  const specByKey = useMemo(() => new Map(actions.map((a) => [a.key, a])), [actions]);

  const pickedHand = picked ? range.hands[picked] : null;
  const handCount = Object.keys(range.hands).length;

  return (
    <section className="border-hair surface mt-3 rounded-[var(--radius-panel)] p-4">
      <p className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.18em]">
        레인지 {handCount}핸드 · 169 그리드
      </p>
      <p className="text-fg-muted mt-0.5 text-[12px]">
        셀 색은 액션 비율. 벳은 사이즈가 커질수록 진합니다. 셀을 탭하면 정확한 사이징이 나와요.
      </p>

      <div className="mt-3">
        <RangeGrid
          actions={actions}
          cells={range.hands}
          onCellClick={setPicked}
          highlight={picked ?? undefined}
        />
      </div>

      <RangeLegend
        actions={actions}
        cells={range.hands}
        className="text-fg-muted mt-2 justify-center gap-x-3 gap-y-0.5"
      />

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
                    {specByKey.get(code)?.label ?? code}
                  </span>
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: (() => {
                          const spec = specByKey.get(code);
                          return spec ? actionFill(spec) : 'var(--color-raise)';
                        })(),
                      }}
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
