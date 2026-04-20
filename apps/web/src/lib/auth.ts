import NextAuth, { type NextAuthResult } from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

/**
 * Auth.js v5 configuration.
 *
 * Phase 4 ships Google OAuth only — Kakao and Naver land in the next
 * iteration (same adapter, same session model, just extra providers).
 *
 * Env variables (set in .env.local + Vercel project settings):
 *   AUTH_SECRET           — random 32-byte base64 string
 *   AUTH_GOOGLE_ID        — Google OAuth client ID
 *   AUTH_GOOGLE_SECRET    — Google OAuth client secret
 *   DATABASE_URL          — Neon Postgres connection string
 *
 * The AUTH_* prefix is Auth.js v5's magical naming convention — the
 * framework picks them up automatically for the matching provider.
 */
const result: NextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [Google],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    // Expose the database user id on the session so the rest of the app
    // can key streaks/history by a stable id instead of email.
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});

// Only re-export the pieces consumed on the server. `signIn` / `signOut`
// are imported directly from `next-auth/react` in client components and
// tripping TS's portability checker isn't worth exporting them here.
export const handlers = result.handlers;
export const auth = result.auth;
