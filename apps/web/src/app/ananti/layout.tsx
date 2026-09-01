import type { Metadata, Viewport } from 'next';

// ananti.gto.today — Jay 전용 예약 선점 도구. 검색 노출 금지.
// 홈화면 추가 시 GTO 아이콘이 아니라 아난티 아이콘이 뜨도록
// 이 세그먼트에서 manifest/icons 를 통째로 덮어쓴다.
export const metadata: Metadata = {
  title: 'ANANTI KEEPER',
  description: '아난티 객실 예약 선점 도구',
  robots: { index: false, follow: false },
  manifest: '/ananti/manifest.webmanifest',
  icons: {
    icon: [{ url: '/ananti/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/ananti/apple-icon.png' }],
  },
  appleWebApp: { capable: true, title: 'ANANTI', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#5ad0c4',
};

export default function AnantiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 아난티가 쓰는 Pretendard 를 그대로. 사이트 전역 폰트와 분리하려고 여기서만 로드 */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
      />
      {children}
    </>
  );
}
