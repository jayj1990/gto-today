import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@gto/ui', '@gto/poker-core', '@gto/gto-data'],
  // Switching solver-wasm to wasm-pack --target bundler so Webpack
  // handles the .wasm import via its native asyncWebAssembly flow
  // (no readFileSync + __dirname path resolution to fight). That
  // means we enable the experiment in the Function compiler too.
  webpack(config, { isServer }) {
    config.experiments = {
      ...(config.experiments ?? {}),
      asyncWebAssembly: true,
    };
    // Vercel's Function packager auto-includes `.next/server/chunks/`
    // but NOT `.next/server/static/wasm/` where asyncWebAssembly
    // otherwise lands binaries. Redirect the server bundle's .wasm
    // output into chunks/ so the binary ships with the Function
    // (and the hashed filename in the emitted chunk still points
    // at the right place). Client bundle is unaffected.
    if (isServer) {
      config.output = config.output ?? {};
      config.output.webassemblyModuleFilename = 'chunks/[id].[contenthash].wasm';
    }
    return config;
  },
  // Belt-and-suspenders — even if the webpack redirect misses, this
  // explicitly traces any .wasm under the server build tree into
  // the live-solve Function.
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
