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
 * Layout (per Jay's spec, mirrors the ref screenshot suit.png):
 *   • Rank sits on the LEFT, vertically centered, clear and readable
 *   • Suit dominates the RIGHT side — glyph height ≈ card height so it
 *     bleeds past the card edge, creating a bold full-bleed visual
 *   • Suit glyph is opaque-ish white (55%) so it reads as a filled shape
 *     not a faint watermark
 *
 * This replaces the previous "tiny corner suit + subtle center watermark"
 * layout that was hard to parse on small mobile cards.
 */
const SIZE: Record<
  CardSize,
  { w: number; h: number; radius: number; rank: number; suit: number }
> = {
  //      w    h    radius  rank  suit (≈ 1.45× h so glyph fills top-to-bottom)
  xs: { w: 30, h: 42, radius: 5, rank: 20, suit: 60 },
  sm: { w: 42, h: 60, radius: 6, rank: 28, suit: 86 },
  md: { w: 68, h: 96, radius: 10, rank: 44, suit: 138 },
  lg: { w: 96, h: 134, radius: 12, rank: 60, suit: 194 },
  xl: { w: 114, h: 160, radius: 14, rank: 74, suit: 232 },
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
      {/* Huge right-side suit glyph — fills top-to-bottom and the right
          ~35% of the glyph bleeds past the card edge for a bold full-bleed
          shape. `overflow:hidden` on the card clips the overshoot. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          right: -sz.suit * 0.20,
          transform: 'translateY(-50%)',
          fontFamily: 'system-ui, "Segoe UI Symbol", sans-serif',
          fontSize: sz.suit,
          lineHeight: 1,
          color: 'rgba(255,255,255,0.55)',
          pointerEvents: 'none',
        }}
      >
        {glyph}
      </div>

      {/* Rank — centered on the card, always in front of the suit */}
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
