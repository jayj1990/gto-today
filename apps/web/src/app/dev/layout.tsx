import type { Metadata, Viewport } from 'next';

// /dev/* is for internal design spelunking — never meant to rank, never
// meant for real users. Block search engines and social unfurl crawlers
// at the layout level so every child inherits it without repeating the
// boilerplate per page.
export const metadata: Metadata = {
  title: { default: 'dev · gto.today', template: '%s · dev · gto.today' },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  other: { 'og:disabled': 'true' },
};

export const viewport: Viewport = {
  themeColor: '#0E3B2E',
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
