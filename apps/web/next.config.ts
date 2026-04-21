import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@gto/ui', '@gto/poker-core', '@gto/gto-data'],
  // Switching solver-wasm to wasm-pack --target bundler so Webpack
  // handles the .wasm import via its native asyncWebAssembly flow
  // (no readFileSync + __dirname path resolution to fight). That
  // means we enable the experiment in the Function compiler too.
  webpack(config) {
    config.experiments = {
      ...(config.experiments ?? {}),
      asyncWebAssembly: true,
    };
    return config;
  },
  // With asyncWebAssembly, Webpack emits the hashed
  // ".next/server/static/wasm/<hash>.wasm" alongside the chunk
  // that imports it, but Vercel's Function packager doesn't
  // auto-include anything under `.next/server/static/` in the
  // Function output — only chunks/ and vendor-chunks/. Name it
  // explicitly so the binary ships with /api/live-solve.
  outputFileTracingIncludes: {
    '/api/live-solve': ['.next/server/**/*.wasm'],
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
