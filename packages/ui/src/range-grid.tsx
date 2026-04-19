'use client';

import { useMemo } from 'react';
import { cn } from './cn';

export interface RangeGridProps {
  /** Map of combo key → raise frequency 0..1. Missing = 0. */
  frequencies: Record<string, number>;
  /** Highlight a specific combo (hero's hand). */
  highlight?: string;
  /** Show combo labels inside cells. Defaults true; disable for mini grids. */
  labels?: boolean;
  className?: string;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

/**
 * The canonical 13×13 poker combo grid.
 * Diagonal = pairs, upper triangle = suited, lower triangle = offsuit.
 * Cell color encodes raise frequency via a gold → felt gradient.
 */
export function RangeGrid({
  frequencies,
  highlight,
  labels = true,
  className,
}: RangeGridProps) {
  const cells = useMemo(() => buildCells(frequencies), [frequencies]);

  return (
    <div
      className={cn(
        'inline-grid gap-[2px] rounded-[var(--radius-panel)] p-2',
        'bg-[color:var(--color-border)]',
        className,
      )}
      style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
      role="grid"
      aria-label="Preflop range grid"
    >
      {cells.map(({ combo, freq }) => {
        const isActive = freq > 0;
        const isHighlight = combo === highlight;
        return (
          <div
            key={combo}
            role="gridcell"
            aria-label={`${combo} — ${Math.round(freq * 100)}% raise`}
            className={cn(
              'relative aspect-square min-w-5 select-none',
              'flex items-center justify-center',
              'font-mono text-[10px] leading-none',
              isHighlight && 'ring-2 ring-[color:var(--color-accent)] ring-offset-1',
            )}
            style={{
              background: bgForFreq(freq),
              color: freq > 0.5 ? 'var(--color-noir)' : 'var(--color-fg-muted)',
            }}
          >
            {labels && isActive && <span>{combo}</span>}
            {!labels && isActive && (
              <span
                className="absolute inset-0"
                style={{
                  background: `var(--color-accent)`,
                  opacity: freq,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function buildCells(freq: Record<string, number>): Array<{ combo: string; freq: number }> {
  const out: Array<{ combo: string; freq: number }> = [];
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const hi = RANKS[r];
      const lo = RANKS[c];
      if (!hi || !lo) continue;
      let combo: string;
      if (r === c) combo = `${hi}${lo}`;
      else if (r < c) combo = `${hi}${lo}s`;
      else combo = `${lo}${hi}o`;
      out.push({ combo, freq: freq[combo] ?? 0 });
    }
  }
  return out;
}

function bgForFreq(freq: number): string {
  if (freq <= 0) return 'var(--color-graphite)';
  // Linear ramp from fold-gray → gold. Saturates at 1.
  const alpha = Math.min(1, Math.max(0, freq));
  return `color-mix(in oklab, var(--color-accent) ${alpha * 100}%, var(--color-graphite))`;
}
