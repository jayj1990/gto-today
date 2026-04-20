'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  getBbDefenseChart,
  getPreflopChart,
  SUPPORTED_OPENERS,
  type BbDefenseStrategyJson,
  type PreflopStrategyJson,
} from '@gto/gto-data';
import type { Position } from '@gto/poker-core';
import { RangeGrid, cn, type ComboMix } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import {
  openLabel,
  resolveOpenSize,
  resolveStackBB,
  stackLabel,
  useLiveStore,
} from '@/lib/live-store';

type Scenario = 'rfi' | 'vs_open';

const RFI_POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB'];

/**
 * Live-mode chart view.
 *
 * User picks a scenario + the relevant position(s), the page loads the
 * matching 13x13 chart and renders it with the new GTO-Wizard-style
 * RangeGrid. Tapping a cell surfaces the specific combo's mix below.
 *
 * Data scope for this release:
 *   RFI         — hero opens from UTG / MP / CO / BTN / SB
 *   BB defense  — hero on BB facing a single open from UTG / CO / BTN
 *
 * Scenarios we don't have solver output for (vs 3-bet, vs squeeze, etc.)
 * are hidden so the UI never promises data we can't deliver.
 */
export default function LivePlayPage() {
  const config = useLiveStore((s) => s.config);
  const [scenario, setScenario] = useState<Scenario>('rfi');
  const [position, setPosition] = useState<Position>('BTN');
  const [opener, setOpener] = useState<Position>('BTN');
  const [mixes, setMixes] = useState<Record<string, ComboMix>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setHighlight(null);
    setMixes({});

    const task =
      scenario === 'rfi'
        ? getPreflopChart('6max', position).then((chart) => ({
            mixes: rfiToMixes(chart),
            found: chart !== null,
          }))
        : getBbDefenseChart(opener, '6max').then((chart) => ({
            mixes: bbToMixes(chart),
            found: chart !== null,
          }));

    task
      .then(({ mixes: next, found }) => {
        if (cancelled) return;
        if (!found) {
          setError('이 시나리오의 차트 데이터를 찾지 못했어요.');
        } else {
          setMixes(next);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '차트 로드 중 문제가 발생했어요.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [scenario, position, opener]);

  const focusedMix = highlight ? mixes[highlight] : null;
  const openBB = resolveOpenSize(config.openSize);
  const stackBB = resolveStackBB(config.stackBB);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-2xl flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
              실전 모드
            </p>
            <h1 className="mt-2 font-display text-[26px] font-bold tracking-[-0.015em]">
              GTO 차트
            </h1>
            <p className="mt-1 text-[13px] text-fg-muted">
              {config.gameType === 'cash' ? '캐시' : '토너먼트'} · {config.format} ·{' '}
              {stackLabel(config.stackBB)} · {openLabel(config.openSize)}
            </p>
          </div>
          <Link
            href="/live"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted"
          >
            설정 수정
          </Link>
        </header>

        {/* Scenario picker */}
        <section className="mt-6 space-y-4">
          <FieldRow label="시나리오">
            <Chip active={scenario === 'rfi'} onClick={() => setScenario('rfi')}>
              RFI (내가 먼저)
            </Chip>
            <Chip active={scenario === 'vs_open'} onClick={() => setScenario('vs_open')}>
              BB 디펜스
            </Chip>
          </FieldRow>

          {scenario === 'rfi' ? (
            <FieldRow label="내 포지션">
              {RFI_POSITIONS.map((p) => (
                <Chip key={p} active={position === p} onClick={() => setPosition(p)}>
                  {p}
                </Chip>
              ))}
            </FieldRow>
          ) : (
            <FieldRow label="오픈 포지션">
              {SUPPORTED_OPENERS.map((p) => (
                <Chip key={p} active={opener === p} onClick={() => setOpener(p)}>
                  {p}
                </Chip>
              ))}
            </FieldRow>
          )}
        </section>

        {/* Context summary (mimics GTO Wizard's detail-action top bar) */}
        <section className="mt-5 rounded-[var(--radius-button)] border-hair surface px-4 py-3 text-[12px] text-fg-muted">
          {scenario === 'rfi' ? (
            <p>
              <span className="font-mono text-[color:var(--color-accent)]">
                {position}
              </span>
              {' 기준 RFI 차트 — 앞 포지션 모두 폴드'}
              <span className="text-fg/50">
                {' / 스택 '}
                {stackBB}
                BB / 오픈 {openBB}x
              </span>
            </p>
          ) : (
            <p>
              <span className="font-mono text-[color:var(--color-accent)]">BB</span>
              {' 디펜스 — '}
              <span className="font-mono text-fg">
                {opener}
              </span>
              {' 오픈 '}
              {openBB}BB에 대한 대응
            </p>
          )}
        </section>

        {/* 13x13 chart */}
        <section className="mt-5">
          {loading && (
            <div className="flex h-60 items-center justify-center rounded-[var(--radius-panel)] border-hair surface">
              <p className="font-mono text-[12px] text-fg-muted">불러오는 중…</p>
            </div>
          )}
          {!loading && error && (
            <div className="rounded-[var(--radius-panel)] border border-[color:var(--color-raise)]/40 bg-[color:var(--color-raise)]/10 p-6 text-center">
              <p className="font-mono text-[12px] text-[color:var(--color-raise)]">{error}</p>
              <p className="mt-2 text-[12px] text-fg-muted">
                다른 시나리오나 포지션을 선택해 주세요.
              </p>
            </div>
          )}
          {!loading && !error && Object.keys(mixes).length > 0 && (
            <div className="w-full">
              <RangeGrid
                mixes={mixes}
                highlight={highlight ?? undefined}
                onCellClick={(combo) => setHighlight(combo)}
                className="w-full"
              />
            </div>
          )}

          {!error && <Legend scenario={scenario} />}
        </section>

        {/* Focused combo detail */}
        {focusedMix && (
          <section className="mt-5 rounded-[var(--radius-panel)] border-hair surface p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-[22px] font-bold tracking-[-0.02em]">
                {highlight}
              </h2>
              <button
                type="button"
                onClick={() => setHighlight(null)}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted"
              >
                닫기
              </button>
            </div>
            <ul className="mt-4 grid gap-y-2" style={{ gridTemplateColumns: '60px 1fr 56px' }}>
              <DetailRow
                label="레이즈"
                value={focusedMix.raise * 100}
                color="var(--color-raise)"
              />
              {scenario === 'vs_open' && (
                <DetailRow
                  label="콜"
                  value={(focusedMix.call ?? 0) * 100}
                  color="var(--color-call)"
                />
              )}
              <DetailRow
                label="폴드"
                value={focusedMix.fold * 100}
                color="var(--color-fold)"
              />
            </ul>
          </section>
        )}
      </main>
    </>
  );
}

/* ─────── Helpers ─────── */

function rfiToMixes(chart: PreflopStrategyJson | null): Record<string, ComboMix> {
  const out: Record<string, ComboMix> = {};
  if (!chart) return out;
  for (const [combo, entry] of Object.entries(chart)) {
    out[combo] = { raise: entry.raise, fold: entry.fold };
  }
  return out;
}

function bbToMixes(chart: BbDefenseStrategyJson | null): Record<string, ComboMix> {
  const out: Record<string, ComboMix> = {};
  if (!chart) return out;
  for (const [combo, entry] of Object.entries(chart)) {
    out[combo] = { raise: entry.raise, call: entry.call, fold: entry.fold };
  }
  return out;
}

function Legend({ scenario }: { scenario: Scenario }) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-fg-muted">
      <LegendDot color="#C8102E" label="레이즈" />
      {scenario === 'vs_open' && <LegendDot color="#1F9D55" label="콜" />}
      <LegendDot color="#2B5F8F" label="폴드" />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function DetailRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <li className="contents">
      <span className="flex items-center font-mono text-[13px] text-fg-muted">{label}</span>
      <div className="flex items-center">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--color-border)]">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
          />
        </div>
      </div>
      <span className="flex items-center justify-end font-mono text-[13px] font-semibold tabular-nums">
        {value.toFixed(1)}%
      </span>
    </li>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ touchAction: 'manipulation' }}
      className={cn(
        'select-none rounded-full border px-3 py-1.5 font-mono text-[12px] tracking-[0.04em] active:scale-[0.96]',
        active
          ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-noir font-semibold'
          : 'border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] text-fg-muted',
      )}
    >
      {children}
    </button>
  );
}
