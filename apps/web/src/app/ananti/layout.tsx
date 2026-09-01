import type { Metadata, Viewport } from 'next';

// ananti.gto.today — Jay 전용 예약 선점 도구. 검색 노출 금지.
export const metadata: Metadata = {
  title: 'ANANTI KEEPER',
  description: '아난티 객실 예약 선점 도구',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function AnantiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 아난티가 쓰는 Pretendard 를 그대로. 사이트 전역 폰트와 분리하려고 여기서만 로드 */}
      {}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
      />
      {children}
    </>
  );
}
