'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { ChartNavigator } from '@/components/chart-navigator';
import { useLiveStore } from '@/lib/live-store';

/**
 * 실전 모드 — interactive game-tree explorer. User walks through every
 * preflop action and sees the solver's mix at each decision point.
 *
 * Settings (live-store) are shown as read-only context. TexasSolver 0.2
 * only ships 6max 100BB 2.5x open cash 500 rake data so the dropdowns
 * in /live are already locked to that scope.
 */
export default function LivePlayPage() {
  const config = useLiveStore((s) => s.config);

  const isMtt = config.gameType === 'mtt';
  const typeLabel = isMtt ? '토너먼트 · 1BB 앤티 근사' : '캐시 게임';
  const dataPath = isMtt
    ? '/data/preflop/mtt_6max_100bb_qb_decisions.json'
    : '/data/preflop/6max_100bb_qb_decisions.json';

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            <h1 className="font-display text-[20px] font-bold tracking-[-0.015em]">
              실전 모드
            </h1>
            <p className="mt-0.5 text-[11px] text-fg-muted">
              {typeLabel} · 6맥스 · 100BB · 2.5x
            </p>
          </div>
          <Link
            href="/live"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted"
          >
            설정
          </Link>
        </header>

        <ChartNavigator key={dataPath} dataPath={dataPath} />
      </main>
    </>
  );
}
