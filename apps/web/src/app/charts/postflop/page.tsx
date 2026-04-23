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
import { canonicalizeFlop, comboKey, type FlopCards } from '@gto/poker-core';
import { cn, RangeGrid, type ComboMix } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { CardView } from '@gto/ui';

export default function PostflopChartPage() {
  const allSpots = useMemo(() => listPostflopSpots(), []);
  const grouped = useMemo(() => groupSpotsByTexture(allSpots), [allSpots]);
  const totalBoards = useMemo(
    () =>
      new Set(
        allSpots
          .filter((s) => s.board.length === 3)
          .map((s) => s.board.join(',')),
      ).size,
    [allSpots],
  );

  // Default to the first texture group that actually has data so
  // first-paint isn't a "준비 중" empty screen.
  const firstWithData =
    TEXTURE_GROUPS.find((g) => (grouped[g.id] ?? []).length > 0)?.id ??
    TEXTURE_GROUPS[0]!.id;
  const [groupId, setGroupId] = useState(firstWithData);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);

  // Memoise groupSpots so downstream hooks have a stable array identity.
  // `grouped[groupId] ?? []` allocates a fresh empty array on every
  // render otherwise, invalidating the memo cache.
  const groupSpots = useMemo(() => grouped[groupId] ?? [], [grouped, groupId]);
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
        <div className="mb-3 rounded-[var(--radius-button)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/10 px-3 py-2.5 text-[color:var(--color-gold)]">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2 w-2 animate-pulse rounded-full bg-[color:var(--color-gold)]"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
              솔버 작동 중 · 실시간 업데이트
            </p>
            <span className="ml-auto font-mono text-[10px] tabular-nums">
              {totalBoards}개 보드 수록
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-[1.55]">
            사전계산 GTO · 6맥스 100BB · BB가 CO 2.5x 오픈에 콜한 플랍.
            보드가 추가될 때마다 새로고침하면 더 많은 스팟을 볼 수 있어요.
            빈 텍스처 탭은 아직 배치가 도달하지 않은 영역입니다.
          </p>
        </div>

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
                      : 'border-hair surface text-fg-muted disabled:opacity-40 disabled:cursor-not-allowed',
                  )}
                >
                  {g.label}
                  {count > 0 ? (
                    <span className="ml-1 tabular-nums">· {count}</span>
                  ) : (
                    <span className="ml-1 text-[9px] uppercase tracking-[0.16em] opacity-70">· 준비 중</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Board list for the active texture group */}
        {boards.length === 0 ? (
          <div className="mt-4 rounded-[var(--radius-panel)] border border-[color:var(--color-gold)]/30 bg-[color:var(--color-gold)]/5 p-6 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-gold)]">
              아직 배치 도달 전
            </p>
            <p className="mt-2 text-[13px] text-fg">
              이 텍스처는 솔버가 곧 계산해서 채워 넣어요.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {TEXTURE_GROUPS.filter((g) => (grouped[g.id] ?? []).length > 0).map(
                (g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGroupId(g.id);
                      setSelectedBoard(null);
                    }}
                    className="inline-flex h-11 items-center rounded-[var(--radius-button)] border-hair surface px-3 font-mono text-[11px] text-fg-muted active:scale-[0.98]"
                  >
                    {g.label} →
                  </button>
                ),
              )}
            </div>
          </div>
        ) : (
          <>
            <section className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {boards.map(({ board, key }) => {
                const active = key === selectedBoard;
                const canon = canonicalizeFlop(board as unknown as FlopCards);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedBoard(active ? null : key)}
                    aria-label={`보드 ${canon.key}`}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-[var(--radius-button)] border p-1.5 active:scale-[0.98]',
                      active
                        ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10'
                        : 'border-hair surface',
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <span className="font-mono text-[10px] font-semibold tabular-nums text-fg">
                        {canon.key}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-fg-muted">
                        {suitPatternLabel(canon.pattern)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {board.map((c) => (
                        <CardView
                          key={c}
                          rank={c.charAt(0)}
                          suit={c.charAt(1) as 's' | 'h' | 'd' | 'c'}
                          size="xs"
                          deckScheme="four-color"
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </section>

            {selectedBoard && (
              <BoardMixPanel key={selectedBoard} spots={selectedSpots} />
            )}
          </>
        )}
      </main>
    </>
  );
}

/** Map a postflop spot's action mix onto the 3-way slot the RangeGrid
 *  renders (raise/call/fold). We collapse bet* + raise_* → aggression
 *  slot; check collapses into the "call" (green/pass) slot so nodes
 *  with no bet faced still render meaningfully; fold is explicit.
 *  This is a UX-level aggregation — the precise sizing breakdown is
 *  available in the per-combo detail panel below. */
function toPostflopMix(spot: PostflopSpot): ComboMix {
  let raise = 0;
  let call = 0;
  let fold = 0;
  for (const [action, rawFreq] of Object.entries(spot.mix) as [PostflopAction, number | undefined][]) {
    const freq = rawFreq ?? 0;
    if (freq <= 0) continue;
    if (action === 'fold') fold += freq;
    else if (action === 'call' || action === 'check') call += freq;
    else raise += freq;
  }
  const total = raise + call + fold;
  if (total <= 0) return { raise: 0, call: 0, fold: 1 };
  return { raise: raise / total, call: call / total, fold: fold / total };
}

/** Collapse a spot list (one per hero combo) into a 169-combo → mix
 *  map for the RangeGrid. If multiple spots map to the same combo key
 *  (iso-equivalent suits like AsKh vs AhKs both → AKs) we average
 *  their aggregated mixes for visual stability. */
function spotsToMixes(spots: readonly PostflopSpot[]): Record<string, ComboMix> {
  const buckets = new Map<string, ComboMix[]>();
  for (const s of spots) {
    const key = comboKey(s.hero[0], s.hero[1]);
    const m = toPostflopMix(s);
    const list = buckets.get(key);
    if (list) list.push(m);
    else buckets.set(key, [m]);
  }
  const out: Record<string, ComboMix> = {};
  for (const [key, list] of buckets) {
    const n = list.length;
    out[key] = {
      raise: list.reduce((a, b) => a + b.raise, 0) / n,
      call: list.reduce((a, b) => a + (b.call ?? 0), 0) / n,
      fold: list.reduce((a, b) => a + b.fold, 0) / n,
    };
  }
  return out;
}

function BoardMixPanel({ spots }: { spots: readonly PostflopSpot[] }) {
  // Caller remounts this panel (via key={selectedBoard}) when the
  // board changes, so pickedCombo state resets naturally — no need
  // for manual sync inside the render body.
  const [pickedCombo, setPickedCombo] = useState<string | null>(null);
  const mixes = useMemo(() => spotsToMixes(spots), [spots]);

  if (spots.length === 0) return null;

  const ctx = spots[0]!.context;
  const pickedSpots = pickedCombo
    ? spots.filter((s) => comboKey(s.hero[0], s.hero[1]) === pickedCombo)
    : [];

  return (
    <section className="mt-3 rounded-[var(--radius-panel)] border-hair surface p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
        {ctx.preflopSummary} · {ctx.heroPos} (OOP) 플랍 차례
      </p>
      <p className="mt-0.5 text-[12px] text-fg-muted">
        히어로 레인지 169 콤보의 액션 차트. 셀 탭 시 해당 콤보 상세.
      </p>

      <div className="mt-3">
        <RangeGrid mixes={mixes} onCellClick={setPickedCombo} highlight={pickedCombo ?? undefined} />
      </div>

      <section className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px] text-fg-muted">
        <LegendDot color="var(--color-raise)" label="벳·레이즈" />
        <LegendDot color="var(--color-call)" label="체크·콜" />
        <LegendDot color="var(--color-fold)" label="폴드" />
      </section>

      {pickedCombo && pickedSpots.length > 0 ? (
        <div className="mt-4 rounded-[var(--radius-button)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/8 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {pickedSpots[0]!.hero.map((c) => (
                <CardView
                  key={c}
                  rank={c.charAt(0)}
                  suit={c.charAt(1) as 's' | 'h' | 'd' | 'c'}
                  size="xs"
                  deckScheme="four-color"
                />
              ))}
              <span className="font-display text-[14px] font-bold">{pickedCombo}</span>
            </div>
            <button
              type="button"
              onClick={() => setPickedCombo(null)}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted active:scale-[0.96]"
              aria-label="콤보 선택 해제"
            >
              ✕
            </button>
          </div>
          <ul className="mt-3 space-y-3">
            {pickedSpots.map((spot) => {
              const entries = spot.availableActions.map(
                (a) => [a, spot.mix[a] ?? 0] as [PostflopAction, number],
              );
              const top = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]!);
              return (
                <li
                  key={spot.id}
                  className="border-t border-hair/50 pt-3 first:border-t-0 first:pt-0"
                >
                  <ul className="space-y-1.5">
                    {entries.map(([act, freq]) => {
                      const isTop = act === top[0] && freq > 0;
                      const color = POSTFLOP_ACTION_COLOR[act];
                      return (
                        <li
                          key={act}
                          className="grid items-center gap-2"
                          style={{ gridTemplateColumns: '64px minmax(0, 1fr) 48px' }}
                        >
                          <span
                            className={cn(
                              'text-right font-mono text-[11px]',
                              isTop ? 'font-bold text-white' : 'text-fg-muted',
                            )}
                          >
                            {POSTFLOP_ACTION_LABEL[act]}
                          </span>
                          <div className="relative h-2.5 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                            <div
                              className="h-full rounded-full transition-[width] duration-300 ease-out"
                              style={{ width: `${freq * 100}%`, background: color }}
                            />
                          </div>
                          <span
                            className={cn(
                              'text-right font-mono text-[11px] tabular-nums',
                              isTop ? 'font-bold text-white' : '',
                            )}
                          >
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
        </div>
      ) : (
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
          셀을 탭해 콤보 상세 보기
        </p>
      )}
    </section>
  );
}

function suitPatternLabel(pattern: 'r' | 'tt' | 'mono'): string {
  if (pattern === 'r') return '레인보우';
  if (pattern === 'tt') return '투톤';
  return '모노톤';
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
