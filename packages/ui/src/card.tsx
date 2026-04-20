'use client';

import { forwardRef, type HTMLAttributes } from 'react';

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

export interface CardViewProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
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
 * CardView — plain div with inline styles.
 *
 * New layering: at every size we paint a LARGE suit glyph as the card's
 * watermark, then the rank rides on top. This fixes mobile readability
 * where the previous corner-only suit was too small to read at a glance.
 *
 * Visual stack (front to back):
 *   rank (big, white, drop shadow)
 *   small corner suit (md+ only)
 *   big watermark suit  (≈70% of card height, semi-transparent white)
 *   tinted background   (suit-specific color)
 */
const SIZE: Record<
  CardSize,
  { w: number; h: number; radius: number; rank: number; suit: number; cornerSuit: number }
> = {
  xs: { w: 30, h: 42, radius: 5, rank: 20, suit: 36, cornerSuit: 0 },
  sm: { w: 42, h: 60, radius: 6, rank: 28, suit: 52, cornerSuit: 0 },
  md: { w: 68, h: 96, radius: 10, rank: 40, suit: 80, cornerSuit: 14 },
  lg: { w: 96, h: 134, radius: 12, rank: 56, suit: 112, cornerSuit: 16 },
  xl: { w: 114, h: 160, radius: 14, rank: 70, suit: 132, cornerSuit: 18 },
};

const SUIT_GLYPH: Record<Suit, string> = { s: '\u2660', h: '\u2665', d: '\u2666', c: '\u2663' };

function suitBackground(suit: Suit, scheme: DeckScheme): { bg: string; rim: string } {
  if (scheme === 'four-color') {
    const map: Record<Suit, { bg: string; rim: string }> = {
      s: { bg: '#1F1F24', rim: 'rgba(255,255,255,0.22)' },
      h: { bg: '#9B2A3E', rim: 'rgba(255,255,255,0.25)' },
      d: { bg: '#2B5F8F', rim: 'rgba(255,255,255,0.25)' },
      c: { bg: '#266E4A', rim: 'rgba(255,255,255,0.25)' },
    };
    return map[suit];
  }
  const red = { bg: '#9B2A3E', rim: 'rgba(255,255,255,0.25)' };
  const dark = { bg: '#1F1F24', rim: 'rgba(255,255,255,0.2)' };
  return suit === 'h' || suit === 'd' ? red : dark;
}

export const CardView = forwardRef<HTMLDivElement, CardViewProps>(function CardView(
  {
    rank,
    suit,
    face = 'up',
    deckScheme = 'four-color',
    size = 'md',
    flippable: _flippable,
    dealVariant: _dealVariant,
    interactive: _interactive,
    className,
    style,
    ...rest
  },
  ref,
) {
  const sz = SIZE[size];
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: sz.w,
    height: sz.h,
    borderRadius: sz.radius,
    userSelect: 'none',
    flexShrink: 0,
    boxShadow: '0 3px 10px rgba(0,0,0,0.45)',
    overflow: 'hidden',
  };

  if (face === 'down') {
    return (
      <div
        ref={ref}
        role="img"
        aria-label="face-down card"
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(135deg, #0E3B2E 0%, #082018 100%)',
          border: '1px solid rgba(212,175,55,0.35)',
          ...style,
        }}
        {...rest}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(212,175,55,0.75)',
            fontSize: sz.rank * 0.55,
            fontWeight: 700,
          }}
        >
          ·
        </div>
      </div>
    );
  }

  if (!rank || !suit) {
    return (
      <div
        ref={ref}
        role="img"
        aria-label="card"
        className={className}
        style={{ ...baseStyle, background: '#1F1F24', ...style }}
        {...rest}
      />
    );
  }

  const { bg, rim } = suitBackground(suit, deckScheme);
  const glyph = SUIT_GLYPH[suit];

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${rank}${suit}`}
      className={className}
      style={{
        ...baseStyle,
        background: bg,
        border: `1px solid ${rim}`,
        ...style,
      }}
      {...rest}
    >
      {/* Big watermark suit behind everything */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, "Segoe UI Symbol", sans-serif',
          fontSize: sz.suit,
          lineHeight: 1,
          color: 'rgba(255,255,255,0.22)',
          pointerEvents: 'none',
        }}
      >
        {glyph}
      </div>

      {/* Small corner suit (md+ only — xs/sm rely on the watermark alone) */}
      {sz.cornerSuit > 0 && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            fontSize: sz.cornerSuit,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.92)',
            fontFamily: 'system-ui, "Segoe UI Symbol", sans-serif',
          }}
        >
          {glyph}
        </div>
      )}

      {/* Big rank — always on top, highest contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display, Inter), system-ui, sans-serif',
          fontWeight: 900,
          fontSize: sz.rank,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          textShadow: '0 2px 6px rgba(0,0,0,0.55)',
        }}
      >
        {rank}
      </div>
    </div>
  );
});
