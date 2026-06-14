'use client';

import {
  POSTFLOP_ACTION_COLOR,
  POSTFLOP_ACTION_LABEL,
  type PostflopAction,
  type PostflopSpot,
} from '@gto/gto-data';
import { CardView, cn } from '@gto/ui';

/**
 * Postflop strategy panel for one board. Our solver dataset keeps a
 * representative SAMPLE of hero hands per board (~5), not the full
 * 169-combo range — the data was generated for the quiz, not a
 * Wizard-style range matrix. So we render the sampled hands as a list
 * of hole-card rows, each with its action-mix bars. (A 169-grid would
 * be 97% empty and read as broken.)
 *
 * Remount via `key={boardKey}` when the board changes.
 */
export function BoardMixPanel({ spots }: { spots: readonly PostflopSpot[] }) {
  if (spots.length === 0) return null;

  const ctx = spots[0]!.context;

  return (
    <section className="border-hair surface mt-3 rounded-[var(--radius-panel)] p-4">
      <p className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.18em]">
        {ctx.preflopSummary} · {ctx.heroPos} (OOP) 플랍 차례
      </p>
      <p className="text-fg-muted mt-0.5 text-[12px]">
        이 보드의 대표 핸드 {spots.length}개와 GTO 액션 비율이에요.
      </p>

      <ul className="mt-3 space-y-2.5">
        {spots.map((spot) => {
          const entries = spot.availableActions
            .map((a) => [a, spot.mix[a] ?? 0] as [PostflopAction, number])
            .filter(([, f]) => f > 0)
            .sort((a, b) => b[1] - a[1]);
          const top = entries[0];
          return (
            <li
              key={spot.id}
              className="border-hair surface-raised rounded-[var(--radius-button)] p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                {spot.hero.map((c) => (
                  <CardView
                    key={c}
                    rank={c.charAt(0)}
                    suit={c.charAt(1) as 's' | 'h' | 'd' | 'c'}
                    size="sm"
                    deckScheme="four-color"
                  />
                ))}
                {top && (
                  <span className="text-fg-muted ml-auto font-mono text-[10px] uppercase tracking-[0.16em]">
                    주 액션 · {POSTFLOP_ACTION_LABEL[top[0]]}
                  </span>
                )}
              </div>
              <ul className="space-y-1.5">
                {entries.map(([act, freq]) => {
                  const isTop = act === top?.[0];
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
                          style={{
                            width: `${freq * 100}%`,
                            background: POSTFLOP_ACTION_COLOR[act],
                          }}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-right font-mono text-[11px] tabular-nums',
                          isTop ? 'text-on-primary font-bold' : 'text-fg-muted',
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

      <section className="text-fg-muted mt-3 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px]">
        <LegendDot color="var(--color-raise)" label="벳·레이즈" />
        <LegendDot color="var(--color-call)" label="체크·콜" />
        <LegendDot color="var(--color-fold)" label="폴드" />
      </section>
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
