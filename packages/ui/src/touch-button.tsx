'use client';

import { forwardRef, useRef } from 'react';
import type { ButtonHTMLAttributes, MouseEvent as ReactMouseEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from './cn';
import { pressScale } from './motion';

export interface TouchButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onAnimationEnd' | 'onDragStart' | 'onDragEnd' | 'onDrag'
> {
  /** Visual variant. Primary = gold CTA, secondary = outline, ghost = bare. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Size, matches the brand scale. CTA=56px, regular=44px (min touch target). */
  size?: 'cta' | 'regular' | 'compact';
  /** Debounce window in ms to ignore double-fires from simultaneous pointers. */
  touchDebounceMs?: number;
}

const VARIANT: Record<NonNullable<TouchButtonProps['variant']>, string> = {
  primary:
    'bg-gold-gradient text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)]',
  secondary: 'border-hair surface-raised text-fg hover:bg-[color:var(--color-surface-raised)]',
  ghost: 'text-fg-muted hover:text-fg',
};

const SIZE: Record<NonNullable<TouchButtonProps['size']>, string> = {
  cta: 'h-14 px-6 text-[15px] font-semibold',
  regular: 'h-11 px-4 text-[14px] font-medium',
  compact: 'h-9 px-3 text-[13px]',
};

/**
 * Mobile-first button:
 *  - No 300ms delay (touch-action: manipulation)
 *  - Multi-touch safe: uses onClick (normalized across pointers) + a tiny
 *    debounce guarding against ghost clicks when two fingers land at once
 *  - Framer whileTap scale provides tactile feedback (no sticky hover on touch)
 *  - Preserves focus-visible ring for keyboards
 */
export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(function TouchButton(
  {
    variant = 'primary',
    size = 'regular',
    touchDebounceMs = 180,
    onClick,
    className,
    children,
    disabled,
    type,
    ...rest
  },
  ref,
) {
  const lastFireRef = useRef(0);

  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const now = performance.now();
    if (now - lastFireRef.current < touchDebounceMs) return;
    lastFireRef.current = now;
    onClick?.(e);
  };

  // We only pass whitelisted props to motion.button to keep types narrow.
  const { 'aria-label': ariaLabel, 'aria-pressed': ariaPressed, id, name, value, form } = rest;

  return (
    <motion.button
      ref={ref}
      type={type ?? 'button'}
      whileTap={pressScale}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      id={id}
      name={name}
      value={value}
      form={form}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-[var(--radius-button)]',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-quart)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
    >
      {children}
    </motion.button>
  );
});
