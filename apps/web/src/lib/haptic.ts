/**
 * Thin wrapper around `navigator.vibrate` so haptic calls don't pile
 * up as try/catch noise at every call site.
 *
 *   success → crisp single 20ms pulse (정답)
 *   light   → 12ms tick (토스트, 체크)
 *   warn    → 두 번 떨림 (차선)
 *   error   → 오답용 세 번 떨림
 *
 * `navigator.vibrate` is a no-op (silently) on iOS Safari, so we don't
 * need a platform check — just call it. Respects prefers-reduced-motion
 * via the system setting when available.
 */
export type HapticKind = 'success' | 'light' | 'warn' | 'error';

const PATTERNS: Record<HapticKind, number | number[]> = {
  success: 20,
  light: 12,
  warn: [24, 30, 24],
  error: [40, 30, 40],
};

export function haptic(kind: HapticKind): void {
  if (typeof window === 'undefined') return;
  try {
    // User may prefer reduced motion — browsers that support both
    // respect it for vibration as well, but be explicit for the ones
    // that don't.
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mq?.matches) return;
    const nav = window.navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
    nav.vibrate?.(PATTERNS[kind]);
  } catch {
    /* ignore — vibrate isn't critical UX */
  }
}
