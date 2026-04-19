import type { SVGProps } from 'react';
import { cn } from './cn';

export interface LogoProps {
  variant?: 'full' | 'short' | 'dot';
  className?: string;
  ariaLabel?: string;
}

/**
 * gto.today wordmark.
 * - `full` renders "GTO·today" with the middle dot in gold
 * - `short` renders "G·T"
 * - `dot` renders just the middle dot glyph (for app icon, favicon, loading)
 *
 * Colors are applied via CSS variables, not hex, so theme swaps work.
 */
export function Logo({ variant = 'full', className, ariaLabel }: LogoProps) {
  if (variant === 'dot') {
    return (
      <span
        role="img"
        aria-label={ariaLabel ?? 'gto.today mark'}
        className={cn('inline-block text-gold', className)}
      >
        <Dot />
      </span>
    );
  }

  if (variant === 'short') {
    return (
      <span
        aria-label={ariaLabel ?? 'gto.today'}
        className={cn(
          'inline-flex items-baseline font-display text-[color:var(--color-fg)] tracking-[-0.02em]',
          className,
        )}
      >
        <span className="font-bold">G</span>
        <Dot className="mx-[0.08em]" />
        <span className="font-bold">T</span>
      </span>
    );
  }

  return (
    <span
      aria-label={ariaLabel ?? 'gto.today'}
      className={cn(
        'inline-flex items-baseline font-display text-[color:var(--color-fg)] tracking-[-0.02em]',
        className,
      )}
    >
      <span className="font-bold uppercase">GTO</span>
      <Dot className="mx-[0.12em]" />
      <span className="font-normal lowercase">today</span>
    </span>
  );
}

function Dot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 10 10"
      width="0.5em"
      height="0.5em"
      aria-hidden
      focusable={false}
      {...props}
      className={cn('inline-block fill-gold self-center', props.className)}
    >
      <circle cx="5" cy="5" r="4" />
    </svg>
  );
}
