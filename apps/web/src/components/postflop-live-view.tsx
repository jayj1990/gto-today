'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CardView, RangeGrid, type ComboMix } from '@gto/ui';

export interface PostflopLiveViewProps {
  board: [string, string, string];
  oopRange: string;
  ipRange: string;
  pot: number;
  effStack: number;
  scenario: 'cash' | 'mtt';
  onBack: () => void;
}

const ACTION_LABEL: Record<string, string> = {
  check: '체크',
  bet33: '1/3 벳',
  bet50: '1/2 벳',
  bet75: '3/4 벳',
  bet_pot: '팟 벳',
  bet_overbet: '오버벳',
  call: '콜',
  fold: '폴드',
  raise_small: '레이즈',
  raise_big: '대형 레이즈',
};

const ACTION_COLOR: Record<string, string> = {
  check: 'var(--color-fg-muted)',
  bet33: 'var(--color-raise)',
  bet50: 'var(--color-raise)',
  bet75: 'var(--color-raise)',
  bet_pot: 'var(--color-raise)',
  bet_overbet: 'var(--color-raise)',
  call: 'var(--color-call)',
  fold: 'var(--color-fold)',
  raise_small: 'var(--color-raise)',
  raise_big: 'var(--color-raise)',
};

interface SolveState {
  phase: 'loading' | 'error' | 'done';
  elapsed: number;
  result?: {
    actions: string[];
    mix: Record<string, number[]>;
    exploitability: number;
    note?: string;
  };
  error?: string;
}

/**
 * Wraps the live solver call. Shows a spinner with elapsed seconds,
 * then renders the resulting strategy as a range grid (color-coded by
 * the dominant action per combo).
 */
export function PostflopLiveView({
  board,
  oopRange,
  ipRange,
  pot,
  effStack,
  scenario,
  onBack,
}: PostflopLiveViewProps) {
  const [state, setState] = useState<SolveState>({ phase: 'loading', elapsed: 0 });

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    const tick = setInterval(() => {
      if (!cancelled) {
        setState((s) => ({ ...s, elapsed: Math.floor((Date.now() - start) / 1000) }));
      }
    }, 500);

    fetch('/api/live-solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board, oopRange, ipRange, pot, effStack, scenario }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        clearInterval(tick);
        if ('error' in data) {
          setState({ phase: 'error', elapsed: 0, error: data.error });
        } else {
          setState({ phase: 'done', elapsed: 0, result: data });
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        clearInterval(tick);
        setState({
          phase: 'error',
          elapsed: 0,
          error: e instanceof Error ? e.message : '솔빙 실패',
        });
      });

    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [board, oopRange, ipRange, pot, effStack, scenario]);

  return (
    <section className="mt-3">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {board.map((c) => (
            <CardView
              key={c}
              rank={c[0]!}
              suit={c[1] as 's' | 'h' | 'd' | 'c'}
              size="sm"
              deckScheme="four-color"
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted"
        >
          ← 보드 변경
        </button>
      </header>

      {state.phase === 'loading' && (
        <div className="rounded-[var(--radius-panel)] border-hair surface p-8 text-center">
          <motion.div
            className="mx-auto h-10 w-10 rounded-full border-2 border-[color:var(--color-accent)]/30 border-t-[color:var(--color-accent)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="mt-4 font-mono text-[13px] text-fg">솔빙 중…</p>
          <p className="mt-1 font-mono text-[11px] text-fg-muted tabular-nums">
            {state.elapsed}초 경과 · 예상 30~90초
          </p>
        </div>
      )}

      {state.phase === 'error' && (
        <div className="rounded-[var(--radius-panel)] border border-[color:var(--color-raise)]/40 bg-[color:var(--color-raise)]/5 p-6 text-center">
          <p className="text-[13px] text-[color:var(--color-raise)]">
            솔빙 실패: {state.error}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 font-mono text-[12px] text-[color:var(--color-raise)] underline-offset-2 underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {state.phase === 'done' && state.result && (
        <StrategyView result={state.result} />
      )}
    </section>
  );
}

function StrategyView({
  result,
}: {
  result: { actions: string[]; mix: Record<string, number[]>; exploitability: number; note?: string };
}) {
  // Convert WASM mix (per-combo freq array) into RangeGrid ComboMix.
  // Action index 0 typically = check/fold, 1..N = raises. We map:
  //   dominant bet index → raise band, call index → call, fold → fold.
  const mixes: Record<string, ComboMix> = {};
  for (const [combo, freqs] of Object.entries(result.mix)) {
    let raise = 0;
    let call = 0;
    let fold = 0;
    for (let i = 0; i < result.actions.length; i++) {
      const a = result.actions[i]!;
      const f = freqs[i] ?? 0;
      if (a === 'check' || a === 'fold') fold += f;
      else if (a === 'call') call += f;
      else raise += f;
    }
    mixes[combo] = call > 0 ? { raise, call, fold } : { raise, fold };
  }

  return (
    <>
      <section className="mb-3">
        <RangeGrid mixes={mixes} className="w-full" />
      </section>

      <section className="mb-3 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px] text-fg-muted">
        {result.actions.map((a) => (
          <span key={a} className="inline-flex items-center gap-1">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: ACTION_COLOR[a] ?? '#888' }}
            />
            {ACTION_LABEL[a] ?? a}
          </span>
        ))}
      </section>

      <section className="rounded-[var(--radius-button)] border-hair surface p-3 text-center font-mono text-[11px] text-fg-muted">
        수렴 exploitability <span className="text-fg">{result.exploitability.toFixed(2)}%</span>
        {result.note && (
          <>
            {' · '}
            <span className="text-[color:var(--color-warning)]">{result.note}</span>
          </>
        )}
      </section>
    </>
  );
}
