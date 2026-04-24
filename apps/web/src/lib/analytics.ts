'use client';

import { track as vercelTrack } from '@vercel/analytics';

/**
 * Thin wrapper around Vercel Analytics' `track()`. Gives us:
 *   - a single import path so every call site is greppable
 *   - a type-safe event catalogue (no stringly-typed events)
 *   - a graceful no-op in environments without the analytics script
 *     (SSR, unit tests, devtools content scripts, etc.)
 *
 * Why a catalogue: Vercel's dashboard shows top-N events by name.
 * Free-form strings mean typos fragment your funnel. Declaring the
 * union here also makes PII accidents hard — each event's payload
 * is typed to a small shape, nothing that rides a user identifier.
 */
export type AnalyticsEvent =
  | { name: 'daily_started'; props?: { resumed?: boolean } }
  | {
      name: 'answer_graded';
      props: { kind: 'preflop' | 'postflop'; grade: 'sharp' | 'acceptable' | 'wrong' };
    }
  | { name: 'explain_opened'; props: { cached: boolean } }
  | {
      name: 'signin_attempted';
      props: { method: 'google' | 'naver' | 'kakao' | 'email' | 'guest' };
    }
  | { name: 'install_prompt'; props: { action: 'shown' | 'installed' | 'dismissed' } };

export function track(event: AnalyticsEvent): void {
  try {
    vercelTrack(
      event.name,
      (event as { props?: Record<string, string | number | boolean> }).props ?? {},
    );
  } catch {
    // Vercel Analytics throws on bot UAs, content scripts, or when
    // the script never loaded (ad-blocker). Swallow — instrumentation
    // is never allowed to break the flow.
  }
}
