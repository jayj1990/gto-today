import Link from 'next/link';
import { CASH_GROUP_IDS } from '@gto/gto-data';
import { SiteHeader } from '@/components/site-header';
import { ChartLibraryBrowser } from '@/components/chart-library-browser';

export const metadata = {
  title: '프리플랍 차트 · 캐시',
  description:
    '캐시 게임 프리플랍 차트 — 포지션별 오픈 레인지, SB 플레이, 오픈에 대한 3벳·콜, BB 디펜스. 3벳을 맞았을 때의 계획과 블러프까지 한 칸에.',
};

export default function ChartsPage() {
  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
        <header className="mb-3">
          <h1 className="font-display text-[20px] font-bold tracking-[-0.015em]">
            프리플랍 차트 · 캐시 100bb
          </h1>
          <p className="text-fg-muted mt-1 text-[12px] leading-[1.55]">
            오픈만이 아니라 3벳을 맞았을 때 뭘 할지까지 한 칸에. 빗금은 블러프예요.
          </p>
        </header>

        <ChartLibraryBrowser groups={CASH_GROUP_IDS} />

        <p className="text-fg-muted mt-3 text-[11px]">
          <Link href="/live/play" className="underline-offset-4 hover:underline">
            GTO 스터디로 →
          </Link>
        </p>
      </main>
    </>
  );
}
