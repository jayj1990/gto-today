'use client';

import { motion } from 'framer-motion';
import { cn } from './cn';
import { duration as d, easeQuart } from './motion';

export interface MixBarSegment {
  /** 한 줄. "레이즈 8.5bb 블러프"처럼 길어도 칸이 늘어나지 줄이 꺾이지 않는다. */
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
  // 바깥 <ul> 이 격자, 각 줄은 subgrid 로 그 열을 물려받는다. 라벨 열은
  // 가장 긴 라벨("★ 레이즈 8.5bb 블러프")에 맞춰 한 번만 늘어나고 줄바꿈은
  // 금지 — 줄마다 격자를 따로 두면 "콜" 줄과 "레이즈 11bb" 줄의 막대
  // 시작점이 어긋나고, 폭을 고정하면 긴 라벨이 세 줄로 접힌다.
  // (display:contents 로 열을 공유하던 옛 방식은 줄이 한 행으로 뭉치는
  // 일이 있었다.) 격자 속성은 인라인 — 이 패키지의 새 유틸리티는 앱의
  // Tailwind 스캔에 안 잡히는 경우가 있다.
  return (
    <ul
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: labeled ? 'max-content minmax(0, 1fr) 48px' : 'minmax(0, 1fr)',
        columnGap: 12,
        rowGap: 8,
      }}
    >
      {segments.map((seg, i) => {
        const color = seg.color ?? defaultColorFor(seg.label);
        const dom = seg.dominant === true;
        return (
          <li
            // 같은 라벨이 둘 이상 올 수 있다(밸류 레이즈와 블러프 레이즈).
            key={`${seg.label}-${i}`}
            style={{
              display: 'grid',
              gridTemplateColumns: 'subgrid',
              gridColumn: '1 / -1',
              alignItems: 'center',
            }}
          >
            {labeled && (
              <span
                className={cn(
                  'whitespace-nowrap text-right font-mono text-[13px] leading-tight',
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
