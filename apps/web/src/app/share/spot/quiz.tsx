'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  generateDailyItems,
  gradeAnswer,
  gradePostflopAction,
  POSTFLOP_ACTION_COLOR,
  POSTFLOP_ACTION_LABEL,
  type AnswerGrade,
  type DailyItem,
  type GradedAction,
  type PostflopAction,
} from '@gto/gto-data';
import { cn } from '@gto/ui';
import { HandCard } from '@/components/today/hand-card';
import { PostflopHand } from '@/components/today/postflop-hand';
import { ActionBar } from '@/components/today/action-bar';
import { HandCardSkeleton } from '@/components/skeleton';
import { useLiveStore } from '@/lib/live-store';

const TOTAL = 10;

export interface ShareSpotQuizProps {
  /** Date key the spot was generated against (YYYY-MM-DD). */
  dateKey: string;
  /** Index within that day's daily list (0..9). */
  idx: number;
  /** Game type the daily list was generated for. Falls back to the
   *  viewer's current setting (or 'mtt') if missing. */
  gameType?: string;
}

const GRADE_COPY: Record<AnswerGrade, { headline: string; tone: string }> = {
  sharp: { headline: '정확.', tone: 'var(--color-call)' },
  acceptable: { headline: '괜찮음.', tone: 'var(--color-info)' },
  wrong: { headline: 'Here’s why.', tone: 'var(--color-raise)' },
};

const PREFLOP_LABEL: Record<GradedAction, string> = {
  fold: '폴드',
  check: '체크',
  call: '콜',
  raise: '레이즈',
  allin: '올인',
};

/**
 * Shared-spot quiz client. Regenerates the same daily list the
 * sharer played (deterministic from dateKey + gameType), picks the
 * indexed item, and presents it as a fresh quiz to the recipient.
 *
 * The recipient solves blind — no leak of the original sharer's
 * answer or the GTO answer until they submit. After they answer,
 * we reveal the grade locally and CTA them to /today.
 */
