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
 * Refined SVG suit paths in a 24×24 square viewBox. Compared to v1 these
 * have softer S-curves, tapered stems, and evenly-proportioned lobes so
 * every suit reads as a proper "elegant" playing-card glyph. All four
 * occupy roughly the same visual bounding box (y 2–23, x 2–22).
 */
const SUIT_PATH: Record<Suit, string> = {
  // Spade — sharp apex, full hips, slim tapered stem
  s: 'M12 2 C 12 6.5 3 9 3 13.5 C 3 16.5 5 18.8 7.8 18.8 C 9.3 18.8 10.5 18.2 11.2 17.4 L 10 23 L 14 23 L 12.8 17.4 C 13.5 18.2 14.7 18.8 16.2 18.8 C 19 18.8 21 16.5 21 13.5 C 21 9 12 6.5 12 2 Z',
  // Heart — gently rounded lobes, pointed tip
  h: 'M12 22 C 4.5 16.5 2 12.5 2 8.5 C 2 5.5 4 3 7 3 C 8.8 3 10.8 4 12 6.5 C 13.2 4 15.2 3 17 3 C 20 3 22 5.5 22 8.5 C 22 12.5 19.5 16.5 12 22 Z',
  // Diamond — clean rhombus, slightly elongated
  d: 'M12 2 L 21 12 L 12 22 L 3 12 Z',
  // Club — three equal r=3.5 lobes arranged in a triangle + trapezoidal stem
  c: 'M12 2 C 9.8 2 8 3.8 8 6 C 8 7.3 8.6 8.4 9.5 9 C 7.3 9.1 5.5 10.9 5.5 13.1 C 5.5 15.3 7.3 17.1 9.5 17.1 C 10.3 17.1 11 16.9 11.6 16.5 L 10 23 L 14 23 L 12.4 16.5 C 13 16.9 13.7 17.1 14.5 17.1 C 16.7 17.1 18.5 15.3 18.5 13.1 C 18.5 10.9 16.7 9.1 14.5 9 C 15.4 8.4 16 7.3 16 6 C 16 3.8 14.2 2 12 2 Z',
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
  // Square SVG, 1:1 aspect preserved. Tweaks from v1:
  //   • 88% of card height (6% breathing room top + bottom)
  //   • Suit visual centre sits at 70% of card width from the left,
  //     so the left ~30% is free space for the rank to breathe and
  //     the right side bleeds past the card edge.
  const verticalMargin = sz.h * 0.06;
  const svgH = sz.h - verticalMargin * 2;
  const svgW = svgH;
  const suitCenterX = sz.w * 0.70;
  const svgLeft = suitCenterX - svgW / 2;
  const rightCss = sz.w - (svgLeft + svgW);

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
          top: verticalMargin,
          right: rightCss,
          color: 'rgba(255,255,255,0.48)',
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
