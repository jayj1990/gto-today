'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  generateDailySpots,
  gradeAnswer,
  type AnswerGrade,
  type GradedAction,
  type TrainingSpot,
} from '@gto/gto-data';
import { SiteHeader } from '@/components/site-header';
import { ProgressDots } from '@/components/today/progress-dots';
import { HandCard } from '@/components/today/hand-card';
import { ActionBar } from '@/components/today/action-bar';
import { ResultSheet } from '@/components/today/result-sheet';
import { DailyComplete } from '@/components/today/daily-complete';
import { useChallengeStore } from '@/lib/challenge-store';
import { isoDateKR } from '@/lib/date';

const TOTAL = 10;

export default function TodayPlayPage() {
  const [spots, setSpots] = useState<TrainingSpot[] | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [lastGrade, setLastGrade] = useState<AnswerGrade | null>(null);
  const [lastAnswer, setLastAnswer] = useState<GradedAction | null>(null);

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
    generateDailySpots({ count: TOTAL, dateSeed: today }).then((s) => {
      if (cancelled) return;
      setSpots(s);
      startDay(today, s);
    });
    return () => {
      cancelled = true;
    };
  }, [startDay]);

  useEffect(() => {
    if (spots && cursor >= TOTAL && dateKey) completeDay();
  }, [cursor, spots, dateKey, completeDay]);

  const current = spots?.[cursor] ?? null;
  const isComplete = spots !== null && cursor >= TOTAL;

  const handleAnswer = (action: GradedAction) => {
    if (!current) return;
    const grade = gradeAnswer(current, action);
    submit(action, grade);
    setLastAnswer(action);
    setLastGrade(grade);
    setResultOpen(true);
  };

  const handleNext = () => {
    setResultOpen(false);
    advance();
  };

  const handleRetry = () => {
    // Undo the just-submitted answer so session stats stay honest, then
    // close the result sheet; the same spot is still at cursor so the
    // user can try a different action.
    popLastAnswer();
    setResultOpen(false);
    setLastAnswer(null);
    setLastGrade(null);
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        {!spots && (
          <div className="flex flex-1 items-center justify-center">
            <p className="font-mono text-[13px] text-fg-muted">오늘의 핸드 불러오는 중…</p>
          </div>
        )}

        {spots && !isComplete && current && (
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
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <HandCard spot={current} />
              </motion.div>
            </AnimatePresence>

            <ActionBar
              disabled={resultOpen}
              actions={current.availableActions}
              callSize={current.openSize}
              raiseSize={current.scenario === 'vs_open' ? 9 : 2.5}
              onAnswer={handleAnswer}
            />
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
          open={resultOpen}
          spot={current}
          userAnswer={lastAnswer}
          grade={lastGrade}
          onNext={handleNext}
          onRetry={handleRetry}
          isLast={spots !== null && cursor === TOTAL - 1}
        />
      </main>
    </>
  );
}
