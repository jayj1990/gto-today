import type { CSSProperties, SVGProps } from 'react';
import { cn } from './cn';

export type LogoVariant = 'full' | 'short' | 'dot' | 'mark';

export interface LogoProps extends Omit<SVGProps<SVGSVGElement>, 'variant' | 'children'> {
  variant?: LogoVariant;
  /** Label for screen readers. Defaults to the wordmark text. */
  title?: string;
  /**
   * Color of the gold middle dot. Defaults to `var(--color-accent)` which swaps with theme.
   * Override when rendering on a known background (e.g. always gold on felt).
   */
  dotColor?: string;
  /**
   * Color of the wordmark. Defaults to `currentColor` so it inherits from parent CSS.
   */
  wordColor?: string;
}

/**
 * gto.today logo.
 *
 * Variants:
 *  - full  — "GTO · today" horizontal wordmark (HTML, so the dot stays
 *            visually centered regardless of font metrics).
 *  - short — "G · T" compact mark (HTML, same geometry rules).
 *  - dot   — just the gold middle dot (SVG; favicon, inline).
 *  - mark  — stacked composition inside a rounded square (SVG, for app icons).
 *
 * SVG `<text>` can't predict the rendered advance-width of a string, so
 * the previous implementation had the middle dot drifting relative to
 * the glyphs depending on font availability. The HTML variants use a
 * flex row with a `<span>` dot sized in `em`, locking the geometry to
 * the font size regardless of which face actually renders.
 */
export function Logo({
  variant = 'full',
  title,
  dotColor = 'var(--color-accent, #D4AF37)',
  wordColor = 'currentColor',
  className,
  width,
  height,
  style,
  // SVG-only props we drop for the HTML variants.
  viewBox: _viewBox,
  xmlns: _xmlns,
  ...rest
}: LogoProps) {
  if (variant === 'full' || variant === 'short') {
    return (
      <WordmarkHTML
        variant={variant}
        title={title}
        dotColor={dotColor}
        wordColor={wordColor}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    );
  }

  const id = idFor(variant);

  if (variant === 'dot') {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label={title ?? 'gto.today mark'}
        width={width}
        height={height}
        className={cn('inline-block align-middle', className)}
        style={style}
        {...rest}
      >
        <title id={id}>{title ?? 'gto.today'}</title>
        <circle cx="12" cy="12" r="5.25" fill={dotColor} />
      </svg>
    );
  }

  // mark
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title ?? 'gto.today'}
      width={width}
      height={height}
      className={cn('inline-block align-middle', className)}
      style={style}
      {...rest}
    >
      <title id={id}>{title ?? 'gto.today'}</title>
      <defs>
        <linearGradient id={`${id}-felt`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E3B2E" />
          <stop offset="100%" stopColor="#082018" />
        </linearGradient>
        <radialGradient id={`${id}-gold`} cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#E8CC72" />
          <stop offset="55%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8912A" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${id}-felt)`} />
      {/* subtle inner edge */}
      <rect
        x="0.75"
        y="0.75"
        width="62.5"
        height="62.5"
        rx="13.25"
        fill="none"
        stroke="rgba(255,255,255,0.05)"
      />
      {/* center dot with slight vertical offset for optical centering */}
      <circle cx="32" cy="30.5" r="9.5" fill={`url(#${id}-gold)`} />
      {/* golden base line — the "today" horizon */}
      <rect x="14" y="46" width="36" height="1" fill="rgba(212, 175, 55, 0.6)" />
    </svg>
  );
}

interface WordmarkHTMLProps {
  variant: 'full' | 'short';
  title?: string | undefined;
  dotColor: string;
  wordColor: string;
  width?: SVGProps<SVGSVGElement>['width'] | undefined;
  height?: SVGProps<SVGSVGElement>['height'] | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/**
 * HTML wordmark. `width` is honored by picking a fontSize that matches
 * what the old SVG rendered at that width — callers pass the same
 * numeric `width` they used before (92, 96, 200, …) and the visual
 * size stays the same.
 *
 *   SVG: viewBox "0 0 200 28" rendered at width=W → text at 24*W/200.
 *   HTML: fontSize = W * 0.28 approximates that with generous padding
 *         for the `uppercase` GTO metrics.
 */
function WordmarkHTML({
  variant,
  title,
  dotColor,
  wordColor,
  width,
  height,
  className,
  style,
}: WordmarkHTMLProps) {
  const widthPx = toPx(width, variant === 'full' ? 200 : 120);
  const fontSize = widthPx * (variant === 'full' ? 0.23 : 0.36);
  const dotSize = fontSize * 0.17;
  // Visual centering against an uppercase cap-height baseline — the dot
  // sits a touch above the x-midline so it lines up with the center of
  // the capital "GTO" letters, not below them.
  const dotLift = fontSize * 0.33;

  const label = title ?? 'gto.today';
  const merged: CSSProperties = {
    fontSize,
    lineHeight: 1,
    letterSpacing: '-0.015em',
    color: wordColor,
    ...style,
  };

  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        'font-display inline-flex items-baseline whitespace-nowrap align-middle',
        className,
      )}
      style={{
        ...merged,
        gap: `${fontSize * 0.11}px`,
        height:
          height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
      }}
    >
      <span className="font-bold uppercase tracking-[-0.02em]">
        {variant === 'full' ? 'GTO' : 'G'}
      </span>
      <span
        aria-hidden
        className="inline-block rounded-full"
        style={{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          background: dotColor,
          transform: `translateY(-${dotLift}px)`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.25)',
        }}
      />
      <span className="font-light tracking-[-0.01em]">{variant === 'full' ? 'today' : 'T'}</span>
    </span>
  );
}

function toPx(v: SVGProps<SVGSVGElement>['width'], fallback: number): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const parsed = parseFloat(v);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function idFor(variant: LogoVariant): string {
  return `gto-logo-${variant}`;
}
