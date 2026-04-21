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
    elapsedMs?: number;
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
  // Incrementing this key re-runs the effect below — used by the
  // retry button on mock/error to force a fresh attempt with a
  // slightly tweaked maxIter so the cache key doesn't collide.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    setState({ phase: 'loading', elapsed: 0 });

    const tick = setInterval(() => {
      if (!cancelled) {
        setState((s) => ({ ...s, elapsed: Math.floor((Date.now() - start) / 1000) }));
      }
    }, 500);

    // 4:20 soft deadline — Vercel Fluid Compute caps at 300s, and the
    // user experience past 4 minutes is already broken. Abort a little
    // before the function itself would so we show a friendly error
    // instead of the browser's fetch failing noisily.
    const controller = new AbortController();
    const hardTimeout = setTimeout(() => controller.abort(), 260_000);

    fetch('/api/live-solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        board,
        oopRange,
        ipRange,
        pot,
        effStack,
        scenario,
        // 100 iters balances convergence vs. timeout budget —
        // below 80 leaves exploitability at 5%+ on wide ranges; above
        // 150 risks hitting the Function's 300s cap. Retries bump
        // +1 to bust the cache key (and pick up marginal convergence).
        maxIter: 100 + attempt,
      }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        clearInterval(tick);
        clearTimeout(hardTimeout);
        if ('error' in data) {
          setState({ phase: 'error', elapsed: 0, error: data.error });
        } else {
          setState({ phase: 'done', elapsed: 0, result: data });
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        clearInterval(tick);
        clearTimeout(hardTimeout);
        const isAbort = e instanceof Error && e.name === 'AbortError';
        setState({
          phase: 'error',
          elapsed: 0,
          error: isAbort
            ? '솔빙이 너무 오래 걸립니다. 더 좁은 레인지나 다른 보드로 시도해 보세요.'
            : e instanceof Error
              ? e.message
              : '솔빙 실패',
        });
      });

    return () => {
      cancelled = true;
      clearInterval(tick);
      clearTimeout(hardTimeout);
      controller.abort();
    };
  }, [board, oopRange, ipRange, pot, effStack, scenario, attempt]);

  const retry = () => setAttempt((n) => n + 1);

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
          <p className="mt-4 font-mono text-[13px] text-fg">
            {state.elapsed < 5 ? '캐시 확인…' : '솔빙 중…'}
          </p>
          <p className="mt-1 font-mono text-[11px] text-fg-muted tabular-nums">
            {state.elapsed}초 · 보드·레인지 기반 첫 솔브는 최대 90초
          </p>
          {state.elapsed >= 30 && state.elapsed < 120 && (
            <p className="mt-2 text-[11px] text-[color:var(--color-accent)]">
              같은 스팟 재방문 시 즉시 결과가 나옵니다.
            </p>
          )}
          {state.elapsed >= 120 && (
            <p className="mt-2 text-[11px] text-[color:var(--color-warning)]">
              솔빙이 예상보다 오래 걸리고 있어요 ({state.elapsed}초).
              <br />
              240초까지 자동으로 기다립니다.
            </p>
          )}
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
        <StrategyView result={state.result} onRetry={retry} />
      )}
    </section>
  );
}

function StrategyView({
  result,
  onRetry,
}: {
  result: {
    actions: string[];
    mix: Record<string, number[]>;
    exploitability: number;
    note?: string;
    elapsedMs?: number;
  };
  onRetry: () => void;
}) {
  const isCache = (result.note ?? '').startsWith('cache hit');
  const isMock = (result.note ?? '').startsWith('Mock');
  const elapsedSec = result.elapsedMs ? (result.elapsedMs / 1000).toFixed(1) : null;
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
      {isMock && (
        <section className="mb-3 rounded-[var(--radius-panel)] border border-[color:var(--color-warning)]/50 bg-[color:var(--color-warning)]/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-warning)]">
                솔버 에러 · 보조 데이터 표시 중
              </p>
              <p className="mt-1 text-[11px] text-fg-muted truncate">{result.note}</p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="shrink-0 rounded-[var(--radius-button)] border border-[color:var(--color-warning)]/60 bg-[color:var(--color-warning)]/20 px-3 py-1.5 font-mono text-[11px] font-semibold text-[color:var(--color-warning)]"
            >
              재시도
            </button>
          </div>
        </section>
      )}
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
        <div>
          수렴 exploitability{' '}
          <span
            className={
              result.exploitability < 2
                ? 'text-[color:var(--color-call)]'
                : result.exploitability < 10
                  ? 'text-[color:var(--color-warning)]'
                  : 'text-[color:var(--color-raise)]'
            }
          >
            {result.exploitability.toFixed(2)}%
          </span>
          {elapsedSec && !isMock && (
            <>
              {' · '}
              {isCache ? (
                <span className="text-[color:var(--color-call)]">캐시 히트 {elapsedSec}s</span>
              ) : (
                <span>솔브 {elapsedSec}s</span>
              )}
            </>
          )}
        </div>
        {!isMock && result.exploitability >= 2 && (
          <div className="mt-1 text-[10px] text-[color:var(--color-warning)]">
            {result.exploitability >= 10
              ? '수렴 미완료 — 결과 참고만, 재시도 권장'
              : '수렴 정확도 낮음 — 일반 경향은 유효'}
          </div>
        )}
      </section>
    </>
  );
}
