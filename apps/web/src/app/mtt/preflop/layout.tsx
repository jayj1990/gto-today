import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MTT 프리플랍 차트 · 9맥스',
  description:
    '9맥스 토너먼트 프리플랍 차트 — 100/40/25bb 오픈, SB 플레이, 오픈 대응, BB 디펜스, 림프, 리잼을 포지션별로. 20/10bb 는 올인·폴드 Nash 차트.',
  openGraph: {
    title: 'MTT 프리플랍 차트 · gto.today',
    description:
      '9맥스 토너먼트 스택 뎁스별 프리플랍 차트 (100·40·25·20·10bb) — 오픈부터 3벳 대응, 리잼까지.',
  },
};

export default function MttPreflopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
