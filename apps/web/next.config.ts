import { join } from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@gto/ui', '@gto/poker-core', '@gto/gto-data'],
  // Workspace root so Next's tracer (nft) walks up to the hoisted
  // pnpm node_modules instead of stopping at apps/web.
  outputFileTracingRoot: join(process.cwd(), '../..'),
  // Keep the WASM solver external to the Function bundle so Vercel
  // ships the .wasm binary alongside node_modules instead of trying
  // to pack it through Webpack (which would 404 the runtime fetch).
  serverExternalPackages: ['@jayj1990/gto-today-solver-wasm'],
  // The wasm-pack nodejs wrapper loads the binary at init time via
  // readFileSync(__dirname + '/..._bg.wasm'). Next.js doesn't trace
  // sibling .wasm files of an external package automatically, so we
  // tell it explicitly to include the whole package in the Function
  // output for /api/live-solve. Paths are relative to outputFileTracingRoot.
  outputFileTracingIncludes: {
    '/api/live-solve': [
      'node_modules/.pnpm/@jayj1990+gto-today-solver-wasm@*/node_modules/@jayj1990/gto-today-solver-wasm/**',
      'node_modules/@jayj1990/gto-today-solver-wasm/**',
    ],
  },
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

export default nextConfig;
