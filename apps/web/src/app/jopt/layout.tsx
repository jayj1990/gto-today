import type { Metadata, Viewport } from 'next';

// jopt.gto.today — JOPT 2026 Sapporo #02 원정 플래너 (Jay 개인 일정 포함, 검색 노출 금지).
export const metadata: Metadata = {
  title: 'JOPT SAPPORO 2026 · 원정 일정표',
  description: 'JOPT 2026 Sapporo #02 원정 일정표 — LEGO 미니어처 삿포로 렌더로 보는 하루 동선',
  robots: { index: false, follow: false },
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
