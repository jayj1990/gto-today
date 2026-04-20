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
 * Jay-supplied suit glyphs as alpha-only PNG masks. Processed from
 * ~/Desktop/GTO-Today Image/symbols.png via scripts/process-user-suits.mjs.
 * Using them as CSS mask-image lets us recolour per card via
 * background-color + keep a single consistent silhouette family.
 */
const SUIT_MASK: Record<Suit, string> = {
  s: '/ai-assets/suits-user/spade.png',
  h: '/ai-assets/suits-user/heart.png',
  d: '/ai-assets/suits-user/diamond.png',
  c: '/ai-assets/suits-user/club.png',
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
  const maskUrl = SUIT_MASK[suit];
  // Masks are pre-trimmed to their bbox then padded to a square so
  // every suit touches TOP + BOTTOM of the canvas. Render at 84% of
  // card height (8% top + bottom margin). Centre x = 86% of card
  // width → the mask bleeds further past the right edge for a bolder
  // right-crop; the rank keeps the left half to itself.
  const verticalMargin = sz.h * 0.08;
  const maskH = sz.h - verticalMargin * 2;
  const maskW = maskH;
  const centerX = sz.w * 0.86;
  const maskLeft = centerX - maskW / 2;
  const rightCss = sz.w - (maskLeft + maskW);

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
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: verticalMargin,
          right: rightCss,
          width: maskW,
          height: maskH,
          pointerEvents: 'none',
          backgroundColor: 'rgba(255,255,255,0.48)',
          WebkitMaskImage: `url(${maskUrl})`,
          maskImage: `url(${maskUrl})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />

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
