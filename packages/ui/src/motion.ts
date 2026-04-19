/**
 * Framer Motion presets for gto.today.
 *
 * Shared variants + transitions so every surface gets the same feel.
 * All presets auto-neutralize under prefers-reduced-motion because the
 * underlying CSS variables read from tokens.css (which zero the durations).
 *
 * Consumers import `motion` from 'framer-motion' directly and pass these
 * as `variants={...}` / `transition={...}`.
 */
import type { Transition, Variants } from 'framer-motion';

// ── Easings (match tokens.css) ───────────────────────────────────────────
export const easeQuart = [0.22, 1, 0.36, 1] as const;
export const easeSpring = [0.34, 1.56, 0.64, 1] as const;

// ── Durations (seconds, to match Framer Motion's unit) ───────────────────
export const duration = {
  instant: 0.08,
  fast: 0.18,
  base: 0.24,
  decisive: 0.32,
  flip: 0.48,
  countup: 0.4,
  mixBar: 0.6,
} as const;

// ── Card dealing ─────────────────────────────────────────────────────────
// Stagger deal: each card slides + tilts from the deck position into its slot.
export const dealContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

export const dealCard: Variants = {
  hidden: {
    y: -60,
    x: -10,
    rotate: -8,
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    y: 0,
    x: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: duration.decisive,
      ease: easeQuart,
    },
  },
};

// ── Card flip (face-down → face-up) ──────────────────────────────────────
export const flipVariants: Variants = {
  down: { rotateY: 180 },
  up: { rotateY: 0 },
};

export const flipTransition: Transition = {
  duration: duration.flip,
  ease: easeQuart,
};

// ── Mix bar fill ─────────────────────────────────────────────────────────
// Left-to-right clip fill — used for GTO mix percentages.
export const mixBarFill: Variants = {
  empty: { clipPath: 'inset(0 100% 0 0)' },
  full: (pct: number) => ({
    clipPath: `inset(0 ${100 - pct}% 0 0)`,
    transition: {
      duration: duration.mixBar,
      ease: easeQuart,
    },
  }),
};

// ── Chip toss (celebration replacing confetti) ───────────────────────────
export const chipToss: Variants = {
  rest: { y: 0, rotate: 0, opacity: 1 },
  toss: (i: number) => ({
    y: [-40 - i * 8, 20],
    x: (i - 2) * 14,
    rotate: [0, 360 + i * 40],
    opacity: [1, 0],
    transition: {
      duration: 0.9 + i * 0.05,
      ease: easeQuart,
    },
  }),
};

// ── Sheet / modal ────────────────────────────────────────────────────────
export const sheetUp: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: duration.decisive, ease: easeQuart },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: duration.base, ease: easeQuart },
  },
};

export const fadeUp: Variants = {
  hidden: { y: 8, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: duration.base, ease: easeQuart },
  },
};

// ── Button press feedback (use on whileTap) ──────────────────────────────
export const pressScale = { scale: 0.96 };

// ── Count-up helper ──────────────────────────────────────────────────────
// Smoothly animate a numeric value from 0 → target.
export interface CountUpOptions {
  from?: number;
  to: number;
  durationMs?: number;
  format?: (value: number) => string;
}
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}
