'use client';

import { useMemo, useState } from 'react';
import {
  distinctBoards,
  findSpotsByBoard,
  groupSpotsByTexture,
  listPostflopSpots,
  TEXTURE_GROUPS,
  type PostflopSpot,
} from '@gto/gto-data';
import { canonicalizeFlop, type FlopCards } from '@gto/poker-core';
import { CardView, cn } from '@gto/ui';
import { BoardPicker } from './board-picker';
import { BoardMixPanel } from './board-mix-panel';

/**
 * Standalone postflop-strategy explorer. Pairing pill row → 텍스처 탭
 * (bucketed boards) OR 보드 검색 (free 13×4 picker via findSpotsByBoard).
 * Used inline by /live/play (modes toggle) and by /charts/postflop.
 * Brings its own info box + state; consumers only mount it inside their
 * own main / header.
 */
export function PostflopExplorer() {
  const allSpots = useMemo(() => listPostflopSpots(), []);

  // Defender×opener pairings present in the data, ordered by real-game
  // frequency. 15 pairings once Phase B finishes (8 SRP + 7 3bet pot).
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

  const firstWithData =
    TEXTURE_GROUPS.find((g) => (grouped[g.id] ?? []).length > 0)?.id ?? TEXTURE_GROUPS[0]!.id;
  const [groupId, setGroupId] = useState(firstWithData);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);

  const [exploreMode, setExploreMode] = useState<'texture' | 'search'>('texture');
  const [pickedCards, setPickedCards] = useState<readonly string[]>([]);
  const search = useMemo(() => {
    if (exploreMode !== 'search' || pickedCards.length !== 3) return null;
    return findSpotsByBoard(pickedCards as unknown as FlopCards, { pool: pairingSpots });
  }, [exploreMode, pickedCards, pairingSpots]);

  const effectiveGroupId = (grouped[groupId] ?? []).length > 0 ? groupId : firstWithData;
  const groupSpots = useMemo(() => grouped[effectiveGroupId] ?? [], [grouped, effectiveGroupId]);
  const boards = useMemo(() => distinctBoards(groupSpots), [groupSpots]);
  const selectedSpots = useMemo(
    () => (selectedBoard ? groupSpots.filter((s) => s.board.join(',') === selectedBoard) : []),
    [groupSpots, selectedBoard],
  );

  return (
    <>
      <div className="border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/10 mb-3 rounded-[var(--radius-button)] border px-3 py-2.5 text-[color:var(--color-gold)]">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-gold)]"
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
            사전계산 GTO · {pairings.length}개 페어링
          </p>
          <span className="ml-auto font-mono text-[10px] tabular-nums">{totalBoards}개 보드</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-[1.55]">
          6맥스 100BB.{' '}
          <span className="text-fg font-semibold">
            {activePairing?.summary ?? activePairing?.label}
          </span>{' '}
          상황의 플랍 GTO 전략.
        </p>
      </div>

      {/* Texture vs free-board search */}
      <div className="border-hair surface mb-3 inline-flex self-start rounded-[var(--radius-button)] p-1">
        {(['texture', 'search'] as const).map((m) => {
          const active = m === exploreMode;
          return (
            <button
              key={m}
              type="button"
              onClick={() => {
                setExploreMode(m);
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

      {exploreMode === 'texture' ? (
        <>
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

          {boards.length === 0 ? (
            <div className="border-[color:var(--color-gold)]/30 bg-[color:var(--color-gold)]/5 mt-4 rounded-[var(--radius-panel)] border p-6 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-gold)]">
                이 텍스처는 비어있어요
              </p>
              <p className="text-fg mt-2 text-[13px]">
                {activePairing?.label} 페어링엔 이 텍스처 보드가 없습니다.
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
    </>
  );
}

const PAIRING_ORDER = [
  'BB_BTN',
  'BB_CO',
  'BB_SB',
  'BB_MP',
  'BB_UTG',
  'BTN_CO',
  'BTN_MP',
  'BTN_UTG',
  'SB_BTN',
  'SB_CO',
  'SB_MP',
  'SB_UTG',
  'CO_MP',
  'CO_UTG',
  'MP_UTG',
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
