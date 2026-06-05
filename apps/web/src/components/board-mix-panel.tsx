'use client';

import { useMemo, useState } from 'react';
import {
  POSTFLOP_ACTION_COLOR,
  POSTFLOP_ACTION_LABEL,
  type PostflopAction,
  type PostflopSpot,
} from '@gto/gto-data';
import { comboKey } from '@gto/poker-core';
import { CardView, cn, RangeGrid, type ComboMix } from '@gto/ui';

/**
 * Postflop strategy panel: 169-combo RangeGrid summarising the spot
 * pool for one board, plus a per-combo detail block that opens when
 * a grid cell is tapped. Used by /charts/postflop and /live/play.
 *
 * Remount via `key={boardKey}` to reset the picked-combo state
 * naturally when the underlying board changes.
 */
export function BoardMixPanel({ spots }: { spots: readonly PostflopSpot[] }) {
  const [pickedCombo, setPickedCombo] = useState<string | null>(null);
  const mixes = useMemo(() => spotsToMixes(spots), [spots]);

  if (spots.length === 0) return null;

  const ctx = spots[0]!.context;
  const pickedSpots = pickedCombo
    ? spots.filter((s) => comboKey(s.hero[0], s.hero[1]) === pickedCombo)
    : [];

  return (
    <section className="border-hair surface mt-3 rounded-[var(--radius-panel)] p-4">
      <p className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.18em]">
        {ctx.preflopSummary} · {ctx.heroPos} (OOP) 플랍 차례
      </p>
      <p className="text-fg-muted mt-0.5 text-[12px]">
        히어로 레인지 169 콤보의 액션 차트. 셀 탭 시 해당 콤보 상세.
      </p>

      <div className="mt-3">
        <RangeGrid
          mixes={mixes}
          onCellClick={setPickedCombo}
          highlight={pickedCombo ?? undefined}
        />
      </div>

      <section className="text-fg-muted mt-2 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px]">
        <LegendDot color="var(--color-raise)" label="벳·레이즈" />
        <LegendDot color="var(--color-call)" label="체크·콜" />
        <LegendDot color="var(--color-fold)" label="폴드" />
      </section>

      {pickedCombo && pickedSpots.length > 0 ? (
        <div className="border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/8 mt-4 rounded-[var(--radius-button)] border p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {pickedSpots[0]!.hero.map((c) => (
                <CardView
                  key={c}
                  rank={c.charAt(0)}
                  suit={c.charAt(1) as 's' | 'h' | 'd' | 'c'}
                  size="xs"
                  deckScheme="four-color"
                />
              ))}
              <span className="font-display text-[14px] font-bold">{pickedCombo}</span>
            </div>
            <button
              type="button"
              onClick={() => setPickedCombo(null)}
              className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.18em] active:scale-[0.96]"
              aria-label="콤보 선택 해제"
            >
              ✕
            </button>
          </div>
          <ul className="mt-3 space-y-3">
            {pickedSpots.map((spot) => {
              const entries = spot.availableActions.map(
                (a) => [a, spot.mix[a] ?? 0] as [PostflopAction, number],
              );
              const top = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]!);
              return (
                <li
                  key={spot.id}
                  className="border-hair/50 border-t pt-3 first:border-t-0 first:pt-0"
                >
                  <ul className="space-y-1.5">
                    {entries.map(([act, freq]) => {
                      const isTop = act === top[0] && freq > 0;
                      const color = POSTFLOP_ACTION_COLOR[act];
                      return (
                        <li
                          key={act}
                          className="grid items-center gap-2"
                          style={{ gridTemplateColumns: '64px minmax(0, 1fr) 48px' }}
                        >
                          <span
                            className={cn(
                              'text-right font-mono text-[11px]',
                              isTop ? 'text-on-primary font-bold' : 'text-fg-muted',
                            )}
                          >
                            {POSTFLOP_ACTION_LABEL[act]}
                          </span>
                          <div className="relative h-2.5 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                            <div
                              className="h-full rounded-full transition-[width] duration-300 ease-out"
                              style={{ width: `${freq * 100}%`, background: color }}
                            />
                          </div>
                          <span
                            className={cn(
                              'text-right font-mono text-[11px] tabular-nums',
                              isTop ? 'text-on-primary font-bold' : '',
                            )}
                          >
                            {(freq * 100).toFixed(1)}%
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="text-fg-muted mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em]">
          셀을 탭해 콤보 상세 보기
        </p>
      )}
    </section>
  );
}

/** Collapse a postflop spot's per-sizing mix onto the 3-way slot the
 *  RangeGrid renders (raise/call/fold). bet* + raise_* → aggression;
 *  check → "call" (pass) slot; fold explicit. UX aggregation only —
 *  the per-combo detail panel shows the precise sizing breakdown. */
function toPostflopMix(spot: PostflopSpot): ComboMix {
  let raise = 0;
  let call = 0;
  let fold = 0;
  for (const [action, rawFreq] of Object.entries(spot.mix) as [
    PostflopAction,
    number | undefined,
  ][]) {
    const freq = rawFreq ?? 0;
    if (freq <= 0) continue;
    if (action === 'fold') fold += freq;
    else if (action === 'call' || action === 'check') call += freq;
    else raise += freq;
  }
  const total = raise + call + fold;
  if (total <= 0) return { raise: 0, call: 0, fold: 1 };
  return { raise: raise / total, call: call / total, fold: fold / total };
}

/** Collapse a spot list (one per hero combo) to a 169-combo → mix map.
 *  Iso-equivalent suits (AsKh vs AhKs both → AKs) get their mixes
 *  averaged for visual stability across the grid. */
function spotsToMixes(spots: readonly PostflopSpot[]): Record<string, ComboMix> {
  const buckets = new Map<string, ComboMix[]>();
  for (const s of spots) {
    const key = comboKey(s.hero[0], s.hero[1]);
    const m = toPostflopMix(s);
    const list = buckets.get(key);
    if (list) list.push(m);
    else buckets.set(key, [m]);
  }
  const out: Record<string, ComboMix> = {};
  for (const [key, list] of buckets) {
    const n = list.length;
    out[key] = {
      raise: list.reduce((a, b) => a + b.raise, 0) / n,
      call: list.reduce((a, b) => a + (b.call ?? 0), 0) / n,
      fold: list.reduce((a, b) => a + b.fold, 0) / n,
    };
  }
  return out;
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
