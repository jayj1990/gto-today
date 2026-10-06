'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn, ComboDetailSheet, RangeGrid, RangeLegend } from '@gto/ui';
import {
  bucketContains,
  resolveStack,
  stackBuckets,
  type ActionSpec,
  type ComboActions,
  type PreflopChartData,
  type StackBucket,
} from '@gto/poker-core';
import { CHART_GROUPS, chartUrl, type ChartGroupId, type LibraryChart } from '@gto/gto-data';
import { Skeleton } from './skeleton';

/**
 * 프리플랍 차트 라이브러리 — 묶음 칩 → 차트 칩 → 13×13 격자.
 *
 * /charts(캐시)와 /mtt/preflop(토너먼트)이 묶음 목록만 다르게 주고 같은
 * 화면을 쓴다. 차트 본체는 고를 때마다 /data/rye/{id}.json 을 받아 오고
 * 한 번 받은 건 페이지가 살아 있는 동안 기억한다. 20/10bb Nash 올인 차트는
 * 옛 {raise, fold} 꼴이라 여기서 같은 모양으로 올린다.
 *
 * 스택 조건이 붙은 차트(RYE 오픈·3벳·리잼)는 차트 칩 아래에 스택 칩이 한 줄
 * 더 선다. "원본"은 영상 그대로(조건은 범례에 글로), 스택을 고르면 그 스택의
 * 계획으로 다시 칠한다. 고른 스택은 차트를 바꿔도 남는다 — 100bb 차트에서
 * 45bb 를 보다가 리잼 차트로 가면 거기서도 45bb 구간이 켜진다.
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

/**
 * 구간 라벨. 경계가 어느 쪽에 붙는지는 차트의 조건 연산자가 정한다 —
 * 오픈 차트("50bb+", "<30bb")는 이상/미만, 리잼 차트("25bb" = 25bb 이하)는
 * 넘게/이하. 칩에서는 단위를 빼고(줄 머리의 "스택 bb" 가 대신한다) 본문에선
 * 붙인다 — 칩 다섯 개가 390px 한 줄에 들어가야 해서.
 */
function bucketLabel(b: StackBucket, inclusive: boolean, unit = ''): string {
  if (b.min !== undefined && b.max !== undefined) return `${b.min}-${b.max}${unit}`;
  if (b.min !== undefined) return `${b.min}${unit} ${inclusive ? '넘게' : '이상'}`;
  return `${b.max}${unit} ${inclusive ? '이하' : '미만'}`;
}

export function ChartLibraryBrowser({ groups, className }: ChartLibraryBrowserProps) {
  const [groupId, setGroupId] = useState<ChartGroupId>(groups[0]!);
  // 묶음마다 마지막으로 보던 차트를 기억한다 — 오픈 100bb 에서 CO 를 보다가
  // 25bb 로 갔다 와도 CO 가 그대로.
  const [pickById, setPickById] = useState<Partial<Record<ChartGroupId, string>>>({});
  const [data, setData] = useState<PreflopChartData | null>(null);
  const [error, setError] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  // null = 원본(조건을 안 푼 차트). 숫자면 그 스택 기준으로 푼다.
  const [stackBB, setStackBB] = useState<number | null>(null);

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

  const buckets = useMemo(() => (data ? stackBuckets(data.actions) : []), [data]);
  const inclusive = data?.actions.some((a) => a.stack?.lte !== undefined) ?? false;
  const bucket =
    stackBB === null ? null : (buckets.find((b) => bucketContains(b, stackBB)) ?? null);
  const shown = useMemo(
    () => (data && bucket ? resolveStack(data, bucket.bb) : data),
    [data, bucket],
  );

  const cells = useMemo(
    () => (shown ? (shown.cells as Record<string, ComboActions>) : {}),
    [shown],
  );
  const actions = shown?.actions ?? [];

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

      {/* 스택 — 조건이 붙은 차트에만 */}
      {buckets.length > 0 && (
        <section className="-mt-1.5 mb-3 overflow-x-auto">
          <div className="flex min-w-max items-center gap-1.5">
            <span className="text-fg-muted pr-1 font-mono text-[10px] tracking-[0.18em]">
              스택 bb
            </span>
            <button
              type="button"
              onClick={() => setStackBB(null)}
              aria-pressed={bucket === null}
              className={cn(PILL, 'h-9 px-2.5', bucket === null ? PILL_ON : PILL_OFF)}
            >
              원본
            </button>
            {buckets.map((b) => {
              const active = bucket === b;
              return (
                <button
                  key={b.bb}
                  type="button"
                  onClick={() => setStackBB(b.bb)}
                  aria-pressed={active}
                  aria-label={bucketLabel(b, inclusive, 'bb')}
                  className={cn(PILL, 'h-9 px-2.5', active ? PILL_ON : PILL_OFF)}
                >
                  {bucketLabel(b, inclusive)}
                </button>
              );
            })}
          </div>
        </section>
      )}

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
            {bucket ? (
              <p className="mt-1">
                지금은 {bucketLabel(bucket, inclusive, 'bb')} 기준이에요. 조건이 붙은 핸드를 이
                스택의 계획으로 바꿔 칠했는데, 조건이 빗나갈 때 뭘 하는지는 원본에 글로 없어서 차트
                구조에서 읽어 넣었어요(50bb 미만 4벳 밸류는 깊으면 3벳에 콜, 25bb 이하 리잼은 깊으면
                폴드). 영상 설명과 다를 수 있어요.
              </p>
            ) : (
              hasSplit && (
                <p className="mt-1">
                  {chart.split === 'stack'
                    ? '한 칸이 둘로 갈린 핸드는 섞어 치라는 뜻이 아니라 스택에 따라 계획이 갈리는 핸드예요. 칸을 누르면 조건이 보여요.'
                    : '한 칸이 둘로 갈린 핸드는 그 비율로 섞어 쳐요. 칸을 누르면 빈도가 보여요.'}
                </p>
              )
            )}
            {buckets.length > 0 && !bucket && (
              <p className="mt-1">위 스택 칩을 고르면 조건을 풀어 그 스택의 계획만 보여요.</p>
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
