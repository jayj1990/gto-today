'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from './cn';
import { dealCard, flipTransition, flipVariants, pressScale } from './motion';

export type CardFace = 'up' | 'down';
export type DeckScheme = 'two-color' | 'four-color';

type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'T'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';
type Suit = 's' | 'h' | 'd' | 'c';

export interface CardViewProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  rank?: Rank | string;
  suit?: Suit;
  face?: CardFace;
  deckScheme?: DeckScheme;
  size?: CardSize;
  /**
   * Enable the flip animation. When provided, `face` controls target state.
   * Omit to render a static card (cheaper).
   */
  flippable?: boolean;
  /**
   * Opt into the staggered deal variants when the card is inside a
   * framer-motion container driving `dealContainer`.
   */
  dealVariant?: boolean;
  /** Optional tap feedback. */
  interactive?: boolean;
}

type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE: Record<CardSize, string> = {
  xs: 'h-10 w-7 text-[12px]',
  sm: 'h-14 w-10 text-[16px]',
  md: 'h-24 w-[4.25rem] text-[22px]',
  lg: 'h-32 w-24 text-[30px]',
  xl: 'h-40 w-28 text-[38px]',
};

const SUIT_GLYPH: Record<Suit, string> = {
  s: '\u2660',
  h: '\u2665',
  d: '\u2666',
  c: '\u2663',
};

function suitColor(suit: Suit, scheme: DeckScheme): string {
  if (scheme === 'four-color') {
    return {
      s: 'text-noir',
      h: 'text-raise',
      d: 'text-info',
      c: 'text-call',
    }[suit];
  }
  return suit === 'h' || suit === 'd' ? 'text-raise' : 'text-noir';
}

export const CardView = forwardRef<HTMLDivElement, CardViewProps>(function CardView(
  {
    rank,
    suit,
    face = 'up',
    deckScheme = 'four-color',
    size = 'md',
    flippable = false,
    dealVariant = false,
    interactive = false,
    className,
    ...rest
  },
  ref,
) {
  const sizeCls = SIZE[size];
  const a11yLabel = rank && suit ? `${rank}${suit}` : face === 'down' ? 'face-down card' : 'card';

  const motionProps = {
    ...(dealVariant ? { variants: dealCard } : {}),
    ...(flippable
      ? {
          animate: face === 'up' ? 'up' : 'down',
          variants: flipVariants,
          transition: flipTransition,
        }
      : {}),
    ...(interactive ? { whileTap: pressScale } : {}),
  };

  return (
    <motion.div
      ref={ref}
      role="img"
      aria-label={a11yLabel}
      className={cn(
        'relative select-none rounded-[var(--radius-card)]',
        '[transform-style:preserve-3d] [perspective:1200px]',
        sizeCls,
        className,
      )}
      {...motionProps}
      {...rest}
    >
      {/* Back — gets rotated to hidden when face=up (and vice versa) */}
      <CardBack
        className={cn(
          'absolute inset-0 [backface-visibility:hidden]',
          flippable && '[transform:rotateY(180deg)]',
          !flippable && face === 'up' && 'hidden',
        )}
      />
      <CardFront
        rank={rank}
        suit={suit}
        deckScheme={deckScheme}
        className={cn(
          'absolute inset-0 [backface-visibility:hidden]',
          !flippable && face === 'down' && 'hidden',
        )}
      />
    </motion.div>
  );
});

function CardFront({
  rank,
  suit,
  deckScheme,
  className,
}: {
  rank: string | undefined;
  suit: Suit | undefined;
  deckScheme: DeckScheme;
  className: string | undefined;
}) {
  const colorCls = suit ? suitColor(suit, deckScheme) : 'text-noir';
  const glyph = suit ? SUIT_GLYPH[suit] : '';
  return (
    <div
      className={cn(
        'flex flex-col items-stretch justify-between overflow-hidden rounded-[var(--radius-card)]',
        'bg-ivory p-[0.32em] shadow-[var(--shadow-card)] ring-1 ring-inset ring-black/5',
        className,
      )}
    >
      <PaperGrain />
      <span className={cn('relative font-display font-bold leading-none', colorCls)}>{rank}</span>
      <span
        className={cn('relative self-center text-[1.6em] leading-none', colorCls)}
        aria-hidden
      >
        {glyph}
      </span>
      <span
        className={cn('relative self-end rotate-180 font-display font-bold leading-none', colorCls)}
        aria-hidden
      >
        {rank}
      </span>
    </div>
  );
}

function CardBack({ className }: { className: string | undefined }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-card)]',
        'ring-1 ring-inset ring-[color:var(--color-gold)]/40 shadow-[var(--shadow-card)]',
        className,
      )}
      style={{ background: 'var(--gradient-felt)' }}
    >
      {/* geometric web */}
      <svg viewBox="0 0 100 140" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="weave" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 0 6 L 12 6 M 6 0 L 6 12" stroke="rgba(212,175,55,0.12)" strokeWidth="0.4" />
          </pattern>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.25)" />
            <stop offset="70%" stopColor="rgba(212,175,55,0)" />
          </radialGradient>
        </defs>
        <rect width="100" height="140" fill="url(#weave)" />
        <circle cx="50" cy="70" r="38" fill="url(#glow)" />
        <circle cx="50" cy="70" r="4" fill="rgba(212,175,55,0.9)" />
      </svg>
    </div>
  );
}

function PaperGrain() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full rounded-[var(--radius-card)] mix-blend-multiply opacity-[0.04]"
    >
      <filter id="paper-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-noise)" />
    </svg>
  );
}
