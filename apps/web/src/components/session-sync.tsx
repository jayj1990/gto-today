'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/auth-store';

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
      setSignedOut();
    }
  }, [status, data, setSignedIn, setSignedOut]);

  return <>{children}</>;
}

export function SessionSync({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionBridge>{children}</SessionBridge>
    </SessionProvider>
  );
}
