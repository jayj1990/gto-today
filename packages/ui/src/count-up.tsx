'use client';

import { useEffect, useRef, useState } from 'react';
import { easeQuart } from './motion';

export interface CountUpProps {
  value: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Animates a number from its previous value to the current one.
 * Uses requestAnimationFrame — zero dependencies beyond React.
 * Respects prefers-reduced-motion (jumps directly to target).
 */
export function CountUp({
  value,
  durationMs = 400,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }

    const from = fromRef.current;
    const to = value;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // Cubic-bezier ≈ easeOutQuart approximation using Math equivalent
      const eased = bezierY(easeQuart, t);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// Solve a cubic-bezier at t for the y value. cubic-bezier(p1x,p1y,p2x,p2y)
// For our ease presets we only care about the y-output at progress t.
// This is a small, allocation-free approximation good enough for UI.
function bezierY(curve: readonly [number, number, number, number], t: number): number {
  const [, p1y, , p2y] = curve;
  const mt = 1 - t;
  // B(t) for y: 3(1-t)^2·t·p1y + 3(1-t)·t²·p2y + t³
  return 3 * mt * mt * t * p1y + 3 * mt * t * t * p2y + t * t * t;
}
