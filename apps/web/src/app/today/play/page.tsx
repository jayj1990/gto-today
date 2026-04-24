'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import { SiteHeader } from '@/components/site-header';
import { ProgressDots } from '@/components/today/progress-dots';
import { HandCard } from '@/components/today/hand-card';
import { ActionBar } from '@/components/today/action-bar';
import { ResultSheet } from '@/components/today/result-sheet';
import { DailyComplete } from '@/components/today/daily-complete';
import { PostflopHand } from '@/components/today/postflop-hand';
import { PostflopResult } from '@/components/today/postflop-result';
import { useChallengeStore } from '@/lib/challenge-store';
import { useMistakesStore } from '@/lib/mistakes-store';
import { useLiveStore } from '@/lib/live-store';
import { isoDateKR } from '@/lib/date';
import { haptic } from '@/lib/haptic';
import { track } from '@/lib/analytics';
import { HandCardSkeleton } from '@/components/skeleton';

const TOTAL = 10;

export default function TodayPlayPage() {
  const [items, setItems] = useState<DailyItem[] | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [lastGrade, setLastGrade] = useState<AnswerGrade | null>(null);
  const [lastPreflopAnswer, setLastPreflopAnswer] = useState<GradedAction | null>(null);
  const [lastPostflopAnswer, setLastPostflopAnswer] = useState<PostflopAction | null>(null);

  const cursor = useChallengeStore((s) => s.cursor);
  const answers = useChallengeStore((s) => s.answers);
  const currentStreak = useChallengeStore((s) => s.currentStreak);
  const bestStreak = useChallengeStore((s) => s.bestStreak);
  const dateKey = useChallengeStore((s) => s.dateKey);
  const startDay = useChallengeStore((s) => s.startDay);
  const submit = useChallengeStore((s) => s.submit);
  const popLastAnswer = useChallengeStore((s) => s.popLastAnswer);
  const advance = useChallengeStore((s) => s.advance);
  const completeDay = useChallengeStore((s) => s.completeDay);
  const logLifetime = useChallengeStore((s) => s.logLifetime);

  const gameType = useLiveStore((s) => s.config.gameType);
  const recordMistake = useMistakesStore((s) => s.recordMistake);

  useEffect(() => {
    let cancelled = false;
    const today = isoDateKR();
    // One-shot analytics ping. `resumed` tells us whether this is a
    // fresh day-0 start or a user coming back mid-session (cursor > 0).
    track({ name: 'daily_started', props: { resumed: cursor > 0 } });
    generateDailyItems({ count: TOTAL, dateSeed: today, gameType }).then((list) => {
      if (cancelled) return;
      setItems(list);
      // Persist just the preflop-spot list to the challenge-store for
      // backwards compat — the store only tracks preflop spots today.
      const preflopSpots = list
        .filter((x): x is Extract<DailyItem, { kind: 'preflop' }> => x.kind === 'preflop')
        .map((x) => x.spot);
      startDay(today, preflopSpots);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDay, gameType]);

  useEffect(() => {
    if (items && cursor >= TOTAL && dateKey) completeDay();
  }, [cursor, items, dateKey, completeDay]);

  const current = items?.[cursor] ?? null;
  const isComplete = items !== null && cursor >= TOTAL;

  const handlePreflopAnswer = (action: GradedAction) => {
    if (!current || current.kind !== 'preflop') return;
    const grade = gradeAnswer(current.spot, action);
    submit(action, grade);
    const today = dateKey || isoDateKR();
    logLifetime({
      kind: 'preflop',
      spotId: current.spot.id,
      grade,
      dateKey: today,
      position: current.spot.position,
      ...(current.spot.opener ? { opener: current.spot.opener } : {}),
    });
    if (grade === 'wrong') {
      recordMistake({
        kind: 'preflop',
        spotId: current.spot.id,
        dateKey: today,
        userAnswer: action,
        grade,
        spot: current.spot,
      });
    }
    haptic(grade === 'sharp' ? 'success' : grade === 'acceptable' ? 'warn' : 'error');
    track({ name: 'answer_graded', props: { kind: 'preflop', grade } });
    setLastPreflopAnswer(action);
    setLastPostflopAnswer(null);
    setLastGrade(grade);
    setResultOpen(true);
  };

  const handlePostflopAnswer = (action: PostflopAction) => {
    if (!current || current.kind !== 'postflop') return;
    const grade = gradePostflopAction(current.spot, action);
    // Challenge-store schema only knows preflop grades — we still
    // record the grade to keep streak/accuracy running.
    submit('fold', grade); // action arg is unused for grade lookup
    const today = dateKey || isoDateKR();
    logLifetime({
      kind: 'postflop',
      spotId: current.spot.id,
      grade,
      dateKey: today,
      position: current.spot.context.heroPos,
    });
    if (grade === 'wrong') {
      recordMistake({
        kind: 'postflop',
        spotId: current.spot.id,
        dateKey: today,
        userAnswer: action,
        grade,
        spot: current.spot,
      });
    }
    haptic(grade === 'sharp' ? 'success' : grade === 'acceptable' ? 'warn' : 'error');
    track({ name: 'answer_graded', props: { kind: 'postflop', grade } });
    setLastPostflopAnswer(action);
    setLastPreflopAnswer(null);
    setLastGrade(grade);
    setResultOpen(true);
  };

  const handleNext = () => {
    setResultOpen(false);
    advance();
  };

  const handleRetry = () => {
    popLastAnswer();
    setResultOpen(false);
    setLastPreflopAnswer(null);
    setLastPostflopAnswer(null);
    setLastGrade(null);
  };

  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        {!items && <HandCardSkeleton />}

        {items && !isComplete && current && (
          <>
            <header className="mb-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                  Day {currentStreak + 1}
                </p>
                <p className="font-mono text-[12px] font-semibold">
                  {cursor + 1} / {TOTAL}
                </p>
              </div>
              <ProgressDots total={TOTAL} done={cursor} className="mt-2" />
            </header>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.kind === 'preflop' ? current.spot.id : current.spot.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {current.kind === 'preflop' ? (
                  <HandCard
                    spot={current.spot}
                    celebratePot={resultOpen && lastGrade === 'sharp'}
                  />
                ) : (
                  <PostflopHand
                    spot={current.spot}
                    celebratePot={resultOpen && lastGrade === 'sharp'}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {current.kind === 'preflop' ? (
              <ActionBar
                disabled={resultOpen}
                actions={current.spot.availableActions}
                callSize={current.spot.openSize}
                raiseSize={
                  current.spot.raiseSize ?? (current.spot.scenario === 'vs_open' ? 9 : 2.5)
                }
                onAnswer={handlePreflopAnswer}
              />
            ) : (
              <div
                className="safe-bottom mt-5 grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${current.spot.availableActions.length}, minmax(0, 1fr))`,
                }}
              >
                {current.spot.availableActions.map((a) => {
                  const compact = current.spot.availableActions.length >= 3;
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => handlePostflopAnswer(a)}
                      disabled={resultOpen}
                      className={cn(
                        'text-on-primary select-none whitespace-nowrap rounded-[var(--radius-button)] px-1 font-bold shadow-[var(--shadow-card)] transition-colors active:scale-[0.98] disabled:opacity-40',
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
          </>
        )}

        {isComplete && (
          <DailyComplete answers={answers} currentStreak={currentStreak} bestStreak={bestStreak} />
        )}

        <ResultSheet
          open={resultOpen && !!current && current.kind === 'preflop'}
          spot={current?.kind === 'preflop' ? current.spot : null}
          userAnswer={lastPreflopAnswer}
          grade={lastGrade}
          onNext={handleNext}
          onRetry={handleRetry}
          isLast={items !== null && cursor === TOTAL - 1}
        />

        {/* Postflop bottom-sheet — retry + gated teaching note. */}
        <PostflopResult
          open={resultOpen && current?.kind === 'postflop'}
          spot={current?.kind === 'postflop' ? current.spot : null}
          userAnswer={lastPostflopAnswer}
          onNext={handleNext}
          onRetry={handleRetry}
          nextLabel={cursor === TOTAL - 1 ? '결과 보기' : '다음 핸드 →'}
        />
      </main>
    </>
  );
}
