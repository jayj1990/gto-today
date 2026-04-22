'use client';

import { useMemo } from 'react';
import { cn } from '@gto/ui';
import { useChallengeStore } from '@/lib/challenge-store';

export interface StreakCalendarProps {
  className?: string;
  /** How many days to render (including today). Default 7. */
  days?: number;
}

/**
 * Mini grass-calendar of the user's last N days. Shading intensity
 * tracks how many spots they answered that day (0 → empty, 1-3 → dim,
 * 4-7 → mid, 8+ → full gold).
 *
 * Server renders nothing until the zustand store hydrates — avoids an
 * SSR/CSR mismatch (every visitor has different persisted history).
 */
export function StreakCalendar({ className, days = 7 }: StreakCalendarProps) {
  const lifetime = useChallengeStore((s) => s.lifetimeAnswers);
  const currentStreak = useChallengeStore((s) => s.currentStreak);

  const cells = useMemo(() => buildCells(lifetime, days), [lifetime, days]);
  const total = cells.reduce((a, c) => a + c.count, 0);

  return (
    <section
      className={cn(
        'rounded-[var(--radius-panel)] border-hair surface px-4 py-3.5',
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
            최근 {days}일
          </p>
          <p className="mt-0.5 font-display text-[15px] font-semibold">
            {currentStreak}일 연속 ·{' '}
            <span className="font-mono font-normal text-fg-muted">{total}개 응답</span>
          </p>
        </div>
      </div>
      <ul
        aria-label={`최근 ${days}일 훈련 기록`}
        className="mt-3 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))` }}
      >
        {cells.map((c) => (
          <li
            key={c.dateKey}
            className="flex flex-col items-center gap-1"
            title={`${c.dateKey} · ${c.count}개 응답 · 정확도 ${Math.round(c.accuracy * 100)}%`}
          >
            <div
              aria-hidden
              className="w-full rounded-sm"
              style={{
                height: 34,
                background: shadeFor(c.count, c.accuracy),
                border: c.isToday
                  ? '1.5px solid var(--color-accent)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            />
            <span className="font-mono text-[9px] tabular-nums text-fg-muted">
              {c.label}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[9px] text-fg-muted">
        <span>부정확</span>
        {[
          { c: 1, a: 0.1 },
          { c: 1, a: 0.45 },
          { c: 1, a: 0.7 },
          { c: 1, a: 0.95 },
        ].map((s, i) => (
          <span
            key={i}
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: shadeFor(s.c, s.a) }}
          />
        ))}
        <span>정확</span>
      </div>
    </section>
  );
}

interface Cell {
  dateKey: string;
  label: string;
  count: number;
  accuracy: number; // 0..1, weighted (sharp = 1, acceptable = 0.5, wrong = 0)
  isToday: boolean;
}

function buildCells(
  log: { dateKey: string; grade: 'sharp' | 'acceptable' | 'wrong' }[],
  days: number,
): Cell[] {
  const today = new Date();
  const perDay = new Map<string, { total: number; score: number }>();
  for (const a of log) {
    const rec = perDay.get(a.dateKey) ?? { total: 0, score: 0 };
    rec.total += 1;
    if (a.grade === 'sharp') rec.score += 1;
    else if (a.grade === 'acceptable') rec.score += 0.5;
    perDay.set(a.dateKey, rec);
  }
  const cells: Cell[] = [];
  const todayKey = iso(today);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = iso(d);
    const rec = perDay.get(key);
    const count = rec?.total ?? 0;
    const accuracy = count > 0 && rec ? rec.score / rec.total : 0;
    cells.push({
      dateKey: key,
      label: shortDay(d),
      count,
      accuracy,
      isToday: key === todayKey,
    });
  }
  return cells;
}

/** Hybrid shade — empty days stay dim regardless of streak, active
 *  days get intensity from weighted accuracy (sharp = 1, acceptable
 *  = 0.5, wrong = 0). So "풀었다 × 잘했다" = darkest gold. */
function shadeFor(count: number, accuracy: number): string {
  if (count === 0) return 'rgba(244, 239, 230, 0.05)';
  if (accuracy < 0.3) return 'rgba(212, 175, 55, 0.22)';
  if (accuracy < 0.55) return 'rgba(212, 175, 55, 0.4)';
  if (accuracy < 0.8) return 'rgba(212, 175, 55, 0.65)';
  return 'linear-gradient(135deg, #E8CC72, #D4AF37)';
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shortDay(d: Date): string {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return weekdays[d.getDay()]!;
}
