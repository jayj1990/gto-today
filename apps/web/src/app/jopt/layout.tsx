import type { Metadata, Viewport } from 'next';

// jopt.gto.today — JOPT 2026 Sapporo #02 원정 플래너 (Jay 개인 일정 포함, 검색 노출 금지).
const TITLE = 'JOPT SAPPORO 2026 · 원정 일정표';
const DESC =
  '9/22 자유일 동선 — 숙소 옆 토리톤 스시, 니조시장, 오도리 산책, 파르코·미츠코시, 19:30 샤브샤브, 위스키, 밤 홀덤 캐시게임. 지도·전화·면세 정보까지 한 페이지.';
const OG = 'https://jopt.gto.today/jopt/og.jpg';

// 링크 미리보기(카톡·아이메시지)가 루트의 gto.today OG 를 물려받아 엉뚱하게 떴다(2026-09-22 Jay).
// 중첩 레이아웃의 openGraph/twitter 는 통째로 덮어쓰므로 여기서 전부 지정한다.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    url: 'https://jopt.gto.today',
    siteName: 'jopt.gto.today',
    title: TITLE,
    description: DESC,
    locale: 'ko_KR',
    images: [{ url: OG, width: 1200, height: 630, alt: 'JOPT SAPPORO 2026 원정 일정표' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: [OG],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0B5B9F',
};

export default function JoptLayout({ children }: { children: React.ReactNode }) {
  return children;
}
