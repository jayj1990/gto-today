import * as Sentry from '@sentry/nextjs';

// Server-side (Node.js Vercel Functions) Sentry. Uses SENTRY_DSN
// (server-only) or falls through to NEXT_PUBLIC_SENTRY_DSN if the
// server value isn't set separately. No-op when neither exists.
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    debug: false,
    environment: process.env.NODE_ENV,
  });
}
