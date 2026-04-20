'use client';

import { useMemo } from 'react';
import { cn } from './cn';

export interface ComboMix {
  /** Raise frequency 0..1. */
  raise: number;
  /** Call frequency 0..1 (vs-open scenarios only). */
  call?: number;
  /** Fold frequency 0..1. */
  fold: number;
}

export interface RangeGridProps {
  /** Map of combo key → mix frequencies. Missing = 100% fold. */
  mixes: Record<string, ComboMix>;
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
 * The canonical 13×13 preflop grid — GTO Wizard style.
 *
 * Color coding follows the industry convention:
 *   red    → raise
 *   green  → call
 *   blue   → fold
 * Mixed cells show a horizontal stack of all three colors, widths
 * proportional to each action's frequency.
 */
export function RangeGrid({
  mixes,
  highlight,
  onCellClick,
  labels = true,
  className,
}: RangeGridProps) {
  const cells = useMemo(() => buildCells(mixes), [mixes]);

  return (
    <div
      className={cn('inline-grid gap-[2px] rounded-[10px] p-1.5', className)}
      style={{
        gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
        background: 'rgba(0,0,0,0.4)',
      }}
      role="grid"
      aria-label="Preflop range grid"
    >
      {cells.map(({ combo, mix }) => {
        const isHighlight = combo === highlight;
        const pct = (n: number) => Math.max(0, Math.min(100, n * 100));
        const r = pct(mix.raise);
        const c = pct(mix.call ?? 0);
        const f = pct(mix.fold);
        const clickable = Boolean(onCellClick);

        return (
          <button
            key={combo}
            type="button"
            role="gridcell"
            aria-label={`${combo} — raise ${r.toFixed(0)}%, call ${c.toFixed(0)}%, fold ${f.toFixed(0)}%`}
            onClick={onCellClick ? () => onCellClick(combo) : undefined}
            className={cn(
              'relative aspect-square select-none overflow-hidden rounded-[3px]',
              'font-mono leading-none',
              clickable ? 'cursor-pointer active:scale-[0.94]' : 'cursor-default',
              isHighlight && 'ring-2 ring-[color:var(--color-accent)]',
            )}
            style={{ fontSize: 9, padding: 0 }}
          >
            {/* Stacked background bars */}
            <div className="absolute inset-0 flex">
              <div style={{ width: `${r}%`, background: '#C8102E' }} />
              <div style={{ width: `${c}%`, background: '#1F9D55' }} />
              <div style={{ width: `${f}%`, background: '#2B5F8F' }} />
            </div>
            {/* Label */}
            {labels && (
              <span
                className="absolute inset-0 flex items-center justify-center font-bold"
                style={{
                  color: '#FFFFFF',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                  letterSpacing: '-0.02em',
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

/* Build every cell in the 13×13 grid (pairs on the diagonal, suited
   upper triangle, offsuit lower triangle). */
function buildCells(mixes: Record<string, ComboMix>): Array<{ combo: string; mix: ComboMix }> {
  const out: Array<{ combo: string; mix: ComboMix }> = [];
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      const hi = RANKS[row];
      const lo = RANKS[col];
      if (!hi || !lo) continue;
      let combo: string;
      if (row === col) combo = `${hi}${lo}`;
      else if (row < col) combo = `${hi}${lo}s`;
      else combo = `${lo}${hi}o`;
      const mix = mixes[combo] ?? { raise: 0, fold: 1 };
      out.push({ combo, mix });
    }
  }
  return out;
}
