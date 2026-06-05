import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { ChartNavigator } from '@/components/chart-navigator';

export const metadata = { title: 'GTO 차트 탐색' };

export default function ChartsPage() {
  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <h1 className="font-display text-[20px] font-bold tracking-[-0.015em]">
            프리플랍 차트 · 6맥스 100BB
          </h1>
          <Link
            href="/charts/postflop"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]"
          >
            포스트플랍 →
          </Link>
        </header>

        <ChartNavigator />

        <p className="text-fg-muted mt-3 text-[11px]">
          <Link href="/live/play" className="underline-offset-4 hover:underline">
            실전 모드로 →
          </Link>
        </p>
      </main>
    </>
  );
}
