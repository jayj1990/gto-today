import withSerwistInit from '@serwist/next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

// `ANALYZE=true pnpm build` → opens interactive chunk treemap report
// at .next/analyze/*.html. No effect on normal builds.
const withAnalyzer = withBundleAnalyzer({ enabled: process.env['ANALYZE'] === 'true' });

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
    // The generated solver-spots dataset in @gto/gto-data is tens of MB
    // of TS that webpack parses in both server and client compilations,
    // and it grows with every Windows solver batch. Trade build speed
    // for headroom so the build container doesn't get OOM-killed.
    webpackMemoryOptimizations: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Remote hosts we serve profile pictures from. Matches the
    // CSP img-src allowlist in the headers() block below.
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'ssl.pstatic.net' },
      { protocol: 'https', hostname: '*.kakaocdn.net' },
    ],
  },
  async rewrites() {
    // dabin.gto.today — 교정지 전용 서브도메인.
    //   루트로 들어온 요청만 교정지 경로로 넘긴다. 토큰은 주소창에 드러나지 않고,
    //   /api/proof/* · /_next/* 같은 나머지 경로는 같은 배포를 그대로 탄다.
    //   포커 앱 라우트도 이 호스트에서 열리긴 하지만 알려줄 주소가 루트뿐이라 둔다.
    //   beforeFiles 여야 한다. 배열로 반환하면 afterFiles 로 들어가는데,
    //   afterFiles 는 매칭되는 페이지가 없을 때만 돌아서 실제 파일이 있는 "/" 에서는
    //   영영 걸리지 않는다(포커 홈이 그대로 떴다).
    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'host' as const, value: 'dabin.gto.today' }],
          destination: '/proof/dabin-7b248b5dd5f3180d03d0618a',
        },
        {
          // ananti.gto.today — 아난티 예약 선점 도구(Jay 전용, /ananti).
          //   같은 이유로 beforeFiles. API 는 /api/ananti/* 그대로 탄다.
          source: '/',
          has: [{ type: 'host' as const, value: 'ananti.gto.today' }],
          destination: '/ananti',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    // Baseline hardening headers.
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
      // HSTS — one year, include subdomains, preload-eligible. Vercel
      // already sets a weaker one; ours overrides. Only meaningful
      // over HTTPS which production is.
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      // COOP — isolates our top-level window from cross-origin popups
      // (e.g. OAuth). Required for the `crossOriginIsolated` flag and
      // scores a point in Lighthouse Best Practices.
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    ];

    // Content-Security-Policy — shipped in Report-Only mode first so
    // violations stream to the browser console (and to our Sentry
    // integration) without blocking real user traffic. Tune the source
    // lists based on what reports say, then promote to enforcing by
    // swapping the header name.
    //
    // Origin sources covered:
    //   self               — Next pages + /api routes + static assets
    //   'unsafe-inline'    — Next hydration + Tailwind inline styles
    //   'unsafe-eval'      — required by some Next internal chunks +
    //                        framer-motion in dev builds
    //   vercel analytics   — va.vercel-scripts.com + *-insights.com
    //   vercel live        — preview comments
    //   OAuth redirects    — accounts.google.com, nid.naver.com,
    //                        kauth.kakao.com (form-action only)
    //   avatar images      — googleusercontent + pstatic.net
    //   sentry             — *.sentry.io (ingest + cdn)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://*.vercel-insights.com https://vercel.live",
      // jsdelivr(Pretendard) + cdn.ananti.kr(객실 썸네일) — /ananti 전용 페이지가 쓴다.
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "img-src 'self' data: blob: https://lh3.googleusercontent.com https://ssl.pstatic.net https://*.kakaocdn.net https://cdn.ananti.kr",
      "font-src 'self' data: https://cdn.jsdelivr.net",
      "connect-src 'self' https://*.vercel-insights.com https://vitals.vercel-insights.com https://vercel.live wss://ws-us3.pusher.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
      "frame-src 'self' https://vercel.live",
      "frame-ancestors 'none'",
      "form-action 'self' https://accounts.google.com https://nid.naver.com https://kauth.kakao.com",
      "base-uri 'self'",
      "object-src 'none'",
      // `upgrade-insecure-requests` intentionally omitted — browsers
      // ignore it under Report-Only (a console warning fires on
      // every pageview otherwise). Add it back when we promote the
      // header from Report-Only to enforcing.
      // Browsers POST JSON violation reports here — see
      // apps/web/src/app/api/csp-report/route.ts. Legacy `report-uri`
      // is still honored by Chromium/Safari; the newer Reporting-API
      // equivalent needs a Report-To header pairing which we skip
      // until we're ready to ingest into Sentry.
      'report-uri /api/csp-report',
    ].join('; ');

    return [
      {
        source: '/fonts/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(.*)',
        headers: [...securityHeaders, { key: 'Content-Security-Policy-Report-Only', value: csp }],
      },
    ];
  },
};

export default withAnalyzer(withSerwist(nextConfig));
