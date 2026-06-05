'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  distinctBoards,
  findSpotsByBoard,
  groupSpotsByTexture,
  listPostflopSpots,
  TEXTURE_GROUPS,
  type PostflopSpot,
} from '@gto/gto-data';
import { canonicalizeFlop, type FlopCards } from '@gto/poker-core';
import { cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { CardView } from '@gto/ui';
import { BoardPicker } from '@/components/board-picker';
import { BoardMixPanel } from '@/components/board-mix-panel';

export default function PostflopChartPage() {
  const allSpots = useMemo(() => listPostflopSpots(), []);

  // Defender×opener pairings present in the data, ordered by real-game
  // frequency. 8 pairings as of the 2026-05 solver batch (BB defends
  // CO/BTN/SB/MP/UTG; BTN defends CO/MP/UTG).
  const pairings = useMemo(() => derivePairings(allSpots), [allSpots]);
  const [pairingKey, setPairingKey] = useState(() => pairings[0]?.key ?? '');
  const activePairing = pairings.find((p) => p.key === pairingKey);

  // Narrow to the selected pairing, then group that subset by texture.
  const pairingSpots = useMemo(
    () => allSpots.filter((s) => `${s.context.heroPos}_${s.context.villainPos}` === pairingKey),
    [allSpots, pairingKey],
  );
  const grouped = useMemo(() => groupSpotsByTexture(pairingSpots), [pairingSpots]);
  const totalBoards = useMemo(
    () =>
      new Set(pairingSpots.filter((s) => s.board.length === 3).map((s) => s.board.join(','))).size,
    [pairingSpots],
  );

  // First texture with data for this pairing.
  const firstWithData =
    TEXTURE_GROUPS.find((g) => (grouped[g.id] ?? []).length > 0)?.id ?? TEXTURE_GROUPS[0]!.id;
  const [groupId, setGroupId] = useState(firstWithData);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);

  // Direct board search (GTO Wizard-style). Iso canonicalisation +
  // nearest-neighbour fallback means any 3 cards land on a precomputed
  // spot — the user doesn't have to pick from our texture-bucketed list.
  const [mode, setMode] = useState<'texture' | 'search'>('texture');
  const [pickedCards, setPickedCards] = useState<readonly string[]>([]);
  const search = useMemo(() => {
    if (mode !== 'search' || pickedCards.length !== 3) return null;
    return findSpotsByBoard(pickedCards as unknown as FlopCards, { pool: pairingSpots });
  }, [mode, pickedCards, pairingSpots]);

  // If the active texture has no boards for the current pairing, fall
  // back to the first populated one — a pairing switch never strands
  // the user on an empty tab. No effect/state sync needed.
  const effectiveGroupId = (grouped[groupId] ?? []).length > 0 ? groupId : firstWithData;

  // Memoise groupSpots so downstream hooks have a stable array identity.
  const groupSpots = useMemo(() => grouped[effectiveGroupId] ?? [], [grouped, effectiveGroupId]);
  const boards = useMemo(() => distinctBoards(groupSpots), [groupSpots]);

  const selectedSpots = useMemo(
    () => (selectedBoard ? groupSpots.filter((s) => s.board.join(',') === selectedBoard) : []),
    [groupSpots, selectedBoard],
  );

  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
        <header className="mb-3 flex items-baseline justify-between">
          <h1 className="font-display text-[20px] font-bold tracking-[-0.015em]">
            포스트플랍 차트
          </h1>
          <Link
            href="/charts"
            className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.18em]"
          >
            ← 프리플랍
          </Link>
        </header>
        <div className="border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/10 mb-3 rounded-[var(--radius-button)] border px-3 py-2.5 text-[color:var(--color-gold)]">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-gold)]"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
              사전계산 GTO · 8개 페어링
            </p>
            <span className="ml-auto font-mono text-[10px] tabular-nums">{totalBoards}개 보드</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-[1.55]">
            6맥스 100BB 싱글레이즈 팟.{' '}
            <span className="text-fg font-semibold">
              {activePairing?.summary ?? activePairing?.label}
            </span>{' '}
            상황의 플랍 GTO 전략. 아래 페어링과 보드 텍스처를 골라보세요.
          </p>
        </div>

        {/* Mode toggle — texture-grouped exploration vs direct board search */}
        <div className="border-hair surface mb-3 inline-flex self-start rounded-[var(--radius-button)] p-1">
          {(['texture', 'search'] as const).map((m) => {
            const active = m === mode;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setSelectedBoard(null);
                }}
                aria-pressed={active}
                className={cn(
                  'inline-flex h-9 items-center rounded-[calc(var(--radius-button)-2px)] px-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors',
                  active
                    ? 'bg-[color:var(--color-accent)]/20 text-[color:var(--color-accent)]'
                    : 'text-fg-muted',
                )}
              >
                {m === 'texture' ? '텍스처 탐색' : '보드 검색'}
              </button>
            );
          })}
        </div>

        {/* Pairing pills */}
        <section className="mb-2 overflow-x-auto">
          <div className="flex min-w-max gap-1.5">
            {pairings.map((p) => {
              const active = p.key === pairingKey;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setPairingKey(p.key);
                    setSelectedBoard(null);
                  }}
                  aria-pressed={active}
                  aria-label={`${p.label} 페어링`}
                  className={cn(
                    'inline-flex h-9 items-center whitespace-nowrap rounded-[var(--radius-button)] border px-3 font-mono text-[11px]',
                    active
                      ? 'bg-[color:var(--color-accent)]/15 border-[color:var(--color-accent)] text-[color:var(--color-accent)]'
                      : 'border-hair surface text-fg-muted',
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </section>

        {mode === 'texture' ? (
          <>
            {/* Texture tabs */}
            <section className="mb-3 overflow-x-auto">
              <div className="flex min-w-max gap-1.5">
                {TEXTURE_GROUPS.map((g) => {
                  const count = (grouped[g.id] ?? []).length;
                  const active = g.id === effectiveGroupId;
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
                        'whitespace-nowrap rounded-[var(--radius-button)] border px-3 py-1.5 font-mono text-[11px]',
                        active
                          ? 'bg-[color:var(--color-accent)]/15 border-[color:var(--color-accent)] text-[color:var(--color-accent)]'
                          : 'border-hair surface text-fg-muted disabled:cursor-not-allowed disabled:opacity-40',
                      )}
                    >
                      {g.label}
                      <span className="ml-1 tabular-nums">· {count}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Board list for the active texture group */}
            {boards.length === 0 ? (
              <div className="border-[color:var(--color-gold)]/30 bg-[color:var(--color-gold)]/5 mt-4 rounded-[var(--radius-panel)] border p-6 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-gold)]">
                  이 텍스처는 비어있어요
                </p>
                <p className="text-fg mt-2 text-[13px]">
                  {activePairing?.label} 페어링엔 이 텍스처 보드가 없습니다. 아래에서 다른 텍스처를
                  골라보세요.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {TEXTURE_GROUPS.filter((g) => (grouped[g.id] ?? []).length > 0).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setGroupId(g.id);
                        setSelectedBoard(null);
                      }}
                      className="border-hair surface text-fg-muted inline-flex h-11 items-center rounded-[var(--radius-button)] px-3 font-mono text-[11px] active:scale-[0.98]"
                    >
                      {g.label} →
                    </button>
                  ))}
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
                            ? 'bg-[color:var(--color-accent)]/10 border-[color:var(--color-accent)]'
                            : 'border-hair surface',
                        )}
                      >
                        <div className="flex w-full items-center justify-between gap-1">
                          <span className="text-fg font-mono text-[10px] font-semibold tabular-nums">
                            {canon.key}
                          </span>
                          <span className="text-fg-muted font-mono text-[9px] uppercase tracking-[0.14em]">
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

                {selectedBoard && <BoardMixPanel key={selectedBoard} spots={selectedSpots} />}
              </>
            )}
          </>
        ) : (
          <>
            <BoardPicker selected={pickedCards} onChange={setPickedCards} className="mb-3" />
            {pickedCards.length < 3 ? (
              <p className="text-fg-muted mt-2 text-center font-mono text-[11px] uppercase tracking-[0.18em]">
                보드 3장을 골라보세요 ({pickedCards.length}/3)
              </p>
            ) : search?.match === 'none' ? (
              <div className="border-[color:var(--color-fold)]/30 bg-[color:var(--color-fold)]/5 mt-3 rounded-[var(--radius-panel)] border p-5 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-fold)]">
                  근접 보드 없음
                </p>
                <p className="text-fg mt-2 text-[13px]">
                  {activePairing?.label} 페어링에 이 보드와 비슷한 사전계산 데이터가 없습니다.
                  페어링을 바꾸거나 다른 보드를 골라보세요.
                </p>
              </div>
            ) : search ? (
              <>
                <div className="border-hair surface mt-3 flex items-center justify-between gap-3 rounded-[var(--radius-button)] p-2.5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                    {search.match === 'exact' ? '정확 일치' : `근접 일치 · 거리 ${search.distance}`}
                  </p>
                  <p className="text-fg-muted font-mono text-[11px] tabular-nums">
                    {search.spots.length}개 콤보
                  </p>
                </div>
                <BoardMixPanel key={search.matchKey} spots={search.spots} />
              </>
            ) : null}
          </>
        )}
      </main>
    </>
  );
}

