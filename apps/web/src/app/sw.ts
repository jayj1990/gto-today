// Service-worker global + DOM lib needed for self + fetch/Response types.
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, NetworkOnly, StaleWhileRevalidate, CacheFirst, ExpirationPlugin } from 'serwist';

// Serwist injects the precache manifest at build time.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Service worker for gto.today.
 *
 * Runtime caching rules, in order of specificity:
 *
 * 1. `/api/**` — network-only. Auth, AI explain, debug probes must never
 *    be served from cache; stale answers / broken sessions = bad UX.
 * 2. `/data/preflop/**` — stale-while-revalidate. The 100-300KB JSON
 *    files rarely change; serving the cache instantly + refreshing in
 *    the background makes repeat visits feel native-app-fast while
 *    still letting new solver batches propagate within ~1 minute.
 * 3. `/fonts/**` + `/logos/**` + `/ai-assets/**` — cache-first with 1-year
 *    expiration. Self-hosted font files and logo PNGs never change once
 *    deployed; the filename-hashing pipeline handles cache-busting.
 * 4. Everything else falls through to Serwist's `defaultCache` (Next's
 *    sensible default: NetworkFirst for pages, with HTML offline
 *    fallback).
 *
 * Development: this file still compiles but the sw is not registered —
 * next.config.ts flips `disable: true` when NODE_ENV === 'development'
 * so HMR doesn't fight stale SW caches.
 */
const serwist = new Serwist({
  // `exactOptionalPropertyTypes` rejects passing `undefined` here even
  // though Serwist treats it identically to an empty array at runtime.
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/'),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith('/data/preflop/'),
      handler: new StaleWhileRevalidate({
        cacheName: 'gto-preflop-data',
        plugins: [new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 })],
      }),
    },
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/fonts/') ||
        url.pathname.startsWith('/logos/') ||
        url.pathname.startsWith('/ai-assets/'),
      handler: new CacheFirst({
        cacheName: 'gto-static-assets',
        plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 })],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();
