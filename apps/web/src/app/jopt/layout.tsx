import type { Metadata, Viewport } from 'next';

// jopt.gto.today — JOPT 2026 Sapporo #02 원정 플래너 (Jay 개인 일정 포함, 검색 노출 금지).
export const metadata: Metadata = {
  title: 'JOPT SAPPORO 2026 · LEGO 원정 플래너',
  description:
    'JOPT 2026 Sapporo #02 원정 일정을 LEGO 미니어처 삿포로 3D 맵으로 보는 인터랙티브 플래너',
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
