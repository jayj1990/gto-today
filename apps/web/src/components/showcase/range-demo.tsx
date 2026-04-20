'use client';

import { useEffect, useState } from 'react';
import { RangeGrid, type ComboMix } from '@gto/ui';
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
  const [mixes, setMixes] = useState<Record<string, ComboMix>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPreflopChart('6max', position)
      .then((chart) => {
        if (cancelled) return;
        if (!chart) {
          setMixes({});
          return;
        }
        const out: Record<string, ComboMix> = {};
        for (const [k, v] of Object.entries(chart)) {
          out[k] = { raise: v.raise, fold: v.fold };
        }
        setMixes(out);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [position]);

  const playedCount = Object.values(mixes).filter((m) => m.raise > 0).length;

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
        <RangeGrid mixes={mixes} highlight="AA" />
        <dl className="space-y-3 text-[13px]">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
              포지션
            </dt>
            <dd className="font-display text-[24px] font-bold">{position}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
              플레이하는 핸드
            </dt>
            <dd className="font-mono text-[18px]">{playedCount} / 169</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
              상태
            </dt>
            <dd className="text-fg-muted">
              {loading ? '불러오는 중…' : '실제 GTO 데이터 (/data/preflop)'}
            </dd>
          </div>
          <p className="max-w-sm text-[12px] text-fg-muted">
            칸이 밝을수록 레이즈 빈도가 높습니다. 진한 골드는 항상 레이즈, 회색은 항상 폴드,
            그 중간은 믹스 전략입니다.
          </p>
        </dl>
      </div>
    </div>
  );
}
