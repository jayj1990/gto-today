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
  { w: number; h: number; radius: number; rank: number }
> = {
  xs: { w: 30, h: 42, radius: 5, rank: 20 },
  sm: { w: 42, h: 60, radius: 6, rank: 28 },
  md: { w: 68, h: 96, radius: 10, rank: 44 },
  lg: { w: 96, h: 134, radius: 12, rank: 60 },
  xl: { w: 114, h: 160, radius: 14, rank: 74 },
};

/**
 * SVG paths drawn inside an 18×24 viewBox. Every path spans the FULL
 * vertical extent (y ≈ 0.5 → 23.5) so when the SVG is rendered at
 * height = cardHeight, all four suits are identical height — no more
 * Unicode-glyph drift where the heart rendered at 1.3× the diamond.
 */
const SUIT_PATH: Record<Suit, string> = {
  s: 'M9 0.5 C 9 5 1.5 8 1.5 13 C 1.5 16 3.5 18.2 6 18.2 C 7.2 18.2 8 17.7 8.5 17 L 7 23.5 L 11 23.5 L 9.5 17 C 10 17.7 10.8 18.2 12 18.2 C 14.5 18.2 16.5 16 16.5 13 C 16.5 8 9 5 9 0.5 Z',
  h: 'M9 23.5 C 9 23.5 0.5 15.5 0.5 7.5 C 0.5 3.8 3 1.5 5.8 1.5 C 7.5 1.5 8.5 2.5 9 3.5 C 9.5 2.5 10.5 1.5 12.2 1.5 C 15 1.5 17.5 3.8 17.5 7.5 C 17.5 15.5 9 23.5 9 23.5 Z',
  d: 'M9 0.5 L 17 12 L 9 23.5 L 1 12 Z',
  c: 'M9 0.5 C 7 0.5 5.3 2.2 5.3 4.3 C 5.3 5.5 5.9 6.5 6.8 7 C 4.8 7.2 3.2 8.9 3.2 11 C 3.2 13.1 4.8 14.8 6.8 14.8 C 7.4 14.8 8 14.6 8.5 14.3 L 7 23.5 L 11 23.5 L 9.5 14.3 C 10 14.6 10.6 14.8 11.2 14.8 C 13.2 14.8 14.8 13.1 14.8 11 C 14.8 8.9 13.2 7.2 11.2 7 C 12.1 6.5 12.7 5.5 12.7 4.3 C 12.7 2.2 11 0.5 9 0.5 Z',
};

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
  const path = SUIT_PATH[suit];
  // SVG intrinsic aspect is viewBox width/height = 18/24 = 0.75. Render
  // height == card height so every suit is exactly the card's height.
  const svgH = sz.h;
  const svgW = svgH * (18 / 24);
  // Bleed: 12% of card width hangs past the right edge, identical for all
  // four suits since the viewBox is identical.
  const bleed = sz.w * 0.12;

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
      {/* Right-side suit glyph — SVG path inside an 18×24 viewBox ensures
          top/bottom line up with card edges and the right-side bleed is
          identical for all four suits. `overflow:hidden` on the card
          clips the overshoot. */}
      <svg
        aria-hidden
        width={svgW}
        height={svgH}
        viewBox="0 0 18 24"
        style={{
          position: 'absolute',
          top: 0,
          right: -bleed,
          color: 'rgba(255,255,255,0.55)',
          pointerEvents: 'none',
        }}
      >
        <path d={path} fill="currentColor" />
      </svg>

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
