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
 * SVG paths drawn inside a 24×24 SQUARE viewBox. Keeping the viewBox
 * square means the natural 1:1 suit aspect is preserved — no horizontal
 * squishing. All four paths span y ≈ 1 → 23 so rendered height is
 * identical across suits.
 */
const SUIT_PATH: Record<Suit, string> = {
  s: 'M12 1 C 12 5 2 9 2 14 C 2 17 4.5 19.5 7.5 19.5 C 8.9 19.5 9.8 19 10.3 18.3 L 9 23 L 15 23 L 13.7 18.3 C 14.2 19 15.1 19.5 16.5 19.5 C 19.5 19.5 22 17 22 14 C 22 9 12 5 12 1 Z',
  h: 'M12 23 C 12 23 2 14.5 2 7.5 C 2 4.3 4.3 2 7.5 2 C 9.5 2 11 3 12 4.5 C 13 3 14.5 2 16.5 2 C 19.7 2 22 4.3 22 7.5 C 22 14.5 12 23 12 23 Z',
  d: 'M12 1 L 22 12 L 12 23 L 2 12 Z',
  c: 'M12 1 C 9.5 1 7.5 3 7.5 5.5 C 7.5 7 8.2 8.3 9.3 9 C 7 9.1 5 11 5 13.5 C 5 16 7 18 9.5 18 C 10.3 18 11 17.7 11.6 17.3 L 10 23 L 14 23 L 12.4 17.3 C 13 17.7 13.7 18 14.5 18 C 17 18 19 16 19 13.5 C 19 11 17 9.1 14.7 9 C 15.8 8.3 16.5 7 16.5 5.5 C 16.5 3 14.5 1 12 1 Z',
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
  // Square viewBox (24×24) → square SVG to preserve natural 1:1 suit
  // aspect. Since a square SVG at card-height is wider than the card,
  // the overhang is absorbed on the right as bleed (and a tiny amount
  // on the left) — no horizontal squish.
  const svgH = sz.h;
  const svgW = sz.h;
  // Push SVG to the right so ~90% of the width-overhang (svgW - cardW)
  // bleeds past the card right edge, leaving only ~10% clipped on left.
  const overhang = svgW - sz.w;
  const bleed = overhang * 0.9;

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
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          top: 0,
          right: -bleed,
          color: 'rgba(255,255,255,0.42)',
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
