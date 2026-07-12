import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GTO 스터디',
  description: '프리플랍 액션 트리를 탐색하면서 포지션별 GTO 차트를 그 자리에서 확인.',
  openGraph: {
    title: 'GTO 스터디 · gto.today',
    description: '프리플랍 트리 · 포지션별 GTO 차트.',
  },
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
