import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { themeInitScript } from '@/lib/theme';

export const metadata: Metadata = {
  title: {
    default: 'gto.today — GTO, Today.',
    template: '%s · gto.today',
  },
  description: '매일 한 스팟. 더 나은 판단. Poker GTO guide, daily training, and AI explanations.',
  applicationName: 'gto.today',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://gto.today'),
  openGraph: {
    type: 'website',
    siteName: 'gto.today',
    title: 'gto.today — GTO, Today.',
    description: 'One spot. Every day. Better judgment.',
    url: 'https://gto.today',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'gto.today',
    description: 'GTO, Today.',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-apple.png',
  },
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'gto.today',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
