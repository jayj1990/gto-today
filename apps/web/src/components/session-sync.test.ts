import { describe, expect, it } from 'vitest';
import { shouldMirrorSignOut } from './session-sync';

/**
 * Regression suite for the 2026-04-24 signin-loop fix.
 *
 * Before the fix, SessionBridge unconditionally called setSignedOut()
 * when next-auth status flipped to 'unauthenticated'. Because a guest
 * 나중에 session is invisible to next-auth, every render after the
 * first one would wipe the guest from zustand → HomeGate saw
 * !authed → `router.replace('/signin')` → infinite loop.
 *
 * These tests lock the predicate that drives the fix.
 */
describe('shouldMirrorSignOut', () => {
  it('preserves guest sessions (the loop fix)', () => {
    expect(
      shouldMirrorSignOut({
        method: 'guest',
        name: '게스트',
        signedInAt: Date.now(),
      }),
    ).toBe(false);
  });

  it('mirrors sign-out for Google OAuth users', () => {
    expect(
      shouldMirrorSignOut({
        method: 'google',
        name: '테스터',
        email: 'jay@example.com',
        signedInAt: Date.now(),
      }),
    ).toBe(true);
  });

  it('mirrors sign-out for Apple / email methods too', () => {
    expect(
      shouldMirrorSignOut({
        method: 'apple',
        name: '테스터',
        signedInAt: Date.now(),
      }),
    ).toBe(true);
    expect(
      shouldMirrorSignOut({
        method: 'email',
        name: '테스터',
        signedInAt: Date.now(),
      }),
    ).toBe(true);
  });

  it('mirrors sign-out when no user is set (first load, clean state)', () => {
    expect(shouldMirrorSignOut(null)).toBe(true);
  });
});
