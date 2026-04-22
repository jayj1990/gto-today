import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '무한 GTO 훈련',
  description:
    '오늘의 10핸드를 다 풀었다면 계속 이어서. 랜덤 스팟으로 감 유지.',
  openGraph: {
    title: '무한 GTO 훈련 · gto.today',
    description: '랜덤 GTO 스팟 무한 반복. 정확도와 연속 기록을 쌓아요.',
  },
};

export default function SimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
