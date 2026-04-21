'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  distinctBoards,
  groupSpotsByTexture,
  listPostflopSpots,
  POSTFLOP_ACTION_COLOR,
  POSTFLOP_ACTION_LABEL,
  TEXTURE_GROUPS,
  type PostflopAction,
  type PostflopSpot,
} from '@gto/gto-data';
import { cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { CardView } from '@gto/ui';

export default function PostflopChartPage() {
  const allSpots = useMemo(() => listPostflopSpots(), []);
  const grouped = useMemo(() => groupSpotsByTexture(allSpots), [allSpots]);

  const [groupId, setGroupId] = useState(TEXTURE_GROUPS[0]!.id);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);

  const groupSpots = grouped[groupId] ?? [];
  const boards = useMemo(() => distinctBoards(groupSpots), [groupSpots]);

  const selectedSpots = useMemo(
    () => (selectedBoard ? groupSpots.filter((s) => s.board.join(',') === selectedBoard) : []),
    [groupSpots, selectedBoard],
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
        <header className="mb-3 flex items-baseline justify-between">
          <h1 className="font-display text-[20px] font-bold tracking-[-0.015em]">
            포스트플랍 차트
          </h1>
          <Link
            href="/charts"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted"
          >
            ← 프리플랍
          </Link>
        </header>

        {/* Texture tabs */}
        <section className="mb-3 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {TEXTURE_GROUPS.map((g) => {
              const count = (grouped[g.id] ?? []).length;
              const active = g.id === groupId;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setGroupId(g.id);
                    setSelectedBoard(null);
                  }}
                  disabled={count === 0}
                  className={cn(
                    'rounded-[var(--radius-button)] border px-3 py-1.5 font-mono text-[11px] whitespace-nowrap',
                    active
                      ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)]'
                      : 'border-hair surface text-fg-muted disabled:opacity-40',
                  )}
                >
                  {g.label} · {count}
                </button>
              );
            })}
          </div>
        </section>

        {/* Board list for the active texture group */}
        {boards.length === 0 ? (
          <div className="mt-4 rounded-[var(--radius-panel)] border-hair surface p-6 text-center">
            <p className="font-mono text-[12px] text-fg-muted">
              이 텍스처는 아직 솔빙된 보드가 없어요.
            </p>
            <p className="mt-2 text-[11px] text-fg-muted">
              다른 텍스처를 선택하거나, 솔버 배치가 끝난 후 다시 확인하세요.
            </p>
          </div>
        ) : (
          <>
            <section className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {boards.map(({ board, key }) => {
                const active = key === selectedBoard;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedBoard(active ? null : key)}
                    className={cn(
                      'flex items-center gap-1 rounded-[var(--radius-button)] border p-1.5 active:scale-[0.98]',
                      active
                        ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10'
                        : 'border-hair surface',
                    )}
                  >
                    {board.map((c) => (
                      <CardView
                        key={c}
                        rank={c.charAt(0)}
                        suit={c.charAt(1) as 's' | 'h' | 'd' | 'c'}
                        size="xs"
                        deckScheme="four-color"
                      />
                    ))}
                  </button>
                );
              })}
            </section>

            {selectedBoard && <BoardMixPanel spots={selectedSpots} />}
          </>
        )}
      </main>
    </>
  );
}

function BoardMixPanel({ spots }: { spots: readonly PostflopSpot[] }) {
  if (spots.length === 0) return null;

  // First spot carries the preflop context (heroPos, villainPos, etc).
  const ctx = spots[0]!.context;

  return (
    <section className="mt-3 rounded-[var(--radius-panel)] border-hair surface p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
        {ctx.preflopSummary} · {ctx.heroPos} (OOP) 플랍 차례
      </p>
      <p className="mt-0.5 text-[12px] text-fg-muted">
        보드의 대표 콤보별 GTO 액션 믹스
      </p>

      <ul className="mt-3 space-y-3">
        {spots.map((spot) => {
          const total = Object.values(spot.mix).reduce((s, v) => s + (v ?? 0), 0);
          const entries = spot.availableActions.map(
            (a) => [a, spot.mix[a] ?? 0] as [PostflopAction, number],
          );
          const top = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
          return (
            <li key={spot.id} className="border-t border-hair pt-3 first:border-t-0 first:pt-0">
              <div className="flex items-center gap-2">
                {spot.hero.map((c) => (
                  <CardView
                    key={c}
                    rank={c.charAt(0)}
                    suit={c.charAt(1) as 's' | 'h' | 'd' | 'c'}
                    size="xs"
                    deckScheme="four-color"
                  />
                ))}
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
                  합계 {Math.round(total * 100)}%
                </span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {entries.map(([act, freq]) => {
                  const isTop = act === top[0] && freq > 0;
                  const color = POSTFLOP_ACTION_COLOR[act];
                  return (
                    <li key={act} className="flex items-center gap-2">
                      <span
                        className={cn(
                          'w-14 flex-shrink-0 font-mono text-[11px]',
                          isTop ? 'font-bold text-fg' : 'text-fg-muted',
                        )}
                      >
                        {isTop && (
                          <span className="mr-1 text-[color:var(--color-gold)]">★</span>
                        )}
                        {POSTFLOP_ACTION_LABEL[act]}
                      </span>
                      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                        <div
                          className="h-full rounded-full transition-[width] duration-300 ease-out"
                          style={{ width: `${freq * 100}%`, background: color }}
                        />
                      </div>
                      <span className="w-12 flex-shrink-0 text-right font-mono text-[11px] tabular-nums">
                        {(freq * 100).toFixed(1)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
