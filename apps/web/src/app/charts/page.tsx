import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { ChartNavigator } from '@/components/chart-navigator';

export const metadata = { title: 'GTO 차트 탐색' };

export default function ChartsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        <header className="mb-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            GTO 게임트리 탐색
          </p>
          <h1 className="mt-2 font-display text-[26px] font-bold tracking-[-0.015em]">
            프리플랍 차트 · 6맥스 100BB
          </h1>
          <p className="mt-1 text-[13px] text-fg-muted">
            각 포지션의 액션을 누르면 다음 플레이어의 차트가 나타납니다.
          </p>
        </header>

        <ChartNavigator />

        <p className="mt-6 text-[12px] text-fg-muted">
          <Link href="/live/play" className="underline-offset-4 hover:underline">
            실전 모드로 →
          </Link>
        </p>
      </main>
    </>
  );
}
