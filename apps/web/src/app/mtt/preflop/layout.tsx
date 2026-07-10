import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MTT 프리플랍 차트 · 9맥스',
  description:
    '9맥스 토너먼트 프리플랍 오픈 레인지 — 100/60/40BB 레이즈 차트와 20/10BB 올인·폴드 Nash 차트를 스택 뎁스·포지션별로.',
  openGraph: {
    title: 'MTT 프리플랍 차트 · gto.today',
    description: '9맥스 토너먼트 스택 뎁스별 프리플랍 차트 (100·60·40·20·10BB).',
  },
};

export default function MttPreflopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
