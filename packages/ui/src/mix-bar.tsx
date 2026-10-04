'use client';

import { motion } from 'framer-motion';
import { cn } from './cn';
import { duration as d, easeQuart } from './motion';

export interface MixBarSegment {
  label: string;
  /**
   * 라벨 아래 작게 붙는 둘째 줄 — 사이즈나 의도("8.5bb 블러프").
   *
   * 한 줄에 다 넣으면 56px 라벨 칸에서 "레이즈 / 8.5bb / 블러프" 세 줄로
   * 제멋대로 접힌다. 줄바꿈을 흐름에 맡기지 않고 여기서 못 박는다.
   */
  sublabel?: string;
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
          <li
            // 같은 라벨이 둘 이상 올 수 있다(밸류 레이즈와 블러프 레이즈).
            key={`${seg.label}-${seg.sublabel ?? ''}-${i}`}
            className="grid items-center gap-3"
            style={{
              // max-content 로 둬야 "22.0bb 블러프" 같은 긴 둘째 줄이 칸을
              // 삐져나가지 않는다. 모든 줄이 같은 폭을 쓰므로 막대 시작점은
              // 그대로 일직선이다.
              gridTemplateColumns: labeled
                ? 'minmax(68px, max-content) minmax(0, 1fr) 48px'
                : 'minmax(0, 1fr)',
            }}
          >
            {labeled && (
              <span className="flex flex-col items-end leading-tight">
                <span
                  className={cn(
                    'whitespace-nowrap font-mono text-[13px]',
                    dom ? 'text-on-primary font-bold' : 'text-fg-muted',
                  )}
                >
                  {dom && (
                    <span aria-hidden className="mr-1" style={{ color: highlightColor }}>
                      ★
                    </span>
                  )}
                  {seg.label}
                </span>
                {seg.sublabel && (
                  <span className="text-fg-muted whitespace-nowrap font-mono text-[10px] opacity-80">
                    {seg.sublabel}
                  </span>
                )}
              </span>
            )}
            <div className="relative h-3 overflow-hidden rounded-full bg-[color:var(--color-border)]">
              <motion.div
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: `inset(0 ${Math.max(0, 100 - seg.value)}% 0 0)` }}
                transition={{ duration: d.mixBar, ease: easeQuart, delay: i * 0.06 }}
                className="absolute inset-0 rounded-full"
                style={{ background: color }}
              />
            </div>
            {labeled && (
              <span
                className={cn(
                  'text-right font-mono text-[13px] tabular-nums',
                  dom ? 'text-on-primary font-bold' : 'font-semibold',
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
