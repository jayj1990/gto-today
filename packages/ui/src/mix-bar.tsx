'use client';

import { motion } from 'framer-motion';
import { cn } from './cn';
import { duration as d, easeQuart } from './motion';

export interface MixBarSegment {
  label: string;
  /** Percent 0-100. The row's segments should add up to ~100. */
  value: number;
  /** CSS color. Defaults to action-appropriate token. */
  color?: string;
  /** Mark the GTO-preferred action — row renders taller + bolder. */
  dominant?: boolean;
}

export interface MixBarProps {
  segments: MixBarSegment[];
  /** Show labels + values next to each bar row. */
  labeled?: boolean;
  className?: string;
  /** Color of the ★ prefix on the dominant row. Defaults to gold. */
  highlightColor?: string;
}

/**
 * Horizontal mix bar chart for GTO strategy percentages.
 * Each segment fills its own track (one row per action) — more readable
 * than a single stacked bar for decision review.
 */
export function MixBar({
  segments,
  labeled = true,
  className,
  highlightColor = 'var(--color-gold)',
}: MixBarProps) {
  // Each segment is its own flex row. Fixed-width label + fixed-width
  // value column keep bar-start/bar-end aligned across rows, while
  // space-y-2 gives clean vertical separation. Simpler than the
  // grid-with-display:contents pattern which occasionally collapsed
  // multiple segments onto a single row.
  return (
    <ul className={cn('space-y-2', className)}>
      {segments.map((seg, i) => {
        const color = seg.color ?? defaultColorFor(seg.label);
        const dom = seg.dominant === true;
        return (
          <li key={seg.label} className="flex items-center gap-3">
            {labeled && (
              <span
                className={cn(
                  'w-20 flex-shrink-0 font-mono',
                  dom ? 'text-[13px] font-bold text-fg' : 'text-[13px] text-fg-muted',
                )}
              >
                {dom && (
                  <span className="mr-1" style={{ color: highlightColor }}>
                    ★
                  </span>
                )}
                {seg.label}
              </span>
            )}
            <div
              className="relative h-3 flex-1 overflow-hidden rounded-full bg-[color:var(--color-border)]"
              style={dom ? { boxShadow: `0 0 0 1.5px ${color}` } : undefined}
            >
              <motion.div
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: `inset(0 ${Math.max(0, 100 - seg.value)}% 0 0)` }}
                transition={{
                  duration: d.mixBar,
                  ease: easeQuart,
                  delay: i * 0.06,
                }}
                className="absolute inset-0 rounded-full"
                style={{ background: color }}
              />
            </div>
            {labeled && (
              <span
                className={cn(
                  'w-14 flex-shrink-0 text-right font-mono tabular-nums',
                  dom ? 'text-[13px] font-bold text-fg' : 'text-[13px] font-semibold',
                )}
              >
                {seg.value.toFixed(1)}%
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function defaultColorFor(label: string): string {
  const l = label.toLowerCase();
  if (l.startsWith('fold')) return 'var(--color-fold)';
  if (l.startsWith('check')) return 'var(--color-info)';
  if (l.startsWith('call')) return 'var(--color-call)';
  if (l.startsWith('raise') || l.startsWith('bet') || l.startsWith('3bet')) {
    return 'var(--color-raise)';
  }
  return 'var(--color-accent)';
}
