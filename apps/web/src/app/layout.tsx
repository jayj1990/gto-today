import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { themeInitScript } from '@/lib/theme';
import { SessionSync } from '@/components/session-sync';

export const metadata: Metadata = {
  title: {
    default: 'gto.today — GTO, Today.',
    template: '%s · gto.today',
  },
  description: '매일 한 핸드, 더 나은 판단. 포커 GTO 가이드와 일일 훈련, AI 해설.',
  applicationName: 'gto.today',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://gto.today'),
  openGraph: {
    type: 'website',
    siteName: 'gto.today',
    title: 'gto.today — GTO, Today.',
    description: '매일 한 핸드, 더 나은 판단. 포커 GTO 가이드와 일일 훈련, AI 해설.',
    url: 'https://gto.today',
    locale: 'ko_KR',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'gto.today — 매일 한 핸드, 감이 아닌 솔버의 답.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'gto.today',
    description: '매일 한 핸드, 더 나은 판단.',
    images: ['/og.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-apple.png',
  },
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'gto.today',
    startupImage: ['/icon-apple.png'],
  },
  formatDetection: {
    // iOS: stop auto-linking phone numbers / emails / dates inside card text
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  // Accessibility: allow pinch-to-zoom. Some sites lock this for UX
  // reasons but we value readability more.
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0E3B2E' },
    { media: '(prefers-color-scheme: light)', color: '#F4EFE6' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="min-h-dvh antialiased">
        <SessionSync>{children}</SessionSync>
      </body>
    </html>
  );
}
