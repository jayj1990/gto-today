'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RangeGrid, type ComboMix } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';

type DecisionsJson = Record<string, Record<string, Record<string, number>>>;

/**
 * GTO Wizard-style preflop game-tree explorer.
 *
 * The top breadcrumb bar is our equivalent of GTOWizard's action ribbon.
 * Starting from an empty path ("the deck is dealt"), the user picks the
 * first actor's action (UTG Raise 2.5 or UTG Fold), which advances the
 * path. At each step we:
 *
 *   1. Read qb_decisions.json, keyed by the current action path, to
 *      pull the mix per combo for the ACTOR at this node.
 *   2. Render that mix on a 13×13 RangeGrid — highest-freq action per
 *      combo drives the cell colour.
 *   3. List the available actions underneath as buttons so the user
 *      can continue navigating.
 *
 * Data path is always the flat-file key format that TexasSolver's
 * qb_ranges uses: POS_ACTION_POS_ACTION_... No in-app remapping.
 */

const POSITIONS_6MAX: readonly string[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

// Action tokens that advance from one actor to the next but aren't
// the standard 'Call' / 'FOLD' / '{size}bb' / 'AllIn' tokens. Kept
// in sync with the qb_ranges file names.
const STANDARD_ACTIONS: readonly string[] = ['FOLD', 'Call', 'AllIn'];

interface NodeData {
  actor: string;
  pathTokens: string[];
  // Action → combo → freq. Missing combos = 0 (i.e. folded by default).
  actions: Record<string, Record<string, number>>;
  legal: string[]; // sorted for display
}

/** All 169 combos in descending-strength order for the grid rows/cols. */
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

export default function ChartsPage() {
  const [decisions, setDecisions] = useState<DecisionsJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/preflop/6max_100bb_qb_decisions.json')
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
  }, []);

  const node: NodeData | null = useMemo(() => {
    if (!decisions) return null;
    return resolveNode(decisions, path);
  }, [decisions, path]);

  const handleAction = (action: string) => {
    setPath((p) => [...p, action]);
  };

  const handlePop = (idx: number) => {
    setPath((p) => p.slice(0, idx));
  };

  // Render each cell's mix by picking the dominant action's colour.
  // Kept intentionally simple: raise=red, call=green, fold=grey.
  const mixes: Record<string, ComboMix> = useMemo(() => {
    if (!node) return {};
    return buildComboMixes(node);
  }, [node]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        <header className="mb-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            GTO 게임트리 탐색
          </p>
          <h1 className="mt-2 font-display text-[26px] font-bold tracking-[-0.015em]">
            프리플랍 차트 · 6맥스 100BB
          </h1>
          <p className="mt-1 text-[13px] text-fg-muted">
            각 포지션의 액션을 누르면 다음 플레이어의 차트가 나타납니다.
          </p>
        </header>

        {loading && (
          <p className="font-mono text-[13px] text-fg-muted">차트 불러오는 중…</p>
        )}

        {!loading && !decisions && (
          <p className="text-[13px] text-[color:var(--color-raise)]">
            차트 데이터를 불러오지 못했어요.
          </p>
        )}

        {node && (
          <>
            {/* Action breadcrumb */}
            <section className="mb-4 overflow-x-auto">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setPath([])}
                  className={cn(
                    'rounded-full border px-3 py-1 font-mono text-[11px]',
                    path.length === 0
                      ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)]'
                      : 'border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] text-fg-muted',
                  )}
                >
                  시작
                </button>
                {path.map((tok, i) => {
                  const isCurrent = i === path.length - 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePop(i + 1)}
                      className={cn(
                        'rounded-full border px-3 py-1 font-mono text-[11px]',
                        isCurrent
                          ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)]'
                          : 'border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] text-fg-muted',
                      )}
                    >
                      {tok.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Actor banner */}
            <section className="mb-4 rounded-[var(--radius-button)] border-hair surface px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
                현재 액션
              </p>
              <p className="mt-1 font-display text-[22px] font-bold">
                <span className="text-[color:var(--color-accent)]">{node.actor}</span>{' '}
                <span className="text-fg-muted text-[16px] font-normal">차례</span>
              </p>
            </section>

            {/* Chart */}
            <section className="mb-4">
              {Object.keys(mixes).length > 0 ? (
                <RangeGrid mixes={mixes} className="w-full" />
              ) : (
                <div className="rounded-[var(--radius-panel)] border-hair surface p-6 text-center">
                  <p className="font-mono text-[12px] text-fg-muted">
                    이 노드의 차트 데이터가 없어요.
                  </p>
                </div>
              )}
            </section>

            {/* Action buttons for this node */}
            {node.legal.length > 0 && (
              <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {node.legal.map((act) => {
                  const color = actionColour(act);
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => handleAction(`${node.actor}_${act}`)}
                      className="h-12 rounded-[var(--radius-button)] border font-mono text-[13px] font-semibold active:scale-[0.98]"
                      style={{
                        background: `${color}22`,
                        borderColor: `${color}66`,
                        color,
                      }}
                    >
                      {prettyAction(act)}
                    </button>
                  );
                })}
              </section>
            )}

            <p className="mt-6 text-[12px] text-fg-muted">
              데이터: TexasSolver 0.2 · 6max 100BB · 2.5x open · 500 rake.{' '}
              <Link
                href="/live/play"
                className="underline-offset-4 hover:underline"
              >
                실전 모드로 돌아가기 →
              </Link>
            </p>
          </>
        )}
      </main>
    </>
  );
}

