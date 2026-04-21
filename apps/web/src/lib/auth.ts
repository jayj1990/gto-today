import NextAuth, { type NextAuthResult, type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

/**
 * Auth.js v5 configuration.
 *
 * Env variables (set in .env.local + Vercel project settings):
 *   AUTH_SECRET           — random 32-byte base64 string
 *   AUTH_GOOGLE_ID        — Google OAuth client ID
 *   AUTH_GOOGLE_SECRET    — Google OAuth client secret
 *   KAKAO_CLIENT_ID       — Kakao REST API key (from Kakao developers)
 *   KAKAO_CLIENT_SECRET   — Kakao Client Secret (enabled in the 보안 panel)
 *   NAVER_CLIENT_ID       — Naver OAuth client ID
 *   NAVER_CLIENT_SECRET   — Naver OAuth client secret
 *   DATABASE_URL          — Neon Postgres connection string
 *
 * Kakao / Naver providers load only when both their _ID and _SECRET
 * are present so the app still boots locally with just Google keys.
 */
const providers: NextAuthConfig['providers'] = [Google];
if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
  providers.push(
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    }),
  );
}
if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
  providers.push(
    Naver({
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
    }),
  );
}

const result: NextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers,
  // Production debug on while we stabilise — writes full stack traces
  // to Vercel Function logs so we can see actual OAuth / adapter
  // failures instead of the generic 'server configuration' page.
  debug: true,
  trustHost: true,
  logger: {
    error(err) {
      console.error('[auth][error]', err);
    },
    warn(code) {
      console.warn('[auth][warn]', code);
    },
  },
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
