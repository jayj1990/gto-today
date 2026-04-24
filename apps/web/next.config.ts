import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

const withSerwist = withSerwistInit({
  // Service worker source (TS) and public-output path.
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // Register + activate the SW eagerly so returning users pick up the
  // latest offline bundle without waiting for the next idle tick.
  register: true,
  reloadOnOnline: true,
  // Skip SW entirely in `pnpm dev` — Turbopack + service-worker caching
  // fights HMR and confuses the "what version am I looking at?" mental
  // model during day-to-day coding.
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@gto/ui', '@gto/poker-core', '@gto/gto-data'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/fonts/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default withSerwist(nextConfig);
