import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { themeInitScript } from '@/lib/theme';
import { SessionSync } from '@/components/session-sync';
import { InstallPrompt } from '@/components/install-prompt';
import { BottomNav } from '@/components/bottom-nav';

export const metadata: Metadata = {
  title: {
    default: 'gto.today — 매일 쌓이는 실력, 후회 없는 액션',
    template: '%s · gto.today',
  },
  description: '하루 5분의 GTO 훈련. 오늘의 답을 내일의 감으로 바꾸는 포커 루틴.',
  applicationName: 'gto.today',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://gto.today'),
  openGraph: {
    type: 'website',
    siteName: 'gto.today',
    title: 'gto.today — 매일 쌓이는 실력, 후회 없는 액션',
    description: '하루 5분의 GTO 훈련. 오늘의 답을 내일의 감으로 바꾸는 포커 루틴.',
    url: 'https://gto.today',
    locale: 'ko_KR',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'gto.today — GTO 훈련으로 후회없는 액션.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'gto.today — 매일 쌓이는 실력, 후회 없는 액션',
    description: '하루 5분의 GTO 훈련. 오늘의 답을 내일의 감으로 바꾸는 포커 루틴.',
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
      <body className="min-h-dvh pb-14 antialiased md:pb-0">
        <SessionSync>{children}</SessionSync>
        <BottomNav />
        <InstallPrompt />
      </body>
    </html>
  );
}
