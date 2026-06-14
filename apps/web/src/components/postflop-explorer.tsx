'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  distinctBoards,
  fetchPairings,
  fetchPairingRanges,
  fetchPairingSpots,
  findSpotsByBoard,
  groupSpotsByTexture,
  TEXTURE_GROUPS,
  type PairingChunkMeta,
  type PairingRanges,
  type PostflopSpot,
} from '@gto/gto-data';
import { canonicalizeFlop, type FlopCards } from '@gto/poker-core';
import { CardView, cn } from '@gto/ui';
import { BoardPicker } from './board-picker';
import { BoardMixPanel } from './board-mix-panel';
import { RangeChartPanel } from './range-chart-panel';

/**
 * Standalone postflop-strategy explorer. Pairing pill row → 텍스처 탭
 * (bucketed boards) OR 보드 검색 (free 13×4 picker via findSpotsByBoard).
 * Used inline by /live/play (modes toggle).
 *
 * Data is runtime-fetched: the manifest gives the pairing pills, then
 * selecting a pairing fetches that chunk (~5 MB JSON, session-cached).
 * Nothing is bundled — the bundled-TS approach produced a 57 MB chunk
 * that crashed mobile browsers (2026-06-12).
 */
export function PostflopExplorer() {
  const [pairings, setPairings] = useState<readonly PairingChunkMeta[]>([]);
  const [pairingKey, setPairingKey] = useState('');
  const [pairingSpots, setPairingSpots] = useState<readonly PostflopSpot[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const activePairing = pairings.find((p) => p.key === pairingKey);

  // Manifest once — pairing pills (legacy chunk hidden; it's the old
  // phase/mtt grab-bag, not a coherent pairing).
  useEffect(() => {
    let cancelled = false;
    void fetchPairings()
      .then((all) => {
        if (cancelled) return;
        const visible = all.filter((p) => p.key !== 'legacy');
        setPairings(visible);
        setPairingKey((k) => k || (visible[0]?.key ?? ''));
      })
      .catch(() => {
        if (!cancelled) setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Chunk + full ranges per selected pairing (ranges resolve to {} when
  // a pairing hasn't been re-solved with full-range data yet).
  const [ranges, setRanges] = useState<PairingRanges>({});
  useEffect(() => {
    if (!pairingKey) return;
    let cancelled = false;
    setLoadState('loading');
    void Promise.all([fetchPairingSpots(pairingKey), fetchPairingRanges(pairingKey)])
      .then(([spots, rng]) => {
        if (cancelled) return;
        setPairingSpots(spots);
        setRanges(rng);
        setLoadState('ready');
      })
      .catch(() => {
        if (!cancelled) setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [pairingKey]);

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

  // Default to the 3-card board search — it's the primary use case
  // ("내 플랍 골라서 전략 보기"). Texture browsing is the secondary path.
  const [exploreMode, setExploreMode] = useState<'search' | 'texture'>('search');
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
            {activePairing ? activePairing.summary || pairingLabel(activePairing) : '…'}
          </span>{' '}
          상황의 플랍 GTO 전략.
        </p>
      </div>

      {/* Free-board search (default) vs texture browsing */}
      <div className="border-hair surface mb-3 inline-flex self-start rounded-[var(--radius-button)] p-1">
        {(['search', 'texture'] as const).map((m) => {
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
                aria-label={`${pairingLabel(p)} 페어링`}
                className={cn(
                  'inline-flex h-9 items-center whitespace-nowrap rounded-[var(--radius-button)] border px-3 font-mono text-[11px]',
                  active
                    ? 'bg-[color:var(--color-accent)]/15 border-[color:var(--color-accent)] text-[color:var(--color-accent)]'
                    : 'border-hair surface text-fg-muted',
                )}
              >
                {pairingLabel(p)}
              </button>
            );
          })}
        </div>
      </section>

      {loadState === 'error' ? (
        <div className="border-[color:var(--color-raise)]/30 bg-[color:var(--color-raise)]/5 mt-3 rounded-[var(--radius-panel)] border p-5 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-raise)]">
            데이터 로드 실패
          </p>
          <p className="text-fg mt-2 text-[13px]">네트워크 연결을 확인하고 다시 시도해주세요.</p>
        </div>
      ) : loadState === 'loading' ? (
        <p className="text-fg-muted mt-4 text-center font-mono text-[11px] uppercase tracking-[0.18em]">
          전략 데이터 불러오는 중…
        </p>
      ) : exploreMode === 'texture' ? (
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
                {activePairing ? pairingLabel(activePairing) : '이'} 페어링엔 이 텍스처 보드가
                없습니다.
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

              {selectedBoard &&
                (() => {
                  const sel = boards.find((b) => b.key === selectedBoard);
                  const ck = sel ? canonicalizeFlop(sel.board as unknown as FlopCards).key : '';
                  const range = ranges[ck];
                  return range ? (
                    <RangeChartPanel key={ck} range={range} />
                  ) : (
                    <BoardMixPanel key={selectedBoard} spots={selectedSpots} />
                  );
                })()}
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
                {activePairing ? pairingLabel(activePairing) : '이'} 페어링에 이 보드와 비슷한
                사전계산 데이터가 없습니다.
              </p>
            </div>
          ) : search ? (
            <>
              <div className="border-hair surface mt-3 flex items-center justify-between gap-3 rounded-[var(--radius-button)] p-2.5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                  {search.match === 'exact' ? '정확 일치' : `근접 일치 · 거리 ${search.distance}`}
                </p>
                <p className="text-fg-muted font-mono text-[11px] tabular-nums">
                  {search.matchKey}
                </p>
              </div>
              {ranges[search.matchKey] ? (
                <RangeChartPanel key={search.matchKey} range={ranges[search.matchKey]!} />
              ) : (
                <BoardMixPanel key={search.matchKey} spots={search.spots} />
              )}
            </>
          ) : null}
        </>
      )}
    </>
  );
}

/** Pill label — `BB vs CO`, 3bet pots tagged so SRP/3벳 lines are
 *  distinguishable at a glance. */
function pairingLabel(p: PairingChunkMeta): string {
  const base = `${p.heroPos} vs ${p.villainPos}`;
  return p.potType === '3bp' ? `${base} ·3벳` : base;
}

function suitPatternLabel(pattern: 'r' | 'tt' | 'mono'): string {
  if (pattern === 'r') return '레인보우';
  if (pattern === 'tt') return '투톤';
  return '모노톤';
}