export function ShareSpotQuiz({ dateKey, idx, gameType }: ShareSpotQuizProps) {
  const fallbackType = useLiveStore((s) => s.config.gameType);
  const effectiveType = (gameType ?? fallbackType ?? 'mtt') as 'cash' | 'mtt';

  const [item, setItem] = useState<DailyItem | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [preflopAnswer, setPreflopAnswer] = useState<GradedAction | null>(null);
  const [postflopAnswer, setPostflopAnswer] = useState<PostflopAction | null>(null);
  const [grade, setGrade] = useState<AnswerGrade | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateDailyItems({ count: TOTAL, dateSeed: dateKey, gameType: effectiveType })
      .then((list) => {
        if (cancelled) return;
        const picked = list[idx] ?? null;
        if (!picked) setLoadFailed(true);
        setItem(picked);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [dateKey, idx, effectiveType]);

  if (loadFailed) {
    return (
      <div className="border-hair surface mt-8 rounded-[var(--radius-panel)] px-5 py-6 text-center">
        <p className="text-fg-muted text-[13px]">스팟을 찾지 못했어요.</p>
        <Link
          href="/today"
          className="bg-gold-gradient text-noir mt-5 inline-flex h-12 select-none items-center justify-center rounded-[var(--radius-button)] px-5 text-[14px] font-semibold"
        >
          오늘의 퀴즈 풀기 →
        </Link>
      </div>
    );
  }

  if (!item) {
    return <HandCardSkeleton />;
  }

  const onPreflopAnswer = (action: GradedAction) => {
    if (item.kind !== 'preflop') return;
    const g = gradeAnswer(item.spot, action);
    setPreflopAnswer(action);
    setGrade(g);
  };

  const onPostflopAnswer = (action: PostflopAction) => {
    if (item.kind !== 'postflop') return;
    const g = gradePostflopAction(item.spot, action);
    setPostflopAnswer(action);
    setGrade(g);
  };

  const answered = grade !== null;

  return (
    <>
      <header className="mb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
          친구가 공유한 스팟
        </p>
        <p className="text-fg-muted mt-1 text-[12px]">
          오늘의 퀴즈처럼 풀어보세요. 정답은 답한 뒤에 공개됩니다.
        </p>
      </header>

      {item.kind === 'preflop' ? (
        <HandCard spot={item.spot} celebratePot={grade === 'sharp'} />
      ) : (
        <PostflopHand spot={item.spot} celebratePot={grade === 'sharp'} />
      )}

      {!answered && item.kind === 'preflop' && (
        <ActionBar
          actions={item.spot.availableActions}
          callSize={item.spot.openSize}
          raiseSize={item.spot.raiseSize ?? (item.spot.scenario === 'vs_open' ? 9 : 2.5)}
          onAnswer={onPreflopAnswer}
        />
      )}

      {!answered && item.kind === 'postflop' && (
        <div
          className="safe-bottom mt-5 grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${item.spot.availableActions.length}, minmax(0, 1fr))`,
          }}
        >
          {item.spot.availableActions.map((a) => {
            const compact = item.spot.availableActions.length >= 3;
            return (
              <button
                key={a}
                type="button"
                onClick={() => onPostflopAnswer(a)}
                className={cn(
                  'text-on-primary select-none whitespace-nowrap rounded-[var(--radius-button)] px-1 font-bold shadow-[var(--shadow-card)] transition-colors active:scale-[0.98]',
                  compact ? 'h-12 text-[12px]' : 'h-14 text-[14px]',
                )}
                style={{ background: POSTFLOP_ACTION_COLOR[a] }}
              >
                {POSTFLOP_ACTION_LABEL[a]}
              </button>
            );
          })}
        </div>
      )}

      {answered && (
        <div className="border-hair surface mt-5 rounded-[var(--radius-panel)] px-5 py-5">
          <p
            className="font-display text-[22px] font-bold leading-tight"
            style={{ color: GRADE_COPY[grade].tone }}
          >
            {GRADE_COPY[grade].headline}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
            <dt className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.18em]">
              내 답
            </dt>
            <dt className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.18em]">GTO</dt>
            <dd className="text-fg font-semibold">
              {item.kind === 'preflop'
                ? preflopAnswer
                  ? PREFLOP_LABEL[preflopAnswer]
                  : '—'
                : postflopAnswer
                  ? POSTFLOP_ACTION_LABEL[postflopAnswer]
                  : '—'}
            </dd>
            <dd className="font-semibold text-[color:var(--color-gold)]">
              {item.kind === 'preflop'
                ? PREFLOP_LABEL[dominantPreflop(item.spot)]
                : POSTFLOP_ACTION_LABEL[dominantPostflop(item.spot)]}
            </dd>
          </dl>
          <Link
            href="/today"
            className="bg-gold-gradient text-noir mt-5 flex h-14 select-none items-center justify-center rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
          >
            나도 도전 — 오늘의 퀴즈 풀기 →
          </Link>
          <Link
            href="/learn/gto"
            className="border-hair surface-raised mt-2 flex h-12 select-none items-center justify-center rounded-[var(--radius-button)] text-[14px] font-medium active:scale-[0.98]"
          >
            GTO가 뭐예요? 1분 입문
          </Link>
        </div>
      )}
    </>
  );
}

function dominantPreflop(spot: Extract<DailyItem, { kind: 'preflop' }>['spot']): GradedAction {
  // Pick the highest-frequency GTO action across raise / call / fold.
  // Mirrors the result-sheet's dominantAction logic.
  const r = spot.gtoRaise;
  const c = spot.gtoCall ?? 0;
  const f = spot.gtoFold;
  if (r >= c && r >= f) return 'raise';
  if (c >= r && c >= f) return 'call';
  return 'fold';
}

function dominantPostflop(spot: Extract<DailyItem, { kind: 'postflop' }>['spot']): PostflopAction {
  let best: PostflopAction = 'fold';
  let bestFreq = -1;
  for (const [k, v] of Object.entries(spot.mix)) {
    if (typeof v === 'number' && v > bestFreq) {
      best = k as PostflopAction;
      bestFreq = v;
    }
  }
  return best;
}
