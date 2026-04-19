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
}

export interface MixBarProps {
  segments: MixBarSegment[];
  /** Show labels + values next to each bar row. */
  labeled?: boolean;
  className?: string;
}

/**
 * Horizontal mix bar chart for GTO strategy percentages.
 * Each segment fills its own track (one row per action) — more readable
 * than a single stacked bar for decision review.
 */
export function MixBar({ segments, labeled = true, className }: MixBarProps) {
  return (
    <ul className={cn('space-y-2', className)}>
      {segments.map((seg, i) => {
        const color = seg.color ?? defaultColorFor(seg.label);
        return (
          <li key={seg.label} className="flex items-center gap-3">
            {labeled && (
              <span className="w-20 font-mono text-[13px] uppercase tracking-[0.1em] text-fg-muted">
                {seg.label}
              </span>
            )}
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[color:var(--color-border)]">
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
              <span className="w-12 text-right font-mono text-[13px] font-semibold">
                {seg.value.toFixed(0)}%
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