/* ─────────── helpers ─────────── */

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

/** Walk the qb_decisions lookup and return the current node. */
function resolveNode(decisions: DecisionsJson, path: string[]): NodeData | null {
  const actor = nextActor(path);
  if (!actor) return null;

  // TexasSolver's qb_ranges treats folds as implicit — the file tree
  // only tracks RAISES / CALLS / 3-BETS etc. Strip out every '_FOLD'
  // segment before building the lookup key.
  const activeTokens = path.filter((t) => !t.endsWith('_FOLD'));
  const keyParts = [...activeTokens, actor];
  const key = keyParts.join('_');

  const raw = decisions[key];
  if (!raw) {
    return { actor, pathTokens: path, actions: {}, legal: [] };
  }

  const legal = Object.keys(raw).sort(actionSortKey);
  return { actor, pathTokens: path, actions: raw, legal };
}

/** Compute the next position to act given the path so far.
 *  First decision: UTG. After UTG_Fold: MP. After UTG_2.5bb: MP (next
 *  in seat order). After UTG_2.5bb_BTN_Call_BB_11.0bb: UTG (action has
 *  wrapped back to the original raiser). */
function nextActor(path: string[]): string | null {
  // Simple interpretation: tokens come in POS_ACTION pairs. Each
  // token in our path is POS_ACTION joined. Scan through and track
  // who acted last; the next actor is seated after them, skipping
  // anyone already folded.
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

/** Turn the decision-node mix into ComboMix records for RangeGrid. */
function buildComboMixes(node: NodeData): Record<string, ComboMix> {
  const out: Record<string, ComboMix> = {};
  const allCombos = enumerateCombos();

  // Categorise actions into 3 bands: fold / call / raise. RangeGrid
  // only understands {raise, call?, fold}.
  const raiseBand = new Set(Object.keys(node.actions).filter((a) => isRaiseAction(a)));
  const callBand = 'Call' in node.actions;
  const foldBand = 'FOLD' in node.actions;

  for (const combo of allCombos) {
    let raise = 0;
    for (const a of raiseBand) raise += node.actions[a]?.[combo] ?? 0;
    const call = callBand ? node.actions['Call']?.[combo] ?? 0 : 0;
    const foldRaw = foldBand ? node.actions['FOLD']?.[combo] ?? 0 : 0;
    // Normalise so the three freqs sum to 1.
    const total = raise + call + foldRaw;
    if (total <= 0) continue;
    const mix: ComboMix = {
      raise: raise / total,
      fold: foldRaw / total,
    };
    if (callBand) mix.call = call / total;
    out[combo] = mix;
  }
  return out;
}

function isRaiseAction(a: string): boolean {
  if (a === 'AllIn') return true;
  if (a.endsWith('bb')) return true;
  return false;
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
  if (a === 'FOLD') return 'rgba(136,136,140,0.9)';
  if (a === 'Call') return '#1F9D55';
  if (a === 'AllIn') return '#D4AF37';
  if (a.endsWith('bb')) return '#D4AF37';
  return '#888';
}

function prettyAction(a: string): string {
  if (a === 'FOLD') return '폴드';
  if (a === 'Call') return '콜';
  if (a === 'AllIn') return '올인';
  if (a.endsWith('bb')) return `레이즈 ${a}`;
  return a;
}