/** Distinct defender×opener pairings present in the spot pool, ordered
 *  by real-game frequency (late-position steals first). Key matches
 *  `${heroPos}_${villainPos}` so the page can filter the pool cheaply. */
const PAIRING_ORDER = [
  'BB_BTN',
  'BB_CO',
  'BB_SB',
  'BB_MP',
  'BB_UTG',
  'BTN_CO',
  'BTN_MP',
  'BTN_UTG',
];
function derivePairings(
  spots: readonly PostflopSpot[],
): { key: string; label: string; summary: string; count: number }[] {
  const map = new Map<string, { key: string; label: string; summary: string; count: number }>();
  for (const s of spots) {
    const key = `${s.context.heroPos}_${s.context.villainPos}`;
    const existing = map.get(key);
    if (existing) existing.count++;
    else
      map.set(key, {
        key,
        label: `${s.context.heroPos} vs ${s.context.villainPos}`,
        summary: s.context.preflopSummary,
        count: 1,
      });
  }
  const rank = (k: string) => {
    const i = PAIRING_ORDER.indexOf(k);
    return i < 0 ? 99 : i;
  };
  return [...map.values()].sort((a, b) => rank(a.key) - rank(b.key));
}

function suitPatternLabel(pattern: 'r' | 'tt' | 'mono'): string {
  if (pattern === 'r') return '레인보우';
  if (pattern === 'tt') return '투톤';
  return '모노톤';
}
