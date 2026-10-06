'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@gto/ui';
import { POSITIONS_BY_FORMAT } from '@gto/poker-core';
import { CASH_GROUP_IDS, MTT_GROUP_IDS } from '@gto/gto-data';
import { SiteHeader } from '@/components/site-header';
import { ChartNavigator } from '@/components/chart-navigator';
import { ChartLibraryBrowser } from '@/components/chart-library-browser';
import { PostflopExplorer } from '@/components/postflop-explorer';
import { useLiveStore } from '@/lib/live-store';

/**
 * 실전 모드 — interactive game-tree explorer.
 *
 * Three top-level modes:
 *   • 프리플랍 — RYE 차트 라이브러리(ChartLibraryBrowser). 캐시/토너먼트
 *     설정에 따라 묶음이 갈린다. 스터디 탭의 기본 화면.
 *   • 트리 — walk the preflop tree (ChartNavigator). On flop reach,
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
  const [mode, setMode] = useState<'charts' | 'tree' | 'postflop'>('charts');

  const isMtt = config.gameType === 'mtt';
  const typeLabel = isMtt ? '토너먼트 · 1BB 앤티 근사' : '캐시 게임';
  // Only 6max/9max trees exist; anything else falls back to 6max.
  const format = config.format === '9max' ? '9max' : '6max';
  // Depth trees exist for 9max only. Sub-100BB trees are single-flavor
  // (the depth charts are MTT-convention), so gameType only picks the
  // file at 100BB.
  const depth =
    format === '9max' && [100, 60, 40, 20, 10].includes(config.stackBB as number)
      ? (config.stackBB as number)
      : 100;
  const dataPath =
    depth === 100
      ? `/data/preflop/${isMtt ? 'mtt_' : ''}${format}_100bb_qb_decisions.json`
      : `/data/preflop/9max_${depth}bb_qb_decisions.json`;
  const positions = POSITIONS_BY_FORMAT[format];
  const sizeLabel = depth <= 20 ? '올인/폴드' : '2.5x';

  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            <h1 className="font-display text-[20px] font-bold tracking-[-0.015em]">GTO 스터디</h1>
            <p className="text-fg-muted mt-0.5 text-[11px]">
              {mode === 'charts'
                ? `${typeLabel} · 포지션 · 스택별 차트`
                : `${typeLabel} · ${format === '9max' ? '9맥스' : '6맥스'} · ${depth}BB · ${sizeLabel}`}
            </p>
          </div>
          <Link
            href="/live"
            className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.18em]"
          >
            설정
          </Link>
        </header>

        {/* 차트 / 트리 / 포스트플랍 */}
        <div className="border-hair surface mb-4 inline-flex self-start rounded-[var(--radius-button)] p-1">
          {(['charts', 'tree', 'postflop'] as const).map((m) => {
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
                {m === 'charts' ? '프리플랍' : m === 'tree' ? '트리' : '포스트플랍'}
              </button>
            );
          })}
        </div>

        {mode === 'charts' ? (
          <ChartLibraryBrowser groups={isMtt ? MTT_GROUP_IDS : CASH_GROUP_IDS} />
        ) : mode === 'tree' ? (
          <ChartNavigator key={dataPath} dataPath={dataPath} positions={positions} />
        ) : (
          <PostflopExplorer />
        )}
      </main>
    </>
  );
}
