'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { useChallengeStore, type LifetimeAnswer } from '@/lib/challenge-store';
import { useMistakesStore } from '@/lib/mistakes-store';
import { StreakCalendar } from '@/components/streak-calendar';
import { shareOrCopy } from '@/lib/share';

export default function StatsPage() {
  const lifetime = useChallengeStore((s) => s.lifetimeAnswers);
  const currentStreak = useChallengeStore((s) => s.currentStreak);
  const bestStreak = useChallengeStore((s) => s.bestStreak);
  const mistakeCount = useMistakesStore((s) => s.mistakes.length);

  const totals = useMemo(() => tallyTotals(lifetime), [lifetime]);
  const byDay = useMemo(() => groupByDay(lifetime, 7), [lifetime]);
  const byPosition = useMemo(() => groupByPosition(lifetime), [lifetime]);
  const weakCombos = useMemo(() => topWeaknesses(lifetime, 5), [lifetime]);

  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <header className="mb-5 flex items-baseline justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
              Stats
            </p>
            <h1 className="font-display mt-1 text-[26px] font-bold leading-[1.1] tracking-[-0.02em]">
              내 훈련 기록
            </h1>
          </div>
          {totals.total > 0 && (
            <ShareStatsButton
              currentStreak={currentStreak}
              bestStreak={bestStreak}
              total={totals.total}
              accuracy={totals.accuracy}
            />
          )}
        </header>

        {/* Top-line KPIs */}
        <section className="grid grid-cols-2 gap-2">
          <Kpi
            label="연속 기록"
            value={`${currentStreak}일`}
            sub={`최고 ${bestStreak}일`}
            tone="gold"
          />
          <Kpi
            label="총 응답"
            value={String(totals.total)}
            sub={`${totals.accuracy}% 정확`}
            tone="accent"
          />
          <Kpi label="정답" value={String(totals.sharp)} sub="완벽한 판단" tone="call" />
          <Kpi
            label="복습 대기"
            value={String(mistakeCount)}
            sub="오답 큐"
            tone="raise"
            link="/review"
          />
        </section>

        {totals.total === 0 ? (
          <section className="border-hair surface mt-8 rounded-[var(--radius-panel)] p-6 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
              No data yet
            </p>
            <h2 className="font-display mt-2 text-[18px] font-semibold">아직 답한 스팟이 없어요</h2>
            <p className="text-fg-muted mt-1 text-[12px]">
              오늘의 훈련을 한 번이라도 풀면 여기 기록이 쌓여요.
            </p>
            <Link
              href="/today"
              className="bg-gold-gradient text-noir mt-4 inline-flex h-11 items-center rounded-[var(--radius-button)] px-4 text-[14px] font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
            >
              오늘의 훈련 →
            </Link>
          </section>
        ) : (
          <>
            {/* 30-day activity heatmap — monthly shape. The 7-day row
                on /today is the at-a-glance streak; this grid shows
                how consistent the last month looked. */}
            <StreakCalendar className="mt-6" days={30} layout="grid" />

            {/* Last-7-day accuracy */}
            <section className="mt-6">
              <SectionHeader
                title="최근 7일 정확도"
                right={`${byDay.summary.accuracy}% · ${byDay.summary.total}개 응답`}
              />
              <div className="mt-3 flex items-end gap-1.5">
                {byDay.rows.map((d) => {
                  const pct = d.total > 0 ? Math.round((d.sharp / d.total) * 100) : 0;
                  const heightPx = d.total > 0 ? Math.max(8, Math.round((pct / 100) * 96)) : 4;
                  return (
                    <div key={d.dateKey} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="bg-[color:var(--color-accent)]/25 w-full rounded-sm transition-all"
                        style={{
                          height: 96,
                          position: 'relative',
                        }}
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-sm bg-[color:var(--color-accent)]"
                          style={{ height: `${heightPx}px` }}
                        />
                      </div>
                      <span className="text-fg-muted font-mono text-[9px] tabular-nums">
                        {d.label}
                      </span>
                      <span className="text-fg font-mono text-[10px] font-semibold tabular-nums">
                        {d.total > 0 ? `${pct}%` : '·'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Top weakness combos — inferred from spotId prefix. */}
            {weakCombos.length > 0 && (
              <section className="mt-8">
                <SectionHeader title="가장 많이 틀린 콤보" right="최근 기록 기준" />
                <ul className="mt-3 space-y-1.5">
                  {weakCombos.map((w) => (
                    <li
                      key={w.combo}
                      className="border-hair surface flex items-center justify-between gap-3 rounded-[var(--radius-button)] px-3 py-2"
                    >
                      <span className="font-display text-[15px] font-bold tracking-[-0.02em]">
                        {w.combo}
                      </span>
                      <span className="text-fg-muted font-mono text-[11px] tabular-nums">
                        오답 {w.wrong}회 / 시도 {w.attempts}회
                      </span>
                      <span
                        className="font-mono text-[12px] font-semibold tabular-nums"
                        style={{ color: 'var(--color-raise)' }}
                      >
                        {Math.round((w.wrong / w.attempts) * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-fg-muted mt-2 text-[11px]">
                  복습 모드에서 이 콤보들을 우선적으로 다시 풀어보세요.
                </p>
              </section>
            )}

            {/* Position breakdown */}
            {byPosition.length > 0 && (
              <section className="mt-8">
                <SectionHeader title="포지션별 정확도" />
                <ul className="mt-3 space-y-2">
                  {byPosition.map((row) => (
                    <li
                      key={row.position}
                      className="border-hair surface rounded-[var(--radius-button)] px-3 py-2.5"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-[14px] font-semibold">
                          {row.position}
                        </span>
                        <span className="text-fg-muted font-mono text-[11px] tabular-nums">
                          {row.total}개 · {row.accuracy}%
                        </span>
                      </div>
                      <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                        <div
                          className="h-full bg-[color:var(--color-call)]"
                          style={{ width: `${(row.sharp / row.total) * 100}%` }}
                        />
                        <div
                          className="h-full bg-[color:var(--color-info)]"
                          style={{ width: `${(row.acceptable / row.total) * 100}%` }}
                        />
                        <div
                          className="h-full bg-[color:var(--color-raise)]"
                          style={{ width: `${(row.wrong / row.total) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="text-fg-muted mt-2 flex justify-end gap-3 text-[10px]">
                  <LegendDot color="var(--color-call)" label="정답" />
                  <LegendDot color="var(--color-info)" label="차선" />
                  <LegendDot color="var(--color-raise)" label="오답" />
                </div>
              </section>
            )}
          </>
        )}

        <nav className="mt-10 flex justify-center">
          <Link
            href="/"
            className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.2em] underline-offset-4 hover:underline"
          >
            ← 홈으로
          </Link>
        </nav>
      </main>
    </>
  );
}

function ShareStatsButton({
  currentStreak,
  bestStreak,
  total,
  accuracy,
}: {
  currentStreak: number;
  bestStreak: number;
  total: number;
  accuracy: number;
}) {
  const [status, setStatus] = useState<'idle' | 'shared' | 'copied' | 'failed'>('idle');

  // Streak milestones get an extra celebration line. 7/30/100/365 are
  // the bands users tend to brag about; anything below 7 we just
  // ship the plain accuracy summary.
  const milestone =
    currentStreak >= 365
      ? '1년 연속'
      : currentStreak >= 100
        ? '100일 연속'
        : currentStreak >= 30
          ? '30일 연속'
          : currentStreak >= 7
            ? '7일 연속'
            : null;

  const onShare = async () => {
    const text = [
      'GTO Today 훈련 기록',
      `정확도 ${accuracy}% · 누적 ${total}핸드`,
      milestone
        ? `${milestone} 달성 (현재 ${currentStreak}일)`
        : currentStreak > 0
          ? `${currentStreak}일 연속 훈련 중`
          : null,
      bestStreak > currentStreak ? `최장 ${bestStreak}일` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const result = await shareOrCopy({
      title: 'GTO Today',
      text,
      url: 'https://gto.today',
    });

    if (result === 'share') setStatus('shared');
    else if (result === 'clipboard') setStatus('copied');
    else setStatus('failed');
    window.setTimeout(() => setStatus('idle'), 2400);
  };

  const label =
    status === 'copied'
      ? '복사됨'
      : status === 'shared'
        ? '공유됨'
        : status === 'failed'
          ? '실패'
          : '공유';

  return (
    <button
      type="button"
      onClick={onShare}
      aria-live="polite"
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1 rounded-full border px-3 font-mono text-[10px] uppercase tracking-[0.2em] active:scale-[0.97]',
        status === 'copied' || status === 'shared'
          ? 'border-[color:var(--color-call)]/40 bg-[color:var(--color-call)]/10 text-[color:var(--color-call)]'
          : status === 'failed'
            ? 'border-[color:var(--color-raise)]/40 bg-[color:var(--color-raise)]/10 text-[color:var(--color-raise)]'
            : 'border-hair surface-raised text-fg-muted hover:text-fg',
      )}
    >
      <span aria-hidden>↗</span>
      {label}
    </button>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone,
  link,
}: {
  label: string;
  value: string;
  sub: string;
  tone: 'gold' | 'accent' | 'call' | 'raise';
  link?: string;
}) {
  const color =
    tone === 'gold'
      ? 'var(--color-gold)'
      : tone === 'accent'
        ? 'var(--color-accent)'
        : tone === 'call'
          ? 'var(--color-call)'
          : 'var(--color-raise)';
  const inner = (
    <div className="border-hair surface rounded-[var(--radius-panel)] px-4 py-3">
      <p className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.18em]">{label}</p>
      <p
        className="font-display mt-1 text-[24px] font-bold tabular-nums leading-none tracking-[-0.02em]"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-fg-muted mt-1 font-mono text-[10px] tabular-nums">{sub}</p>
    </div>
  );
  if (link) {
    return (
      <Link href={link} className="block active:scale-[0.98]">
        {inner}
      </Link>
    );
  }
  return inner;
}

function SectionHeader({ title, right }: { title: string; right?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="font-display text-[16px] font-semibold tracking-[-0.01em]">{title}</h2>
      {right && (
        <span className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.16em]">
          {right}
        </span>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden className="inline-block h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ─────────── aggregation ─────────── */

interface Totals {
  total: number;
  sharp: number;
  acceptable: number;
  wrong: number;
  accuracy: number;
}

function tallyTotals(log: LifetimeAnswer[]): Totals {
  let sharp = 0;
  let acceptable = 0;
  let wrong = 0;
  for (const a of log) {
    if (a.grade === 'sharp') sharp++;
    else if (a.grade === 'acceptable') acceptable++;
    else wrong++;
  }
  const total = sharp + acceptable + wrong;
  const accuracy = total === 0 ? 0 : Math.round(((sharp + acceptable * 0.5) / total) * 100);
  return { total, sharp, acceptable, wrong, accuracy };
}

interface DailyRow {
  dateKey: string;
  label: string;
  total: number;
  sharp: number;
}

interface DailyBreakdown {
  rows: DailyRow[];
  summary: Totals;
}

function groupByDay(log: LifetimeAnswer[], days: number): DailyBreakdown {
  const today = new Date();
  const rows: DailyRow[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = isoDate(d);
    rows.push({ dateKey: key, label: shortDayLabel(d), total: 0, sharp: 0 });
  }
  const windowSet = new Set(rows.map((r) => r.dateKey));
  let sharp = 0;
  let acceptable = 0;
  let wrong = 0;
  for (const a of log) {
    if (!windowSet.has(a.dateKey)) continue;
    const row = rows.find((r) => r.dateKey === a.dateKey);
    if (!row) continue;
    row.total += 1;
    if (a.grade === 'sharp') {
      row.sharp += 1;
      sharp += 1;
    } else if (a.grade === 'acceptable') {
      acceptable += 1;
    } else {
      wrong += 1;
    }
  }
  const total = sharp + acceptable + wrong;
  const accuracy = total === 0 ? 0 : Math.round(((sharp + acceptable * 0.5) / total) * 100);
  return {
    rows,
    summary: { total, sharp, acceptable, wrong, accuracy },
  };
}

interface PositionRow {
  position: string;
  total: number;
  sharp: number;
  acceptable: number;
  wrong: number;
  accuracy: number;
}

interface WeaknessRow {
  combo: string;
  attempts: number;
  wrong: number;
}

/** Extract the preflop combo (e.g. "AKs", "76o", "QQ") from a spotId
 *  like "2026-04-23-0-AKs-BB-vs-BTN". Returns null for postflop spot
 *  ids — they use a different format. */
function comboFromSpotId(spotId: string): string | null {
  const m = spotId.match(/-(\d+)-([A-Z0-9]{2,3})-/i);
  return m?.[2] ?? null;
}

function topWeaknesses(log: LifetimeAnswer[], limit: number): WeaknessRow[] {
  const tally = new Map<string, WeaknessRow>();
  for (const a of log) {
    if (a.kind !== 'preflop') continue;
    const combo = comboFromSpotId(a.spotId);
    if (!combo) continue;
    const row = tally.get(combo) ?? { combo, attempts: 0, wrong: 0 };
    row.attempts += 1;
    if (a.grade === 'wrong') row.wrong += 1;
    tally.set(combo, row);
  }
  return [...tally.values()]
    .filter((r) => r.wrong > 0 && r.attempts >= 2)
    .sort((a, b) => {
      const rateA = a.wrong / a.attempts;
      const rateB = b.wrong / b.attempts;
      if (rateA !== rateB) return rateB - rateA;
      return b.wrong - a.wrong;
    })
    .slice(0, limit);
}

function groupByPosition(log: LifetimeAnswer[]): PositionRow[] {
  const map = new Map<string, PositionRow>();
  for (const a of log) {
    const pos = a.position ?? 'unknown';
    const row = map.get(pos) ?? {
      position: pos,
      total: 0,
      sharp: 0,
      acceptable: 0,
      wrong: 0,
      accuracy: 0,
    };
    row.total += 1;
    if (a.grade === 'sharp') row.sharp += 1;
    else if (a.grade === 'acceptable') row.acceptable += 1;
    else row.wrong += 1;
    map.set(pos, row);
  }
  for (const row of map.values()) {
    row.accuracy =
      row.total === 0 ? 0 : Math.round(((row.sharp + row.acceptable * 0.5) / row.total) * 100);
  }
  // Fixed order so the list is stable.
  const order = ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
  return [...map.values()].sort((a, b) => {
    const ai = order.indexOf(a.position);
    const bi = order.indexOf(b.position);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shortDayLabel(d: Date): string {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return weekdays[d.getDay()]!;
}

// Suppress the unused-variable lint: cn is re-exported for future use.
void cn;
