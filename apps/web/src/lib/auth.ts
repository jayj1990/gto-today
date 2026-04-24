import NextAuth, { type NextAuthResult, type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import Resend from 'next-auth/providers/resend';
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
 *   AUTH_RESEND_KEY       — Resend API key for email magic links
 *   AUTH_EMAIL_FROM       — `From` address for magic-link mail
 *   DATABASE_URL          — Neon Postgres connection string
 *
 * Every non-Google provider loads only when its secrets are all
 * present — the app still boots locally with just Google + guest.
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
// Email magic link via Resend — Auth.js writes a VerificationToken
// row, Resend mails a signed URL, click = signin. Falls back to the
// default Auth.js email template; a branded template lands in a later
// pass once we have designs for the mail body.
if (process.env.AUTH_RESEND_KEY && process.env.AUTH_EMAIL_FROM) {
  providers.push(
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM,
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
