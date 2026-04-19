'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Minimal client-side auth store for the pre-Auth.js-v5 milestone.
 *
 * Three lifecycle bits:
 *   - onboarded: user has seen the 3-slide onboarding flow
 *   - signedIn: user has completed a sign-in (real or guest)
 *   - user: display name + optional avatar/email
 *
 * Phase 6 will replace this with real Auth.js sessions; the public API here
 * is small on purpose so we can swap the backing store without touching
 * every page.
 */

export type AuthMethod = 'google' | 'apple' | 'email' | 'guest';

export interface AuthUser {
  readonly method: AuthMethod;
  readonly name: string;
  readonly email?: string | undefined;
  readonly signedInAt: number;
}

interface AuthStore {
  onboarded: boolean;
  signedIn: boolean;
  user: AuthUser | null;
  setOnboarded: () => void;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      onboarded: false,
      signedIn: false,
      user: null,
      setOnboarded: () => set({ onboarded: true }),
      signIn: (user) => set({ signedIn: true, user, onboarded: true }),
      signOut: () => set({ signedIn: false, user: null }),
    }),
    {
      name: 'gto.auth',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
