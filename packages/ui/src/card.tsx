import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export type CardFace = 'up' | 'down';

export interface CardViewProps extends HTMLAttributes<HTMLDivElement> {
  rank?: string;
  suit?: 's' | 'h' | 'd' | 'c';
  face?: CardFace;
  deckScheme?: 'two-color' | 'four-color';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Phase 2 will expand this with:
 *  - Framer Motion flip animation
 *  - Subtle paper grain texture via backdrop filter
 *  - 4-color deck token swap
 * For Phase 1 we ship a static, accessible placeholder used on the landing teaser.
 */
export function CardView({
  rank,
  suit,
  face = 'up',
  deckScheme = 'four-color',
  size = 'md',
  className,
  ...rest
}: CardViewProps) {
  const sizeCls = {
    sm: 'h-16 w-12 text-lg',
    md: 'h-24 w-[4.25rem] text-2xl',
    lg: 'h-32 w-24 text-3xl',
  }[size];

  if (face === 'down') {
    return (
      <div
        role="img"
        aria-label="face-down card"
        className={cn(
          'relative overflow-hidden rounded-[var(--radius-card)] bg-felt shadow-[var(--shadow-card)]',
          'ring-1 ring-inset ring-gold/30',
          sizeCls,
          className,
        )}
        {...rest}
      >
        <div className="absolute inset-0 bg-[var(--gradient-felt)] opacity-95" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gold/80 text-[1.2em] leading-none">·</span>
        </div>
      </div>
    );
  }

  const suitSymbol = suit ? { s: '♠', h: '♥', d: '♦', c: '♣' }[suit] : '';
  const suitColor =
    deckScheme === 'four-color'
      ? { s: 'text-noir', h: 'text-raise', d: 'text-info', c: 'text-call' }[suit ?? 's']
      : suit === 'h' || suit === 'd'
        ? 'text-raise'
        : 'text-noir';

  return (
    <div
      role="img"
      aria-label={rank && suit ? `${rank}${suit}` : 'card'}
      className={cn(
        'relative flex flex-col items-stretch justify-between rounded-[var(--radius-card)] bg-ivory p-[0.4em] shadow-[var(--shadow-card)]',
        'ring-1 ring-inset ring-black/5',
        sizeCls,
        className,
      )}
      {...rest}
    >
      <span className={cn('font-display font-bold leading-none', suitColor)}>{rank}</span>
      <span className={cn('self-center text-[1.6em] leading-none', suitColor)}>{suitSymbol}</span>
      <span
        className={cn('self-end font-display font-bold leading-none rotate-180', suitColor)}
        aria-hidden
      >
        {rank}
      </span>
    </div>
  );
}
