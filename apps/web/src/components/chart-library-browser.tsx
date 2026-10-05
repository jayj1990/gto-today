'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn, ComboDetailSheet, RangeGrid, RangeLegend } from '@gto/ui';
import type { ActionSpec, ComboActions, PreflopChartData } from '@gto/poker-core';
import { CHART_GROUPS, chartUrl, type ChartGroupId, type LibraryChart } from '@gto/gto-data';
import { Skeleton } from './skeleton';

/**
 * 프리플랍 차트 라이브러리 — 묶음 칩 → 차트 칩 → 13×13 격자.
 *
 * /charts(캐시)와 /mtt/preflop(토너먼트)이 묶음 목록만 다르게 주고 같은
 * 화면을 쓴다. 차트 본체는 고를 때마다 /data/rye/{id}.json 을 받아 오고
 * 한 번 받은 건 페이지가 살아 있는 동안 기억한다. 20/10bb Nash 올인 차트는
 * 옛 {raise, fold} 꼴이라 여기서 같은 모양으로 올린다.
 */

export interface ChartLibraryBrowserProps {
  groups: readonly ChartGroupId[];
  className?: string;
}

type NashJson = Record<string, { raise: number; fold: number }>;

const NASH_ACTIONS: readonly ActionSpec[] = [
  { key: 'raise', kind: 'jam', label: '올인' },
  { key: 'fold', kind: 'fold', label: '폴드' },
];

const cache = new Map<string, Promise<PreflopChartData>>();

function load(c: LibraryChart): Promise<PreflopChartData> {
  let p = cache.get(c.id);
  if (!p) {
    p = fetch(chartUrl(c)).then(async (r) => {
      if (!r.ok) throw new Error(`${c.id} ${r.status}`);
      if (c.source.kind === 'rye') return (await r.json()) as PreflopChartData;
      const nash = (await r.json()) as NashJson;
      const cells: Record<string, ComboActions> = {};
      for (const [combo, m] of Object.entries(nash))
        cells[combo] = { raise: m.raise, fold: m.fold };
      return { actions: NASH_ACTIONS, cells };
    });
    cache.set(c.id, p);
  }
  return p;
}

const PILL =
  'inline-flex h-11 items-center whitespace-nowrap rounded-[var(--radius-button)] border px-3.5 font-mono text-[12px]';
const PILL_ON =
  'bg-[color:var(--color-accent)]/15 border-[color:var(--color-accent)] text-[color:var(--color-accent)]';
const PILL_OFF = 'border-hair surface text-fg-muted';

export function ChartLibraryBrowser({ groups, className }: ChartLibraryBrowserProps) {
  const [groupId, setGroupId] = useState<ChartGroupId>(groups[0]!);
  // 묶음마다 마지막으로 보던 차트를 기억한다 — 오픈 100bb 에서 CO 를 보다가
  // 25bb 로 갔다 와도 CO 가 그대로.
  const [pickById, setPickById] = useState<Partial<Record<ChartGroupId, string>>>({});
  const [data, setData] = useState<PreflopChartData | null>(null);
  const [error, setError] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  const group = CHART_GROUPS[groupId];
  const chart = group.charts.find((c) => c.id === pickById[groupId]) ?? group.charts[0]!;
  // 묶음을 바꾸면 차트 칩 줄이 새로 그려지는데, 스크롤이 남아 있으면 고른
  // 칩이 화면 밖에 있을 수 있다. 고른 칩을 보이는 자리로 끌어온다.
  const activePill = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    activePill.current?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [chart]);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    setData(null);
    void load(chart)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [chart]);

  const cells = useMemo(() => (data ? (data.cells as Record<string, ComboActions>) : {}), [data]);
  const actions = data?.actions ?? [];

  const played = useMemo(
    () => Object.values(cells).filter((c) => (c['fold'] ?? 0) < 1).length,
    [cells],
  );
  const hasSplit = useMemo(
    () => Object.values(cells).some((c) => Object.values(c).filter((v) => v > 0).length > 1),
    [cells],
  );
  const pickedCell = picked ? cells[picked] : undefined;

  return (
    <div className={className}>
      {/* 묶음 */}
      <section className="mb-2 overflow-x-auto">
        <div className="flex min-w-max gap-1.5">
          {groups.map((id) => {
            const g = CHART_GROUPS[id];
            const active = id === groupId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setGroupId(id)}
                aria-pressed={active}
                className={cn(PILL, active ? PILL_ON : PILL_OFF)}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 차트 */}
      <section className="mb-3 overflow-x-auto">
        <div className="flex min-w-max gap-1.5">
          {group.charts.map((c) => {
            const active = c.id === chart.id;
            return (
              <button
                key={c.id}
                ref={active ? activePill : null}
                type="button"
                onClick={() => setPickById((m) => ({ ...m, [groupId]: c.id }))}
                aria-pressed={active}
                aria-label={c.title}
                className={cn(PILL, 'px-3', active ? PILL_ON : PILL_OFF)}
              >
                {c.pick}
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
            {chart.title} ·{' '}
            {data ? (
              <>
                <span className="text-fg font-semibold tabular-nums">{played}</span>/169 핸드
              </>
            ) : (
              '불러오는 중'
            )}
          </p>
          {data ? (
            <RangeGrid actions={actions} cells={cells} onCellClick={(c) => setPicked(c)} />
          ) : (
            <div
              aria-busy
              className="grid aspect-square gap-[2px] rounded-[10px] p-1.5"
              style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
            >
              {Array.from({ length: 169 }).map((_, i) => (
                <Skeleton key={i} width="100%" height="100%" rounded="sm" />
              ))}
            </div>
          )}
          <RangeLegend
            actions={actions}
            cells={cells}
            className="text-fg-muted mt-2 justify-center gap-x-3 gap-y-0.5"
          />

          <div className="border-hair surface text-fg-muted mt-4 rounded-[var(--radius-button)] p-3 text-[12px] leading-[1.55]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
              읽는 법
            </p>
            <p className="mt-1">{group.desc}</p>
            {hasSplit && (
              <p className="mt-1">
                {chart.split === 'stack'
                  ? '한 칸이 둘로 갈린 핸드는 섞어 치라는 뜻이 아니라 스택에 따라 계획이 갈리는 핸드예요. 칸을 누르면 조건이 보여요.'
                  : '한 칸이 둘로 갈린 핸드는 그 비율로 섞어 쳐요. 칸을 누르면 빈도가 보여요.'}
              </p>
            )}
            <p className="mt-1 text-[11px]">
              {chart.source.kind === 'rye'
                ? '출처: Raise Your Edge (bencb) 차트. 색은 원본 그대로, 빗금은 블러프.'
                : '출처: Nash 균형 푸시/폴드 차트.'}
            </p>
          </div>
        </>
      )}

      <ComboDetailSheet
        open={picked !== null}
        combo={picked}
        actions={actions}
        cell={pickedCell}
        percent={chart.split === 'freq'}
        emptyText="이 핸드의 데이터가 없어요."
        onClose={() => setPicked(null)}
      />
    </div>
  );
}
