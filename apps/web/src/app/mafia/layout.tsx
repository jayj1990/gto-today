import type { Metadata, Viewport } from 'next';

// mafia.gto.today — 마피아 나이트 점수판(참가자 공개 링크, 검색 노출 금지).
const TITLE = '마피아 나이트 · 점수판';
const DESC = '한밤의 늑대인간·아발론·바퀴벌레 포커·피드 더 크라켄·사보타지 5게임 합산 순위와 상금.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    url: 'https://mafia.gto.today',
    siteName: 'mafia.gto.today',
    title: TITLE,
    description: DESC,
    locale: 'ko_KR',
  },
  twitter: { card: 'summary', title: TITLE, description: DESC },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0b0b0d',
};

export default function MafiaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
