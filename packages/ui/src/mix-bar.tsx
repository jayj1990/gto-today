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
  // CSS grid guarantees every row starts at the same x position. We
  // lock the middle track with minmax(0, 1fr) so a long label never
  // pushes the bar column narrower on one row, and every bar track is
  // identical height so rows align perfectly — dominant emphasis comes
  // from weight + star + glow, not taller bars.
  return (
    <ul
      className={cn('grid gap-y-2', className)}
      style={{
        gridTemplateColumns: labeled ? '64px minmax(0, 1fr) 56px' : 'minmax(0, 1fr)',
      }}
    >
      {segments.map((seg, i) => {
        const color = seg.color ?? defaultColorFor(seg.label);
        const dom = seg.dominant === true;
        return (
          <li key={seg.label} className="contents">
            {labeled && (
              <span
                className={cn(
                  'flex items-center font-mono',
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
            <div className="flex items-center">
              <div
                className="relative h-3 w-full overflow-hidden rounded-full bg-[color:var(--color-border)]"
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
            </div>
            {labeled && (
              <span
                className={cn(
                  'flex items-center justify-end font-mono tabular-nums',
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
