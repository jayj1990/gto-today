'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn, RangeGrid, type ComboMix } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';

/**
 * 9-max MTT preflop chart ladder — the full depth × position matrix.
 *
 * Depths 40/60/100BB serve open-raise (RFI) charts; 10/20BB serve
 * Nash jam-or-fold charts (raise = all-in). Data is the static JSON
 * emitted by build-preflop.ts (9max_{depth}_{scenario}_{pos}.json),
 * fetched per selection and session-cached.
 */

const DEPTHS = [
  { bb: 100, scenario: 'rfi', label: '100BB' },
  { bb: 60, scenario: 'rfi', label: '60BB' },
  { bb: 40, scenario: 'rfi', label: '40BB' },
  { bb: 20, scenario: 'jam', label: '20BB' },
  { bb: 10, scenario: 'jam', label: '10BB' },
] as const;

const POSITIONS = ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB'] as const;

type ChartJson = Record<string, { raise: number; fold: number }>;

const chartCache = new Map<string, Promise<ChartJson>>();
function fetchChart(key: string): Promise<ChartJson> {
  let p = chartCache.get(key);
  if (!p) {
    p = fetch(`/data/preflop/${key}.json`).then((r) => {
      if (!r.ok) throw new Error(`${key} ${r.status}`);
      return r.json() as Promise<ChartJson>;
    });
    chartCache.set(key, p);
  }
  return p;
}

export default function MttPreflopPage() {
  const [depthIdx, setDepthIdx] = useState(0);
  const [pos, setPos] = useState<(typeof POSITIONS)[number]>('UTG');
  const [chart, setChart] = useState<ChartJson | null>(null);
  const [error, setError] = useState(false);

  const depth = DEPTHS[depthIdx]!;
  const isJam = depth.scenario === 'jam';
  const chartKey = `9max_${depth.bb}bb_${depth.scenario}_${pos}`;

  useEffect(() => {
    let cancelled = false;
    setError(false);
    void fetchChart(chartKey)
      .then((c) => {
        if (!cancelled) setChart(c);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [chartKey]);

  const mixes = useMemo<Record<string, ComboMix>>(() => {
    if (!chart) return {};
    const out: Record<string, ComboMix> = {};
    for (const [combo, m] of Object.entries(chart)) {
      if (m.raise > 0) out[combo] = { raise: m.raise, fold: m.fold };
    }
    return out;
  }, [chart]);

  const playedCount = Object.keys(mixes).length;

  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <header className="mb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
            MTT · 9맥스
          </p>
          <h1 className="font-display mt-1 text-[24px] font-bold leading-[1.1] tracking-[-0.02em]">
            프리플랍 차트
          </h1>
          <p className="text-fg-muted mt-2 text-[13px] leading-[1.55]">
            스택 뎁스별 오픈 레인지. 40BB 이상은 레이즈 오픈,{' '}
            <span className="text-fg">20BB 이하는 올인 or 폴드</span> Nash 차트예요.
          </p>
        </header>

        {/* Depth pills */}
        <section className="mb-2 overflow-x-auto">
          <div className="flex min-w-max gap-1.5">
            {DEPTHS.map((d, i) => {
              const active = i === depthIdx;
              return (
                <button
                  key={d.bb}
                  type="button"
                  onClick={() => setDepthIdx(i)}
                  aria-pressed={active}
                  aria-label={`${d.label} 차트`}
                  className={cn(
                    'inline-flex h-11 items-center whitespace-nowrap rounded-[var(--radius-button)] border px-3.5 font-mono text-[12px]',
                    active
                      ? 'bg-[color:var(--color-accent)]/15 border-[color:var(--color-accent)] text-[color:var(--color-accent)]'
                      : 'border-hair surface text-fg-muted',
                  )}
                >
                  {d.label}
                  {d.scenario === 'jam' && (
                    <span className="ml-1 text-[9px] uppercase tracking-[0.14em] opacity-80">
                      올인
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Position pills */}
        <section className="mb-3 overflow-x-auto">
          <div className="flex min-w-max gap-1.5">
            {POSITIONS.map((p) => {
              const active = p === pos;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPos(p)}
                  aria-pressed={active}
                  aria-label={`${p} 포지션`}
                  className={cn(
                    'inline-flex h-11 items-center rounded-[var(--radius-button)] border px-3 font-mono text-[12px]',
                    active
                      ? 'bg-[color:var(--color-accent)]/15 border-[color:var(--color-accent)] text-[color:var(--color-accent)]'
                      : 'border-hair surface text-fg-muted',
                  )}
                >
                  {p === 'UTG1' ? 'UTG+1' : p}
                </button>
              );
            })}
          </div>
        </section>

        {error ? (
          <div className="border-[color:var(--color-raise)]/30 bg-[color:var(--color-raise)]/5 mt-4 rounded-[var(--radius-panel)] border p-5 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-raise)]">
              차트 로드 실패
            </p>
            <p className="text-fg mt-2 text-[13px]">네트워크 연결을 확인하고 다시 시도해주세요.</p>
          </div>
        ) : (
          <>
            <p className="text-fg-muted mb-2 text-center font-mono text-[11px]">
              {pos === 'UTG1' ? 'UTG+1' : pos} ·{' '}
              <span className="text-[color:var(--color-raise)]">{isJam ? '올인' : '레이즈'}</span>{' '}
              <span className="text-fg font-semibold tabular-nums">{playedCount}</span>
              /169 핸드
            </p>
            <RangeGrid mixes={mixes} />
            <section className="text-fg-muted mt-2 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px]">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: 'var(--color-raise)' }}
                />
                {isJam ? '올인' : '레이즈 오픈'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-sm bg-[color:var(--color-border)]"
                />
                폴드
              </span>
            </section>

            <div className="border-hair surface text-fg-muted mt-4 rounded-[var(--radius-button)] p-3 text-[12px] leading-[1.55]">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                읽는 법
              </p>
              <p className="mt-1">
                {isJam
                  ? '20BB 이하 숏스택은 레이즈 사이즈가 의미를 잃고 올인 or 폴드만 남아요. 레드 = 올인 (Nash 균형).'
                  : '앞에서 모두 폴드했을 때 이 포지션의 오픈 레인지. 뎁스가 얕아질수록 얼리 포지션이 타이트해져요.'}
              </p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
