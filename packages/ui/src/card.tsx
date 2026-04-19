'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from './cn';
import { dealCard, flipTransition, flipVariants, pressScale } from './motion';

export type CardFace = 'up' | 'down';
export type DeckScheme = 'two-color' | 'four-color';
type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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
  flippable?: boolean;
  dealVariant?: boolean;
  interactive?: boolean;
}

/**
 * GTO Wizard-inspired card visuals.
 *
 * At every size, the card shows:
 *   • A tinted background keyed to the suit (4-color deck default)
 *   • A big bold rank glyph, centered
 *   • A tiny suit symbol in the top-left corner
 *
 * Rationale vs traditional poker card layout:
 *   The old CardFront stacked [rank, suit, rank-rotated] vertically. At
 *   small sizes the three elements overflowed the card box and broke the
 *   look. GTO-style single-rank cards stay legible even at 36×52 (xs).
 */
const SIZE: Record<CardSize, { box: string; rank: string; suit: string }> = {
  xs: { box: 'h-[42px] w-[30px] rounded-[5px]', rank: 'text-[20px]', suit: 'text-[8px]' },
  sm: { box: 'h-[54px] w-[38px] rounded-[6px]', rank: 'text-[26px]', suit: 'text-[10px]' },
  md: { box: 'h-24 w-[4.25rem] rounded-[10px]', rank: 'text-[42px]', suit: 'text-[14px]' },
  lg: { box: 'h-32 w-24 rounded-[12px]', rank: 'text-[56px]', suit: 'text-[16px]' },
  xl: { box: 'h-40 w-28 rounded-[14px]', rank: 'text-[72px]', suit: 'text-[18px]' },
};

const SUIT_GLYPH: Record<Suit, string> = { s: '\u2660', h: '\u2665', d: '\u2666', c: '\u2663' };

function suitBackground(suit: Suit, scheme: DeckScheme): { bg: string; rim: string } {
  if (scheme === 'four-color') {
    // Soft, solid tones — not blinding. Rank text stays white.
    const map: Record<Suit, { bg: string; rim: string }> = {
      s: { bg: '#1F1F24', rim: 'rgba(255,255,255,0.15)' },
      h: { bg: '#9B2A3E', rim: 'rgba(255,255,255,0.18)' },
      d: { bg: '#2B5F8F', rim: 'rgba(255,255,255,0.18)' },
      c: { bg: '#266E4A', rim: 'rgba(255,255,255,0.18)' },
    };
    return map[suit];
  }
  // Two-color: red hearts/diamonds, dark spades/clubs — still tinted-bg style.
  const red = { bg: '#9B2A3E', rim: 'rgba(255,255,255,0.18)' };
  const dark = { bg: '#1F1F24', rim: 'rgba(255,255,255,0.15)' };
  return suit === 'h' || suit === 'd' ? red : dark;
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
  const sz = SIZE[size];

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

  if (face === 'down' && !flippable) {
    return (
      <motion.div
        ref={ref}
        role="img"
        aria-label="face-down card"
        className={cn(
          'relative select-none shadow-[0_4px_10px_rgba(0,0,0,0.35)]',
          sz.box,
          className,
        )}
        style={{
          background:
            'linear-gradient(135deg, #0E3B2E 0%, #082018 100%)',
          border: '1px solid rgba(212,175,55,0.35)',
        }}
        {...motionProps}
        {...rest}
      >
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-bold text-[color:var(--color-gold)]"
          style={{ opacity: 0.75 }}
        >
          ·
        </span>
      </motion.div>
    );
  }

  if (!rank || !suit) {
    return (
      <motion.div
        ref={ref}
        role="img"
        aria-label="card"
        className={cn('relative select-none', sz.box, className)}
        style={{ background: '#1F1F24' }}
        {...motionProps}
        {...rest}
      />
    );
  }

  const { bg, rim } = suitBackground(suit, deckScheme);
  const glyph = SUIT_GLYPH[suit];

  return (
    <motion.div
      ref={ref}
      role="img"
      aria-label={`${rank}${suit}`}
      className={cn(
        'relative select-none shadow-[0_3px_10px_rgba(0,0,0,0.35)]',
        sz.box,
        className,
      )}
      style={{ background: bg, border: `1px solid ${rim}` }}
      {...motionProps}
      {...rest}
    >
      {/* Small suit glyph, top-left */}
      <span
        aria-hidden
        className={cn(
          'absolute left-[3px] top-[2px] font-sans leading-none',
          sz.suit,
        )}
        style={{ color: 'rgba(255,255,255,0.85)' }}
      >
        {glyph}
      </span>
      {/* Big rank glyph, centered */}
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center font-display font-bold leading-none text-white',
          sz.rank,
        )}
        style={{ letterSpacing: '-0.02em' }}
      >
        {rank}
      </span>
    </motion.div>
  );
});
