import * as Sentry from '@sentry/nextjs';

// Browser-side Sentry. Only activates when NEXT_PUBLIC_SENTRY_DSN is
// set at build time; otherwise this module is a no-op and contributes
// zero runtime cost (Sentry.init just returns early).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Conservative sample rates — we're a small app and don't want to
    // burn Sentry quota on noise. Bump these once we have volume.
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    debug: false,
    environment: process.env.NODE_ENV,
  });
}
