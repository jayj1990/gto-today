import type { SVGProps } from 'react';
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
 * gto.today logo — pure SVG, scalable, theme-aware via currentColor.
 *
 * Variants:
 *  - full  — "GTO·today" horizontal wordmark
 *  - short — "G·T" (app shelf, small spaces)
 *  - dot   — just the gold middle dot (favicon, loading, inline)
 *  - mark  — stacked composition inside a rounded square, ready for app icons
 */
export function Logo({
  variant = 'full',
  title,
  dotColor = 'var(--color-accent, #D4AF37)',
  wordColor = 'currentColor',
  className,
  ...rest
}: LogoProps) {
  const id = idFor(variant);

  if (variant === 'dot') {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label={title ?? 'gto.today mark'}
        className={cn('inline-block align-middle', className)}
        {...rest}
      >
        <title id={id}>{title ?? 'gto.today'}</title>
        <circle cx="12" cy="12" r="5.25" fill={dotColor} />
      </svg>
    );
  }

  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 64 64"
        role="img"
        aria-label={title ?? 'gto.today'}
        className={cn('inline-block align-middle', className)}
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

  if (variant === 'short') {
    // Hand-tuned geometry: "G·T" — 72 units wide, 28 tall.
    return (
      <svg
        viewBox="0 0 72 28"
        role="img"
        aria-label={title ?? 'gto.today'}
        className={cn('inline-block align-middle', className)}
        {...rest}
      >
        <title id={id}>{title ?? 'gto.today'}</title>
        <text
          x="0"
          y="22"
          fill={wordColor}
          fontFamily="var(--font-display, Inter), system-ui, sans-serif"
          fontWeight={700}
          fontSize={24}
          letterSpacing="-0.02em"
        >
          G
        </text>
        <circle cx="36" cy="16" r="3.5" fill={dotColor} />
        <text
          x="52"
          y="22"
          fill={wordColor}
          fontFamily="var(--font-display, Inter), system-ui, sans-serif"
          fontWeight={700}
          fontSize={24}
          letterSpacing="-0.02em"
        >
          T
        </text>
      </svg>
    );
  }

  // full: "GTO·today"
  return (
    <svg
      viewBox="0 0 200 28"
      role="img"
      aria-label={title ?? 'gto.today'}
      className={cn('inline-block align-middle', className)}
      {...rest}
    >
      <title id={id}>{title ?? 'gto.today'}</title>
      <text
        x="0"
        y="22"
        fill={wordColor}
        fontFamily="var(--font-display, Inter), system-ui, sans-serif"
        fontWeight={700}
        fontSize={24}
        letterSpacing="-0.02em"
      >
        GTO
      </text>
      <circle cx="60" cy="16" r="3.5" fill={dotColor} />
      <text
        x="72"
        y="22"
        fill={wordColor}
        fontFamily="var(--font-display, Inter), system-ui, sans-serif"
        fontWeight={400}
        fontSize={24}
        letterSpacing="-0.01em"
      >
        today
      </text>
    </svg>
  );
}

function idFor(variant: LogoVariant): string {
  return `gto-logo-${variant}`;
}
