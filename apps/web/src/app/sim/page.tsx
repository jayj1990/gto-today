'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  generateRandomItem,
  gradeAnswer,
  gradePostflopAction,
  POSTFLOP_ACTION_COLOR,
  POSTFLOP_ACTION_LABEL,
  type AnswerGrade,
  type GradedAction,
  type PostflopAction,
  type RandomItem,
} from '@gto/gto-data';
import type { Position } from '@gto/poker-core';
import { cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { useLiveStore } from '@/lib/live-store';
import { useChallengeStore } from '@/lib/challenge-store';
import { useMistakesStore } from '@/lib/mistakes-store';
import { useSimStore } from '@/lib/sim-store';
import { isoDateKR } from '@/lib/date';
import { haptic } from '@/lib/haptic';
import { HandCard } from '@/components/today/hand-card';
import { ActionBar } from '@/components/today/action-bar';
import { ResultSheet } from '@/components/today/result-sheet';
import { PostflopHand } from '@/components/today/postflop-hand';
import { PostflopResult } from '@/components/today/postflop-result';
import { HandCardSkeleton } from '@/components/skeleton';

const ALL_POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB'];

/**
 * Free simulation — endless GTO training loop. Mixes preflop RFI, BB
 * defense, and postflop drills so the user sees the full scenario
 * palette. No date seed — every hand is random.
 */
export default function SimPage() {
  const gameType = useLiveStore((s) => s.config.gameType);
  const [item, setItem] = useState<RandomItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [lastGrade, setLastGrade] = useState<AnswerGrade | null>(null);
  const [lastPreflopAnswer, setLastPreflopAnswer] = useState<GradedAction | null>(null);
  const [lastPostflopAnswer, setLastPostflopAnswer] = useState<PostflopAction | null>(null);

  // Session counters live in a persisted Zustand store so navigation
  // (e.g. tap into /review then back) doesn't reset the running tally.
  const sharp = useSimStore((s) => s.sharp);
  const acceptable = useSimStore((s) => s.acceptable);
  const wrong = useSimStore((s) => s.wrong);
  const recordSharp = useSimStore((s) => s.recordSharp);
  const recordAcceptable = useSimStore((s) => s.recordAcceptable);
  const recordWrong = useSimStore((s) => s.recordWrong);
  const undoLast = useSimStore((s) => s.undoLast);
  const resetSession = useSimStore((s) => s.reset);
  const total = sharp + acceptable + wrong;
  const accuracy = total === 0 ? 0 : ((sharp + acceptable) / total) * 100;

  const loadNext = useCallback(async () => {
    setLoading(true);
    const next = await generateRandomItem({
      positions: ALL_POSITIONS,
      difficulty: 'any',
      gameType,
    });
    if (next) setItem(next);
    setLoading(false);
  }, [gameType]);

  useEffect(() => {
    void loadNext();
  }, [loadNext]);

  const recordGrade = (grade: AnswerGrade) => {
    haptic(grade === 'sharp' ? 'success' : grade === 'acceptable' ? 'warn' : 'error');
    setLastGrade(grade);
    setResultOpen(true);
    if (grade === 'sharp') recordSharp();
    else if (grade === 'acceptable') recordAcceptable();
    else recordWrong();
  };

  const recordMistake = useMistakesStore((s) => s.recordMistake);

  const handlePreflopAnswer = (action: GradedAction) => {
    if (!item || item.kind !== 'preflop') return;
    const grade = gradeAnswer(item.spot, action);
    const today = isoDateKR();
    useChallengeStore.getState().logLifetime({
      kind: 'preflop',
      spotId: item.spot.id,
      grade,
      dateKey: today,
      position: item.spot.position,
      ...(item.spot.opener ? { opener: item.spot.opener } : {}),
    });
    if (grade === 'wrong') {
      recordMistake({
        kind: 'preflop',
        spotId: item.spot.id,
        dateKey: today,
        userAnswer: action,
        grade,
        spot: item.spot,
      });
    }
    setLastPreflopAnswer(action);
    setLastPostflopAnswer(null);
    recordGrade(grade);
  };

  const handlePostflopAnswer = (action: PostflopAction) => {
    if (!item || item.kind !== 'postflop') return;
    const grade = gradePostflopAction(item.spot, action);
    const today = isoDateKR();
    useChallengeStore.getState().logLifetime({
      kind: 'postflop',
      spotId: item.spot.id,
      grade,
      dateKey: today,
      position: item.spot.context.heroPos,
    });
    if (grade === 'wrong') {
      recordMistake({
        kind: 'postflop',
        spotId: item.spot.id,
        dateKey: today,
        userAnswer: action,
        grade,
        spot: item.spot,
      });
    }
    setLastPostflopAnswer(action);
    setLastPreflopAnswer(null);
    recordGrade(grade);
  };

  const handleNext = async () => {
    setResultOpen(false);
    await loadNext();
  };

  const handleRetry = () => {
    if (lastGrade) undoLast(lastGrade);
    setResultOpen(false);
    setLastPreflopAnswer(null);
    setLastPostflopAnswer(null);
    setLastGrade(null);
  };

  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
        {/* Single-line header — title + inline session strip. The
            previous 3-stat grid took ~80px of vertical space on every
            spot; the strip keeps the same numbers visible in ~24px so
            the actual hand has more room. */}
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <h1 className="font-display text-[18px] font-bold tracking-[-0.015em]">무한 GTO 훈련</h1>
          <div className="flex items-baseline gap-2 font-mono text-[11px] tabular-nums">
            <span style={{ color: 'var(--color-call)' }}>● {sharp}</span>
            <span style={{ color: 'var(--color-info)' }}>● {acceptable}</span>
            <span style={{ color: 'var(--color-raise)' }}>● {wrong}</span>
            <span className="text-fg-muted ml-1">{Math.round(accuracy)}%</span>
            {total > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('세션 기록을 초기화할까요?')) resetSession();
                }}
                aria-label="세션 초기화"
                className="text-fg-muted/60 hover:text-fg-muted ml-1.5 active:scale-95"
                title="세션 초기화"
              >
                ↺
              </button>
            )}
          </div>
        </header>

        {loading && !item && <HandCardSkeleton />}

        {item && (
          <AnimatePresence mode="wait">
            <motion.div
              key={item.kind === 'preflop' ? item.spot.id : item.spot.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {item.kind === 'preflop' ? (
                <HandCard spot={item.spot} />
              ) : (
                <PostflopHand spot={item.spot} />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {item?.kind === 'preflop' && (
          <ActionBar
            disabled={resultOpen || loading}
            actions={item.spot.availableActions}
            callSize={item.spot.openSize}
            raiseSize={item.spot.raiseSize ?? (item.spot.scenario === 'vs_open' ? 9 : 2.5)}
            onAnswer={handlePreflopAnswer}
          />
        )}

        {item?.kind === 'postflop' && (
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
                  disabled={resultOpen || loading}
                  onClick={() => handlePostflopAnswer(a)}
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

        <ResultSheet
          open={resultOpen && item?.kind === 'preflop'}
          spot={item?.kind === 'preflop' ? item.spot : null}
          userAnswer={lastPreflopAnswer}
          grade={lastGrade}
          onNext={handleNext}
          onRetry={handleRetry}
        />

        <PostflopResult
          open={resultOpen && item?.kind === 'postflop'}
          spot={item?.kind === 'postflop' ? item.spot : null}
          userAnswer={lastPostflopAnswer}
          onNext={handleNext}
          onRetry={handleRetry}
        />
      </main>
    </>
  );
}
