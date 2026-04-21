// Next.js 15 instrumentation hook. Gets called once per runtime
// (node / edge) at server startup. We delegate to the matching
// Sentry config file so client/server configs stay logically
// separate even when @sentry/nextjs prefers this single entry.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export async function onRequestError(
  err: unknown,
  request: Request,
  context: { routerKind: 'Pages Router' | 'App Router'; routePath: string },
) {
  if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureRequestError(err, request, context);
  }
}
