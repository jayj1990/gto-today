'use client';

import { useMemo } from 'react';
import {
  actionFill,
  actionLabel,
  LEGACY_ACTIONS,
  type ActionSpec,
  type ComboActions,
} from './preflop-action';

export interface ComboMix {
  /** All-in (jam) frequency 0..1 — rendered gold, distinct from raise. */
  allin?: number;
  /** Raise frequency 0..1. */
  raise: number;
  /** Call frequency 0..1 (vs-open scenarios only). */
  call?: number;
  /** Fold frequency 0..1. */
  fold: number;
}

export interface RangeGridProps {
  /**
   * 옛 경로 — allin/raise/call/fold 네 칸짜리 믹스.
   * 블러프를 구분해야 하면 `actions` + `cells` 를 쓴다.
   */
  mixes?: Record<string, ComboMix> | undefined;
  /** 이 차트의 범례. `cells` 와 짝으로 준다. */
  actions?: readonly ActionSpec[] | undefined;
  /** 콤보 → 액션 키 → 빈도. 빠진 콤보 = 히어로 레인지 밖. */
  cells?: Record<string, ComboActions> | undefined;
  /** Highlight a specific combo (e.g. the user's hand). */
  highlight?: string | undefined;
  /** Optional click handler — passes the combo key. */
  onCellClick?: ((combo: string) => void) | undefined;
  /** Show combo label inside cells. Default true on desktop, auto-hide below. */
  labels?: boolean;
  className?: string;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

/**
 * The canonical 13×13 preflop grid.
 *
 * 색은 액션 종류(fold/check/limp/call/raise/jam)가, 무늬는 의도(밸류/블러프)가
 * 정한다. 한 셀 안에서 액션들은 범례 순서대로 가로로 쌓이고 너비가 곧 빈도다.
 */
export function RangeGrid({
  mixes,
  actions,
  cells,
  highlight,
  onCellClick,
  labels = true,
  className,
}: RangeGridProps) {
  const { specs, data } = useMemo(
    () => normalizeInput({ mixes, actions, cells }),
    [mixes, actions, cells],
  );
  const built = useMemo(() => buildCells(specs, data), [specs, data]);

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
        gap: 2,
        padding: 6,
        borderRadius: 10,
        background: 'rgba(0,0,0,0.4)',
        width: '100%',
      }}
      role="grid"
      aria-label="Preflop range grid"
    >
      {built.map(({ combo, segments, inRange }) => {
        const isHighlight = combo === highlight;
        const clickable = Boolean(onCellClick);

        return (
          <button
            key={combo}
            type="button"
            role="gridcell"
            aria-label={
              inRange === false
                ? `${combo} — 히어로 범위 밖`
                : `${combo} — ${segments
                    .filter((s) => s.pct >= 0.5)
                    .map((s) => `${s.label} ${s.pct.toFixed(0)}%`)
                    .join(', ')}`
            }
            onClick={onCellClick ? () => onCellClick(combo) : undefined}
            style={{
              position: 'relative',
              aspectRatio: '1 / 1',
              width: '100%',
              padding: 0,
              border: 'none',
              borderRadius: 3,
              cursor: clickable ? 'pointer' : 'default',
              overflow: 'hidden',
              userSelect: 'none',
              opacity: inRange === false ? 0.45 : 1,
              outline: isHighlight ? '2px solid var(--color-accent)' : 'none',
              outlineOffset: isHighlight ? '1px' : 0,
            }}
          >
            {/* Stacked background bars. Out-of-range cells (the hand
                left hero's range on an earlier action) render as
                hatched gray so they don't read as "folded" or empty */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                pointerEvents: 'none',
                background:
                  inRange === false
                    ? 'repeating-linear-gradient(135deg, #3a3a3e 0 3px, #2a2a2e 3px 6px)'
                    : 'transparent',
              }}
            >
              {inRange !== false &&
                segments.map((s) => (
                  <div key={s.key} style={{ width: `${s.pct}%`, background: s.fill }} />
                ))}
            </div>
            {/* Label */}
            {labels && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 9,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                  pointerEvents: 'none',
                }}
              >
                {combo}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** 옛 믹스를 새 어휘로 올린다. 호출부는 하나도 안 고쳐도 된다. */
export function legacyToActions(mix: ComboMix): ComboActions {
  return {
    allin: mix.allin ?? 0,
    raise: mix.raise,
    call: mix.call ?? 0,
    fold: mix.fold,
  };
}

function normalizeInput({
  mixes,
  actions,
  cells,
}: Pick<RangeGridProps, 'mixes' | 'actions' | 'cells'>): {
  specs: readonly ActionSpec[];
  data: Record<string, ComboActions>;
} {
  if (cells && actions) return { specs: actions, data: cells };
  const data: Record<string, ComboActions> = {};
  for (const [combo, mix] of Object.entries(mixes ?? {})) data[combo] = legacyToActions(mix);
  return { specs: LEGACY_ACTIONS, data };
}

export interface CellSegment {
  key: string;
  label: string;
  /** 0..100, 셀 안에서의 너비 */
  pct: number;
  fill: string;
}

/**
 * 한 셀의 액션들을 범례 순서대로 세그먼트로 편다.
 * 빈도 합이 1 을 넘으면(차트가 퍼센트로 들어온 경우) 합으로 나눠 정규화한다.
 */
export function cellSegments(specs: readonly ActionSpec[], cell: ComboActions): CellSegment[] {
  let total = 0;
  for (const spec of specs) total += cell[spec.key] ?? 0;
  if (total <= 0) return [];
  const out: CellSegment[] = [];
  for (const spec of specs) {
    const v = cell[spec.key] ?? 0;
    if (v <= 0) continue;
    out.push({
      key: spec.key,
      label: actionLabel(spec),
      pct: (v / total) * 100,
      fill: actionFill(spec),
    });
  }
  return out;
}

/* Build every cell in the 13×13 grid (pairs on the diagonal, suited
   upper triangle, offsuit lower triangle).
   A combo MISSING from the data means the hero's range at this
   decision node doesn't contain that hand — render it as gray/dim
   rather than "100% fold", which is misleading (e.g. AA at a node
   where BTN already 3-bet AA instead of calling). */
function buildCells(
  specs: readonly ActionSpec[],
  data: Record<string, ComboActions>,
): Array<{ combo: string; segments: CellSegment[]; inRange: boolean }> {
  const out: Array<{ combo: string; segments: CellSegment[]; inRange: boolean }> = [];
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      const hi = RANKS[row];
      const lo = RANKS[col];
      if (!hi || !lo) continue;
      let combo: string;
      if (row === col) combo = `${hi}${lo}`;
      else if (row < col) combo = `${hi}${lo}s`;
      else combo = `${lo}${hi}o`;
      const cell = data[combo];
      if (cell) out.push({ combo, segments: cellSegments(specs, cell), inRange: true });
      else out.push({ combo, segments: [], inRange: false });
    }
  }
  return out;
}
