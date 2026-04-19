'use client';

import { useEffect, useState } from 'react';
import { RangeGrid } from '@gto/ui';
import { getPreflopChart } from '@gto/gto-data';
import type { Position } from '@gto/poker-core';

const POSITIONS: { id: Position; label: string; openPct: string }[] = [
  { id: 'UTG', label: 'UTG', openPct: '~20%' },
  { id: 'MP', label: 'MP', openPct: '~30%' },
  { id: 'CO', label: 'CO', openPct: '~41%' },
  { id: 'BTN', label: 'BTN', openPct: '~54%' },
  { id: 'SB', label: 'SB', openPct: '~37%' },
];

/**
 * /dev/showcase — pull a real preflop chart and render the 13×13 grid.
 * Switches positions live, no re-fetch thanks to the in-memory cache in
 * @gto/gto-data.
 */
export function RangeDemo() {
  const [position, setPosition] = useState<Position>('BTN');
  const [freqs, setFreqs] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPreflopChart('6max', position)
      .then((chart) => {
        if (cancelled) return;
        if (!chart) {
          setFreqs({});
          return;
        }
        const out: Record<string, number> = {};
        for (const [k, v] of Object.entries(chart)) {
          out[k] = v.raise;
        }
        setFreqs(out);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [position]);

  const playedCount = Object.values(freqs).filter((f) => f > 0).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {POSITIONS.map((p) => {
          const active = p.id === position;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPosition(p.id)}
              style={{ touchAction: 'manipulation' }}
              className={
                'select-none rounded-full border-hair px-3 py-1.5 text-[13px] font-mono transition-colors active:scale-[0.96] ' +
                (active
                  ? 'bg-[color:var(--color-accent)] text-noir font-semibold'
                  : 'text-fg-muted')
              }
            >
              {p.label}
              <span className="ml-2 opacity-70">{p.openPct}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-6">
        <RangeGrid frequencies={freqs} highlight="AA" />
        <dl className="space-y-3 text-[13px]">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
              Position
            </dt>
            <dd className="font-display text-[24px] font-bold">{position}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
              Combos played
            </dt>
            <dd className="font-mono text-[18px]">{playedCount} / 169</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
              Status
            </dt>
            <dd className="text-fg-muted">{loading ? 'Loading…' : 'Live from /data/preflop'}</dd>
          </div>
          <p className="max-w-sm text-[12px] text-fg-muted">
            차트 밀도는 raise 빈도에 선형 비례. 밝은 골드 = 항상 레이즈, 회색 = 항상 폴드,
            중간 = mixed strategy.
          </p>
        </dl>
      </div>
    </div>
  );
}
