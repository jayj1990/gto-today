'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { SessionProvider, useSession } from 'next-auth/react';
import { useAuthStore, type AuthUser } from '@/lib/auth-store';

/**
 * Decide whether an Auth.js "unauthenticated" status should clear the
 * local zustand store. Guest sessions are invisible to Auth.js and must
 * be preserved — otherwise HomeGate loops the user back to /signin
 * after they tapped 나중에.
 *
 * Exported for direct unit testing so a future refactor of the sync
 * component can't silently reintroduce the loop.
 */
export function shouldMirrorSignOut(user: AuthUser | null): boolean {
  return user?.method !== 'guest';
}

/**
 * Keeps the local zustand `auth-store` in sync with the real NextAuth
 * session so existing pages that read `useAuthStore` (HomeGate,
 * SiteHeader, etc.) keep working without being rewritten. The NextAuth
 * session is the source of truth; zustand is a fast client-side mirror
 * for UI gating + the persisted `onboarded` flag.
 */
function SessionBridge({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();
  const setSignedIn = useAuthStore((s) => s.signIn);
  const setSignedOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated' && data?.user) {
      setSignedIn({
        method: 'google',
        name: data.user.name ?? '사용자',
        email: data.user.email ?? undefined,
        signedInAt: Date.now(),
      });
    } else if (status === 'unauthenticated') {
      const user = useAuthStore.getState().user;
      if (shouldMirrorSignOut(user)) {
        setSignedOut();
      }
    }
  }, [status, data, setSignedIn, setSignedOut]);

  return <>{children}</>;
}

export function SessionSync({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Tell framer-motion to honor the user's OS-level
          prefers-reduced-motion setting — without this, Motion
          animations still run for users who've asked not to see them.
          Our CSS keyframes already respect the media query via
          globals.css + tokens.css; this closes the framer-motion gap.
          `reducedMotion="user"` is the recommended setting per
          https://motion.dev/docs/accessibility. */}
      <MotionConfig reducedMotion="user">
        <SessionBridge>{children}</SessionBridge>
      </MotionConfig>
    </SessionProvider>
  );
}
