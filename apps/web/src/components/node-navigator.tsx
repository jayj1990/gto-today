'use client';

import { useMemo, useState } from 'react';
import type { BoardNodeTree, FlopNode } from '@gto/gto-data';
import { cn, RangeGrid, type ComboMix } from '@gto/ui';

/**
 * GTO Wizard-style flop node browser. Walk the line by tapping an
 * action (OOP checks → IP's range; OOP bets 75 → IP's call/raise/fold
 * range; …). Each node shows whose turn it is + their 169-grid; tap a
 * cell for the exact action mix. Backed by the per-board node tree
 * (both players, every flop line).
 */

const ACTION_LABEL: Record<string, string> = {
  x: '체크',
  c: '콜',
  f: '폴드',
  b33: '33% 벳',
  b50: '50% 벳',
  b75: '75% 벳',
  bpot: '팟 벳',
  bov: '오버벳',
  r: '레이즈',
};

function actionColor(code: string): string {
  if (code === 'f') return 'var(--color-fold)';
  if (code === 'x' || code === 'c') return 'var(--color-call)';
  return 'var(--color-raise)';
}

/** Compact node mix → RangeGrid's raise/call/fold buckets. */
function toComboMix(hand: Record<string, number>): ComboMix {
  let raise = 0;
  let call = 0;
  let fold = 0;
  for (const [code, pct] of Object.entries(hand)) {
    const v = pct / 100;
    if (code === 'f') fold += v;
    else if (code === 'x' || code === 'c') call += v;
    else raise += v;
  }
  const total = raise + call + fold || 1;
  return { raise: raise / total, call: call / total, fold: fold / total };
}

export function NodeNavigator({ tree }: { tree: BoardNodeTree }) {
  // The action line as a list of codes; '' (empty list) = root.
  const [line, setLine] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);

  const pathKey = line.join('-') || 'root';
  const node: FlopNode | undefined = tree.nodes[pathKey];

  // Children that actually exist in the tree (so we never offer a dead
  // action). A child node's key = current path + '-' + actionCode.
  const childActions = useMemo(() => {
    if (!node) return [];
    return node.actions.filter((a) => {
      const childKey = [...line, a].join('-');
      return tree.nodes[childKey] !== undefined;
    });
  }, [node, line, tree]);

  const mixes = useMemo(() => {
    if (!node) return {};
    const out: Record<string, ComboMix> = {};
    for (const [ht, hand] of Object.entries(node.hands)) out[ht] = toComboMix(hand);
    return out;
  }, [node]);

  if (!node) return null;

  const pickedHand = picked ? node.hands[picked] : null;
  const handCount = Object.keys(node.hands).length;
  const sideLabel = node.side === 'oop' ? 'OOP' : 'IP';

  const reset = () => {
    setLine([]);
    setPicked(null);
  };
  const back = () => {
    setLine((l) => l.slice(0, -1));
    setPicked(null);
  };
  const step = (code: string) => {
    setLine((l) => [...l, code]);
    setPicked(null);
  };

  return (
    <section className="border-hair surface mt-3 rounded-[var(--radius-panel)] p-4">
      {/* Breadcrumb of the action line */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={reset}
          className={cn(
            'font-mono text-[11px] uppercase tracking-[0.16em]',
            line.length === 0 ? 'text-[color:var(--color-accent)]' : 'text-fg-muted',
          )}
        >
          플랍
        </button>
        {line.map((code, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span aria-hidden className="text-fg-muted text-[10px]">
              ›
            </span>
            <button
              type="button"
              onClick={() => {
                setLine(line.slice(0, i + 1));
                setPicked(null);
              }}
              className="font-mono text-[11px]"
              style={{ color: actionColor(code) }}
            >
              {ACTION_LABEL[code] ?? code}
            </button>
          </span>
        ))}
        {line.length > 0 && (
          <button
            type="button"
            onClick={back}
            className="border-hair surface-raised text-fg-muted ml-auto inline-flex h-7 items-center rounded-[var(--radius-button)] px-2 font-mono text-[10px] uppercase tracking-[0.16em] active:scale-[0.96]"
          >
            ← 뒤로
          </button>
        )}
      </div>

      <p className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.18em]">
        {sideLabel} 차례 · 레인지 {handCount}핸드
      </p>

      <div className="mt-3">
        <RangeGrid mixes={mixes} onCellClick={setPicked} highlight={picked ?? undefined} />
      </div>

      <section className="text-fg-muted mt-2 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px]">
        <LegendDot color="var(--color-raise)" label="벳·레이즈" />
        <LegendDot color="var(--color-call)" label="체크·콜" />
        <LegendDot color="var(--color-fold)" label="폴드" />
      </section>

      {/* Drill into the next action */}
      {childActions.length > 0 && (
        <div className="mt-3">
          <p className="text-fg-muted mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
            다음 액션으로 이동
          </p>
          <div className="flex flex-wrap gap-1.5">
            {childActions.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => step(a)}
                className="border-hair surface-raised text-fg inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-button)] px-3 text-[12px] font-medium active:scale-[0.97]"
              >
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ background: actionColor(a) }}
                />
                {ACTION_LABEL[a] ?? a} →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Per-hand action mix */}
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
