import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '올인/폴드 20BB',
  description:
    '토너먼트 숏스택 (20BB 이하) 올인·폴드 Nash equilibrium 차트. 포지션별 올인 레인지.',
  openGraph: {
    title: '올인/폴드 20BB · gto.today',
    description: '숏스택 Nash 차트 — 위치 바꿔 가며 올인/폴드 결정 연습.',
  },
};

export default function PushFoldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
