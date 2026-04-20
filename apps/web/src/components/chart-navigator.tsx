'use client';

import { useEffect, useMemo, useState } from 'react';
import { RangeGrid, type ComboMix } from '@gto/ui';

type DecisionsJson = Record<string, Record<string, Record<string, number>>>;

const POSITIONS_6MAX: readonly string[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

interface NodeData {
  actor: string;
  actions: Record<string, Record<string, number>>;
  legal: string[];
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
  const handlePop = (idx: number) => setPath((p) => p.slice(0, idx));

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
          <section className="mb-4 overflow-x-auto">
            <div className="flex flex-wrap gap-1.5">
              <BreadcrumbChip label="시작" active={path.length === 0} onClick={() => setPath([])} />
              {path.map((tok, i) => (
                <BreadcrumbChip
                  key={i}
                  label={prettyToken(tok)}
                  active={i === path.length - 1}
                  onClick={() => handlePop(i + 1)}
                />
              ))}
            </div>
          </section>

          <section className="mb-4 rounded-[var(--radius-button)] border-hair surface px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
              현재 액션
            </p>
            <p className="mt-1 font-display text-[22px] font-bold">
              <span className="text-[color:var(--color-accent)]">{node.actor}</span>{' '}
              <span className="text-fg-muted text-[16px] font-normal">차례</span>
            </p>
          </section>

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

          {node.legal.length > 0 && (
            <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {node.legal.map((act) => {
                const color = actionColour(act);
                return (
                  <button
                    key={act}
                    type="button"
                    onClick={() => handleAction(act)}
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
        </>
      )}
    </div>
  );
}

function BreadcrumbChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 font-mono text-[11px]',
        active
          ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)]'
          : 'border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] text-fg-muted',
      )}
    >
      {label}
    </button>
  );
}

/* ─────────── resolve / build helpers ─────────── */

function resolveNode(decisions: DecisionsJson, path: string[]): NodeData | null {
  const actor = nextActor(path);
  if (!actor) return null;
  const activeTokens = path.filter((t) => !t.endsWith('_FOLD'));
  const key = [...activeTokens, actor].join('_');
  const raw = decisions[key];
  if (!raw) return { actor, actions: {}, legal: [] };
  return { actor, actions: raw, legal: Object.keys(raw).sort(actionSortKey) };
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

function prettyToken(tok: string): string {
  const [pos, ...rest] = tok.split('_');
  const act = rest.join('_');
  return `${pos} ${prettyAction(act)}`;
}

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}
