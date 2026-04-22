import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { ChartNavigator } from '@/components/chart-navigator';

export const metadata = { title: 'GTO 차트 탐색' };

export default function ChartsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
        <header className="mb-3">
          <h1 className="font-display text-[20px] font-bold tracking-[-0.015em]">
            프리플랍 차트 · 6맥스 100BB
          </h1>
        </header>

        <ChartNavigator />

        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-fg-muted">
          <Link href="/charts/postflop" className="underline-offset-4 hover:underline">
            포스트플랍 차트 →
          </Link>
          <Link href="/live/play" className="underline-offset-4 hover:underline">
            실전 모드로 →
          </Link>
        </nav>
      </main>
    </>
  );
}
