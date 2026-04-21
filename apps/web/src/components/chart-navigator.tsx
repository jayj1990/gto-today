'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ComboDetailSheet, RangeGrid, type ComboMix } from '@gto/ui';

type DecisionsJson = Record<string, Record<string, Record<string, number>>>;

const POSITIONS_6MAX: readonly string[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

interface NodeData {
  actor: string;
  actions: Record<string, Record<string, number>>;
  legal: string[];
  /** True when every non-BB seat has folded — BB wins the pot uncontested. */
  bbWins?: boolean;
  /** True when someone already jammed — remaining actors only call or fold. */
  postAllIn?: boolean;
  /** True when everyone has responded to the AllIn; hand is at showdown. */
  showdown?: boolean;
}

export interface ChartNavigatorProps {
  /** Relative path served from /public/data/preflop. */
  dataPath?: string;
  className?: string;
}

/**
 * Interactive preflop game-tree explorer backed by TexasSolver's
 * qb_ranges export. Breadcrumb at the top, 13×13 grid in the middle,
 * action buttons at the bottom. Used by /live/play (실전 모드) and
 * /charts (direct explorer).
 */
export function ChartNavigator({
  dataPath = '/data/preflop/6max_100bb_qb_decisions.json',
  className,
}: ChartNavigatorProps) {
  const [decisions, setDecisions] = useState<DecisionsJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(dataPath)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setDecisions(data);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dataPath]);

  const node: NodeData | null = useMemo(() => {
    if (!decisions) return null;
    return resolveNode(decisions, path);
  }, [decisions, path]);

  const mixes: Record<string, ComboMix> = useMemo(() => {
    if (!node) return {};
    return buildComboMixes(node);
  }, [node]);

  const handleAction = (action: string) => setPath((p) => [...p, `${node?.actor}_${action}`]);
  const handleBack = () => setPath((p) => p.slice(0, -1));
  const handleRestart = () => setPath([]);

  const seatState = useMemo(() => buildSeatState(path, node?.actor), [path, node?.actor]);

  const [pickedCombo, setPickedCombo] = useState<string | null>(null);
  const pickedMix = pickedCombo ? mixes[pickedCombo] : undefined;
  const raiseLabel = useMemo(() => {
    if (!node) return undefined;
    const raiseAct = node.legal.find((a) => a.endsWith('bb') || a === 'AllIn');
    return raiseAct;
  }, [node]);

  return (
    <div className={className}>
      {loading && <p className="font-mono text-[13px] text-fg-muted">차트 불러오는 중…</p>}

      {!loading && !decisions && (
        <p className="text-[13px] text-[color:var(--color-raise)]">
          차트 데이터를 불러오지 못했어요.
        </p>
      )}

      {node && (
        <>
          <SeatRibbon state={seatState} />

          {node.bbWins || node.showdown ? (
            <section className="rounded-[var(--radius-panel)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/10 p-5 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-gold)]">
                결과
              </p>
              <h2 className="mt-1 font-display text-[24px] font-bold text-[color:var(--color-gold)]">
                {node.bbWins ? 'BB 승리' : '쇼다운'}
              </h2>
              <p className="mt-2 text-[12px] text-fg-muted">
                {node.bbWins
                  ? '모두 폴드 → BB가 블라인드를 가져갑니다.'
                  : '모두 액션 완료 → 보드 오픈.'}
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-gold-gradient px-5 font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
              >
                새 핸드 시작 ↻
              </button>
            </section>
          ) : (
            <>
              <section className="mb-3 rounded-[var(--radius-panel)] border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent)]/5 p-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[20px] font-bold text-[color:var(--color-accent)]">
                    {node.actor}
                  </span>
                  <span className="text-[12px] text-fg-muted">차례</span>
                </div>

                {node.legal.length > 0 ? (
                  <div
                    className="mt-3 grid gap-1.5"
                    style={{
                      gridTemplateColumns: `repeat(${node.legal.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {node.legal.map((act) => {
                      const color = actionColour(act);
                      const compact = node.legal.length >= 3;
                      const isAllIn = act === 'AllIn';
                      const cls = cn(
                        'rounded-[var(--radius-button)] border font-mono font-bold text-white whitespace-nowrap shadow-[var(--shadow-card)] active:scale-[0.98]',
                        compact ? 'h-11 text-[11px] px-1' : 'h-12 text-[13px] px-2',
                      );
                      const style = {
                        background: color,
                        borderColor: color,
                        color: '#ffffff',
                      };
                      if (isAllIn) {
                        return (
                          <motion.button
                            key={act}
                            type="button"
                            onClick={() => handleAction(act)}
                            className={cls}
                            style={style}
                            animate={{
                              boxShadow: [
                                '0 0 0 0 rgba(212, 175, 55, 0.55)',
                                '0 0 0 8px rgba(212, 175, 55, 0)',
                              ],
                            }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                          >
                            {prettyAction(act, compact)}
                          </motion.button>
                        );
                      }
                      return (
                        <button
                          key={act}
                          type="button"
                          onClick={() => handleAction(act)}
                          className={cls}
                          style={style}
                        >
                          {prettyAction(act, compact)}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-[12px] text-fg-muted">
                    이 스팟은 선택지가 없어요.
                  </p>
                )}
              </section>

              {node.postAllIn ? (
                <section className="mb-3 rounded-[var(--radius-panel)] border border-[color:var(--color-gold)]/30 bg-[color:var(--color-gold)]/5 p-3 text-center">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-gold)]">
                    올인 상황
                  </p>
                  <p className="mt-1 text-[12px] text-fg">
                    남은 액션은{' '}
                    <span className="font-semibold text-[color:var(--color-call)]">콜</span> 또는{' '}
                    <span className="font-semibold text-fg-muted">폴드</span>.
                  </p>
                </section>
              ) : (
                <>
                  <section className="mb-2">
                    {Object.keys(mixes).length > 0 ? (
                      <RangeGrid
                        mixes={mixes}
                        onCellClick={(c) => setPickedCombo(c)}
                        className="w-full"
                      />
                    ) : (
                      <div className="rounded-[var(--radius-panel)] border-hair surface p-4 text-center">
                        <p className="font-mono text-[12px] text-fg-muted">
                          솔버 데이터가 없는 스팟이에요.
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="mb-3 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px] text-fg-muted">
                    <LegendDot color="#C8102E" label="레이즈" />
                    <LegendDot color="#1F9D55" label="콜" />
                    <LegendDot color="#2B5F8F" label="폴드" />
                  </section>
                </>
              )}
            </>
          )}

          <section className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={path.length === 0}
              className="h-10 rounded-[var(--radius-button)] border-hair surface font-mono text-[12px] text-fg-muted disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
            >
              ← 뒤로
            </button>
            <button
              type="button"
              onClick={handleRestart}
              disabled={path.length === 0}
              className="h-10 rounded-[var(--radius-button)] border-hair surface font-mono text-[12px] text-fg-muted disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
            >
              ↻ 처음부터
            </button>
          </section>

          <ComboDetailSheet
            open={pickedCombo !== null}
            combo={pickedCombo}
            mix={pickedMix}
            raiseSize={raiseLabel}
            onClose={() => setPickedCombo(null)}
          />
        </>
      )}
    </div>
  );
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

type SeatStatus = 'waiting' | 'active' | 'folded' | 'acted';

interface SeatRow {
  pos: string;
  status: SeatStatus;
  label: string;
}

function buildSeatState(path: string[], activeActor: string | undefined): SeatRow[] {
  const latestAction = new Map<string, string>();
  for (const tok of path) {
    const us = tok.indexOf('_');
    if (us < 0) continue;
    latestAction.set(tok.slice(0, us), tok.slice(us + 1));
  }
  return POSITIONS_6MAX.map((pos) => {
    const act = latestAction.get(pos);
    if (activeActor === pos) return { pos, status: 'active', label: '차례' };
    if (!act) return { pos, status: 'waiting', label: '대기' };
    if (act === 'FOLD') return { pos, status: 'folded', label: '폴드' };
    return { pos, status: 'acted', label: prettyAction(act) };
  });
}

function SeatRibbon({ state }: { state: SeatRow[] }) {
  // One 6-slot grid that spans the viewport — always on one line.
  return (
    <section aria-label="포지션별 액션" className="mb-3 grid grid-cols-6 gap-1">
      {state.map((row) => (
        <div
          key={row.pos}
          className={cn(
            'flex flex-col items-center rounded-[var(--radius-button)] border px-0.5 py-1 font-mono text-[10px] transition-colors',
            row.status === 'active' &&
              'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)]',
            row.status === 'waiting' &&
              'border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] text-fg-muted opacity-60',
            row.status === 'folded' &&
              'border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] text-fg-muted line-through opacity-70',
            row.status === 'acted' &&
              'border-[color:var(--color-gold)]/50 bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]',
          )}
        >
          <span className="font-display text-[12px] font-bold leading-none">{row.pos}</span>
          <span className="mt-0.5 leading-none truncate max-w-full">{row.label}</span>
        </div>
      ))}
    </section>
  );
}

/* ─────────── resolve / build helpers ─────────── */

function resolveNode(decisions: DecisionsJson, path: string[]): NodeData | null {
  const actor = nextActor(path);
  if (!actor) return null;

  // Special case: if every seat in front of BB has folded and nobody
  // raised, BB wins the pot uncontested — no decision to make.
  const tokensWithAct = path.map((t) => t.split('_'));
  const folds = tokensWithAct.filter((x) => x[x.length - 1] === 'FOLD').length;
  const hasAggression = path.some((t) => {
    const act = t.slice(t.indexOf('_') + 1);
    return act !== 'FOLD';
  });
  if (actor === 'BB' && !hasAggression && folds >= 5) {
    return { actor, actions: {}, legal: [], bbWins: true };
  }

  const activeTokens = path.filter((t) => !t.endsWith('_FOLD'));
  const key = [...activeTokens, actor].join('_');
  const raw = decisions[key];
  if (raw) return { actor, actions: raw, legal: Object.keys(raw).sort(actionSortKey) };

  // Fallback: once someone's already all-in preflop, every remaining
  // actor's choice reduces to call-the-jam or fold — no more raising.
  // The deep-solver data for these spots is unreliable (see isSaneNode
  // in the parser), so we synthesise the two-button decision here and
  // stop after everyone has responded to the jam.
  const allInIdx = path.findIndex((t) => t.slice(t.indexOf('_') + 1) === 'AllIn');
  if (allInIdx >= 0) {
    const jammer = path[allInIdx]!.slice(0, path[allInIdx]!.indexOf('_'));
    if (actor === jammer) return { actor, actions: {}, legal: [], showdown: true };
    return { actor, actions: {}, legal: ['Call', 'FOLD'], postAllIn: true };
  }

  return { actor, actions: {}, legal: [] };
}

function nextActor(path: string[]): string | null {
  const folded = new Set<string>();
  let lastActor: string | null = null;
  for (const tok of path) {
    const us = tok.indexOf('_');
    if (us < 0) continue;
    const pos = tok.slice(0, us);
    const action = tok.slice(us + 1);
    lastActor = pos;
    if (action === 'FOLD') folded.add(pos);
  }
  const order = POSITIONS_6MAX;
  const startIdx = lastActor == null ? 0 : (order.indexOf(lastActor) + 1) % order.length;
  for (let off = 0; off < order.length; off++) {
    const cand = order[(startIdx + off) % order.length];
    if (cand && !folded.has(cand)) return cand;
  }
  return null;
}

function buildComboMixes(node: NodeData): Record<string, ComboMix> {
  const out: Record<string, ComboMix> = {};
  const raiseBand = new Set(Object.keys(node.actions).filter((a) => isRaiseAction(a)));
  const callBand = 'Call' in node.actions;
  const foldBand = 'FOLD' in node.actions;

  for (const combo of enumerateCombos()) {
    let raise = 0;
    for (const a of raiseBand) raise += node.actions[a]?.[combo] ?? 0;
    const call = callBand ? (node.actions['Call']?.[combo] ?? 0) : 0;
    const foldRaw = foldBand ? (node.actions['FOLD']?.[combo] ?? 0) : 0;
    const total = raise + call + foldRaw;
    if (total <= 0) continue;
    const mix: ComboMix = { raise: raise / total, fold: foldRaw / total };
    if (callBand) mix.call = call / total;
    out[combo] = mix;
  }
  return out;
}

function isRaiseAction(a: string): boolean {
  if (a === 'AllIn') return true;
  return a.endsWith('bb');
}

function enumerateCombos(): string[] {
  const out: string[] = [];
  for (let i = 0; i < RANKS.length; i++) {
    for (let j = 0; j < RANKS.length; j++) {
      const a = RANKS[i]!;
      const b = RANKS[j]!;
      if (i === j) out.push(a + a);
      else if (i < j) out.push(a + b + 's');
      else out.push(b + a + 'o');
    }
  }
  return out;
}

function actionSortKey(a: string, b: string): number {
  const score = (x: string) => {
    if (x === 'FOLD') return 0;
    if (x === 'Call') return 1;
    if (x === 'AllIn') return 99;
    if (x.endsWith('bb')) return 10 + Number(x.slice(0, -2));
    return 50;
  };
  return score(a) - score(b);
}

function actionColour(a: string): string {
  if (a === 'FOLD') return '#2B5F8F';
  if (a === 'Call') return '#1F9D55';
  if (a === 'AllIn') return '#D4AF37';
  if (a.endsWith('bb')) return '#C8102E';
  return '#888';
}

function prettyAction(a: string, compact = false): string {
  if (a === 'FOLD') return '폴드';
  if (a === 'Call') return '콜';
  if (a === 'AllIn') return '올인';
  if (a.endsWith('bb')) return compact ? a : `레이즈 ${a}`;
  return a;
}

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}
