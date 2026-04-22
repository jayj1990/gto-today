import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '통계',
  description: '내 GTO 훈련 기록. 일별 정확도, 포지션별 성적.',
  openGraph: {
    title: '통계 · gto.today',
    description: '내 포커 훈련 기록을 한 눈에.',
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
