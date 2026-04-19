import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export type ChipTone = 'gold' | 'felt' | 'raise' | 'call' | 'ivory';

export interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  value: number | string;
  tone?: ChipTone;
  size?: 'sm' | 'md' | 'lg';
}

const TONE: Record<ChipTone, { bg: string; ring: string; text: string }> = {
  gold: {
    bg: 'var(--gradient-gold)',
    ring: 'var(--color-gold-deep)',
    text: 'var(--color-noir)',
  },
  felt: {
    bg: 'var(--gradient-felt)',
    ring: 'rgba(212,175,55,0.35)',
    text: 'var(--color-ivory)',
  },
  raise: {
    bg: 'radial-gradient(circle at 30% 30%, #E23B56, #C8102E 60%, #7F0A1B)',
    ring: 'rgba(255,255,255,0.2)',
    text: 'var(--color-ivory)',
  },
  call: {
    bg: 'radial-gradient(circle at 30% 30%, #2EBE6F, #1F9D55 60%, #0F5D33)',
    ring: 'rgba(255,255,255,0.2)',
    text: 'var(--color-ivory)',
  },
  ivory: {
    bg: 'linear-gradient(160deg, #FFFFFF, #E7DFCE)',
    ring: 'rgba(0,0,0,0.08)',
    text: 'var(--color-noir)',
  },
};

const SIZE: Record<NonNullable<ChipProps['size']>, string> = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-10 w-10 text-[13px]',
  lg: 'h-14 w-14 text-[17px]',
};

export function Chip({ value, tone = 'gold', size = 'md', className, style, ...rest }: ChipProps) {
  const t = TONE[tone];
  return (
    <div
      role="img"
      aria-label={`chip ${value}`}
      className={cn(
        'relative inline-flex select-none items-center justify-center rounded-full font-mono font-semibold',
        'shadow-[var(--shadow-card)]',
        SIZE[size],
        className,
      )}
      style={{
        background: t.bg,
        color: t.text,
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.22), var(--shadow-card)',
        outline: `2px dashed ${t.ring}`,
        outlineOffset: '-4px',
        ...style,
      }}
      {...rest}
    >
      <span className="relative z-10">{value}</span>
    </div>
  );
}
