'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { ChartNavigator } from '@/components/chart-navigator';
import { PostflopExplorer } from '@/components/postflop-explorer';
import { useLiveStore } from '@/lib/live-store';

/**
 * 실전 모드 — interactive game-tree explorer.
 *
 * Two top-level modes:
 *   • 프리플랍 — walk the preflop tree (ChartNavigator). On flop reach,
 *     ChartNavigator surfaces an inline board picker + postflop strategy.
 *   • 포스트플랍 — skip preflop and explore the Wizard-style postflop
 *     chart directly (PostflopExplorer): pairing pills + texture tabs
 *     or free 3-card search.
 *
 * Cash settings live in live-store and read-only here. TexasSolver 0.2
 * only ships 6max 100BB 2.5x open data so the dropdowns in /live are
 * already locked to that scope.
 */
export default function LivePlayPage() {
  const config = useLiveStore((s) => s.config);
  const [mode, setMode] = useState<'preflop' | 'postflop'>('preflop');

  const isMtt = config.gameType === 'mtt';
  const typeLabel = isMtt ? '토너먼트 · 1BB 앤티 근사' : '캐시 게임';
  const dataPath = isMtt
    ? '/data/preflop/mtt_6max_100bb_qb_decisions.json'
    : '/data/preflop/6max_100bb_qb_decisions.json';

  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            <h1 className="font-display text-[20px] font-bold tracking-[-0.015em]">실전 모드</h1>
            <p className="text-fg-muted mt-0.5 text-[11px]">{typeLabel} · 6맥스 · 100BB · 2.5x</p>
          </div>
          <Link
            href="/live"
            className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.18em]"
          >
            설정
          </Link>
        </header>

        {/* Preflop / Postflop mode toggle */}
        <div className="border-hair surface mb-4 inline-flex self-start rounded-[var(--radius-button)] p-1">
          {(['preflop', 'postflop'] as const).map((m) => {
            const active = m === mode;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={active}
                className={cn(
                  'inline-flex h-10 items-center rounded-[calc(var(--radius-button)-2px)] px-4 font-mono text-[12px] tracking-[0.04em] transition-colors',
                  active
                    ? 'bg-[color:var(--color-accent)]/20 text-[color:var(--color-accent)]'
                    : 'text-fg-muted',
                )}
              >
                {m === 'preflop' ? '프리플랍' : '포스트플랍'}
              </button>
            );
          })}
        </div>

        {mode === 'preflop' ? (
          <ChartNavigator key={dataPath} dataPath={dataPath} />
        ) : (
          <PostflopExplorer />
        )}
      </main>
    </>
  );
}
