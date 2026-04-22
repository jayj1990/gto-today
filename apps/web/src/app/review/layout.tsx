import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '복습 모드',
  description: '지금까지 틀린 스팟을 모아서 다시 풀어봐요.',
  openGraph: {
    title: '복습 모드 · gto.today',
    description: '오답만 다시. 이해될 때까지.',
  },
};

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
