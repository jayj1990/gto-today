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

  const typeLabel = config.gameType === 'cash' ? '캐시 게임' : '토너먼트';

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        <header className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
              실전 모드
            </p>
            <h1 className="mt-2 font-display text-[26px] font-bold tracking-[-0.015em]">
              GTO 차트
            </h1>
            <p className="mt-1 text-[13px] text-fg-muted">
              {typeLabel} · 6맥스 · 100BB · 2.5x 오픈
            </p>
          </div>
          <Link
            href="/live"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted"
          >
            설정 수정
          </Link>
        </header>

        <ChartNavigator />

        <p className="mt-6 text-[12px] text-fg-muted">
          데이터: TexasSolver 0.2 · 6max 100BB · 2.5x open · 500 rake.
        </p>
      </main>
    </>
  );
}
