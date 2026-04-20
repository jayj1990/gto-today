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
import { useChallengeStore } from '@/lib/challenge-store';
import { isoDateKR } from '@/lib/date';

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

  useEffect(() => {
    let cancelled = false;
    const today = isoDateKR();
    generateDailyItems({ count: TOTAL, dateSeed: today }).then((list) => {
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
  }, [startDay]);

  useEffect(() => {
    if (items && cursor >= TOTAL && dateKey) completeDay();
  }, [cursor, items, dateKey, completeDay]);

  const current = items?.[cursor] ?? null;
  const isComplete = items !== null && cursor >= TOTAL;

  const handlePreflopAnswer = (action: GradedAction) => {
    if (!current || current.kind !== 'preflop') return;
    const grade = gradeAnswer(current.spot, action);
    submit(action, grade);
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
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        {!items && (
          <div className="flex flex-1 items-center justify-center">
            <p className="font-mono text-[13px] text-fg-muted">오늘의 핸드 불러오는 중…</p>
          </div>
        )}

        {items && !isComplete && current && (
          <>
            <header className="mb-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                  오늘 · Day {currentStreak + 1}
                </p>
                <p className="font-mono text-[13px] font-semibold">
                  {cursor + 1} / {TOTAL}
                </p>
              </div>
              <ProgressDots total={TOTAL} done={cursor} className="mt-3" />
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
                  <HandCard spot={current.spot} />
                ) : (
                  <PostflopHand spot={current.spot} />
                )}
              </motion.div>
            </AnimatePresence>

            {current.kind === 'preflop' ? (
              <ActionBar
                disabled={resultOpen}
                actions={current.spot.availableActions}
                callSize={current.spot.openSize}
                raiseSize={current.spot.scenario === 'vs_open' ? 9 : 2.5}
                onAnswer={handlePreflopAnswer}
              />
            ) : (
              <div
                className={cn(
                  'safe-bottom mt-5 grid gap-2',
                  current.spot.availableActions.length === 2 ? 'grid-cols-2' : 'grid-cols-3',
                )}
              >
                {current.spot.availableActions.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handlePostflopAnswer(a)}
                    disabled={resultOpen}
                    className="h-14 select-none rounded-[var(--radius-button)] text-[14px] font-semibold text-ivory transition-colors disabled:opacity-40 active:scale-[0.98]"
                    style={{
                      background: POSTFLOP_ACTION_COLOR[a],
                      color:
                        a.startsWith('bet') || a.startsWith('raise')
                          ? 'var(--color-noir)'
                          : 'var(--color-ivory)',
                    }}
                  >
                    {POSTFLOP_ACTION_LABEL[a]}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {isComplete && (
          <DailyComplete
            answers={answers}
            currentStreak={currentStreak}
            bestStreak={bestStreak}
          />
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

        {/* Postflop result — simple inline banner since ResultSheet is
            tied to preflop TrainingSpot shape. */}
        {resultOpen && current?.kind === 'postflop' && lastGrade && lastPostflopAnswer && (
          <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-lg rounded-t-[var(--radius-panel)] surface-raised border-hair border-t px-6 pt-6 pb-8 shadow-[var(--shadow-panel)]">
            <div
              className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--color-border)]"
              aria-hidden
            />
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-fg-muted">
              {current.spot.context.heroPos} · {current.spot.street}
            </p>
            <h2
              className="mt-1 font-display text-[28px] font-bold leading-tight tracking-[-0.02em]"
              style={{
                color:
                  lastGrade === 'sharp'
                    ? 'var(--color-call)'
                    : lastGrade === 'acceptable'
                      ? 'var(--color-info)'
                      : 'var(--color-raise)',
              }}
            >
              {lastGrade === 'sharp'
                ? '정확해요'
                : lastGrade === 'acceptable'
                  ? '괜찮아요'
                  : '다른 선택이 더 유리했어요'}
            </h2>
            <p className="mt-2 text-[13px] text-fg-muted">
              내 선택:{' '}
              <span className="text-fg">{POSTFLOP_ACTION_LABEL[lastPostflopAnswer]}</span>
            </p>
            <div className="mt-4 rounded-[var(--radius-button)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/10 px-4 py-3 text-[12px] leading-[1.55] text-fg">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                왜 그런지
              </p>
              {current.spot.teachingNote}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="mt-5 h-14 w-full rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)]"
            >
              {cursor === TOTAL - 1 ? '결과 보기' : '다음 핸드 →'}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
