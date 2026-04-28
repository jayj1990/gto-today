import type { LifetimeAnswer } from './challenge-store';

/**
 * Achievement system — derived purely from already-persisted data
 * (lifetime answers + streak history). No new state to track, no
 * unlock event to fire; achievements are just a re-projection of
 * what's already in the challenge store, evaluated each render.
 *
 * Tier strategy: every metric (cumulative hands, streak days, perfect
 * days) gets a small ladder so the ribbon visibly fills as the user
 * progresses. Unreachable goals are demotivating; we cap each ladder
 * at a number an engaged user can hit within months.
 */

export type AchievementCategory = 'volume' | 'streak' | 'perfect' | 'milestone';

export interface Achievement {
  readonly id: string;
  readonly category: AchievementCategory;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

export interface AchievementProgress extends Achievement {
  readonly unlocked: boolean;
  /** 0–1 progress toward unlock. 1 once unlocked. */
  readonly progress: number;
  /** Human-readable progress (e.g. "47 / 100 핸드"). */
  readonly progressLabel: string;
}

/* ─────────── definitions ─────────── */

const VOLUME_TIERS: Array<[number, Achievement]> = [
  [
    1,
    {
      id: 'first-hand',
      category: 'volume',
      title: '첫 걸음',
      description: '첫 핸드 풀기',
      icon: '✱',
    },
  ],
  [
    50,
    {
      id: 'fifty-hands',
      category: 'volume',
      title: '50 핸드',
      description: '누적 50 핸드 답변',
      icon: '◔',
    },
  ],
  [
    200,
    {
      id: 'two-hundred-hands',
      category: 'volume',
      title: '200 핸드',
      description: '누적 200 핸드 답변',
      icon: '◑',
    },
  ],
  [
    1000,
    {
      id: 'thousand-hands',
      category: 'volume',
      title: '1000 핸드',
      description: '누적 1000 핸드 답변',
      icon: '●',
    },
  ],
];

const STREAK_TIERS: Array<[number, Achievement]> = [
  [
    3,
    {
      id: 'streak-3',
      category: 'streak',
      title: '3일 연속',
      description: '3일 연속 훈련',
      icon: '◇',
    },
  ],
  [
    7,
    {
      id: 'streak-7',
      category: 'streak',
      title: '7일 연속',
      description: '일주일 연속 훈련',
      icon: '◈',
    },
  ],
  [
    30,
    {
      id: 'streak-30',
      category: 'streak',
      title: '30일 연속',
      description: '한 달 연속 훈련',
      icon: '◆',
    },
  ],
];

const PERFECT_DAY: Achievement = {
  id: 'perfect-day',
  category: 'perfect',
  title: '완벽한 하루',
  description: '하루 10핸드 모두 정답',
  icon: '★',
};

/* ─────────── evaluator ─────────── */

export function computeAchievements(args: {
  lifetimeAnswers: ReadonlyArray<LifetimeAnswer>;
  bestStreak: number;
}): AchievementProgress[] {
  const { lifetimeAnswers, bestStreak } = args;
  const total = lifetimeAnswers.length;
  const out: AchievementProgress[] = [];

  for (const [threshold, def] of VOLUME_TIERS) {
    out.push({
      ...def,
      unlocked: total >= threshold,
      progress: Math.min(1, total / threshold),
      progressLabel: `${total} / ${threshold} 핸드`,
    });
  }

  for (const [threshold, def] of STREAK_TIERS) {
    out.push({
      ...def,
      unlocked: bestStreak >= threshold,
      progress: Math.min(1, bestStreak / threshold),
      progressLabel: `${bestStreak} / ${threshold}일`,
    });
  }

  // Perfect day — count any day where the user logged 10+ sharp answers.
  const perfectDays = countPerfectDays(lifetimeAnswers);
  out.push({
    ...PERFECT_DAY,
    unlocked: perfectDays >= 1,
    progress: perfectDays > 0 ? 1 : 0,
    progressLabel: perfectDays > 0 ? `${perfectDays}회 달성` : '아직 없음',
  });

  return out;
}

function countPerfectDays(answers: ReadonlyArray<LifetimeAnswer>): number {
  // Group by dateKey, count where 10+ entries are all 'sharp'. The
  // challenge spec says "10 hands per day" so 10 sharp hits = perfect.
  const byDay = new Map<string, { total: number; sharp: number }>();
  for (const a of answers) {
    const cur = byDay.get(a.dateKey) ?? { total: 0, sharp: 0 };
    cur.total += 1;
    if (a.grade === 'sharp') cur.sharp += 1;
    byDay.set(a.dateKey, cur);
  }
  let count = 0;
  for (const { total, sharp } of byDay.values()) {
    if (total >= 10 && sharp === total) count += 1;
  }
  return count;
}
