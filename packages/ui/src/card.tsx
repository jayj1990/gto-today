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
 * Flat silhouette suit paths, derived from the DALL·E v3 spade
 * (cleanest result from five prompt iterations). Same line thickness
 * and visual mass across all four so they read as one family —
 * minimalist iOS-emoji-style shapes designed to sit behind a rank at
 * low opacity as a watermark.
 */
const SUIT_PATH: Record<Suit, string> = {
  // Spade — DALL·E v3 outline traced. Pointed top, full hips, short stem.
  s: 'M12 1.5 C 12 5.5 2.5 8.5 2.5 13.5 C 2.5 16.5 4.7 18.8 7.5 18.8 C 9.2 18.8 10.5 18.2 11.2 17.2 L 10 22.5 L 14 22.5 L 12.8 17.2 C 13.5 18.2 14.8 18.8 16.5 18.8 C 19.3 18.8 21.5 16.5 21.5 13.5 C 21.5 8.5 12 5.5 12 1.5 Z',
  // Heart — two equal lobes, same stroke mass as spade.
  h: 'M12 22 C 4 16 2 12.5 2 8.5 C 2 5.4 4.2 3 7.2 3 C 9.1 3 10.8 4 12 6 C 13.2 4 14.9 3 16.8 3 C 19.8 3 22 5.4 22 8.5 C 22 12.5 20 16 12 22 Z',
  // Diamond — clean rhombus, same visual weight.
  d: 'M12 1.5 L 21.5 12 L 12 22.5 L 2.5 12 Z',
  // Club — three equal circles (r=3.6) + trapezoidal stem matching the
  // spade's stem proportions so the pair reads as siblings.
  c: 'M12 1.5 C 9.8 1.5 8 3.3 8 5.5 C 8 6.9 8.7 8.1 9.8 8.8 C 7.4 8.8 5.5 10.7 5.5 13.1 C 5.5 15.5 7.4 17.4 9.8 17.4 C 10.6 17.4 11.3 17.2 11.9 16.8 L 10 22.5 L 14 22.5 L 12.1 16.8 C 12.7 17.2 13.4 17.4 14.2 17.4 C 16.6 17.4 18.5 15.5 18.5 13.1 C 18.5 10.7 16.6 8.8 14.2 8.8 C 15.3 8.1 16 6.9 16 5.5 C 16 3.3 14.2 1.5 12 1.5 Z',
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
        <defs>
          {/* Engraving: thin darker-gold concentric arcs clipped to the
              suit silhouette. Gives the v1 ornate-spade "radiating line"
              texture inside any shape without needing per-suit art. */}
          <clipPath id={`suit-clip-${suit}`}>
            <path d={path} />
          </clipPath>
        </defs>

        {/* Base silhouette — flat fill */}
        <path d={path} fill="currentColor" />

        {/* Engraving stripes clipped to the silhouette */}
        <g clipPath={`url(#suit-clip-${suit})`} opacity="0.55">
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse
              key={i}
              cx="12"
              cy="12"
              rx={2 + i * 1.2}
              ry={3 + i * 1.5}
              fill="none"
              stroke="rgba(0,0,0,0.35)"
              strokeWidth="0.28"
            />
          ))}
        </g>
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
