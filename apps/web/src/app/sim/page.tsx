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

  const [sharp, setSharp] = useState(0);
  const [acceptable, setAcceptable] = useState(0);
  const [wrong, setWrong] = useState(0);
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
    if (grade === 'sharp') setSharp((v) => v + 1);
    else if (grade === 'acceptable') setAcceptable((v) => v + 1);
    else setWrong((v) => v + 1);
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
    if (lastGrade === 'sharp') setSharp((v) => Math.max(0, v - 1));
    else if (lastGrade === 'acceptable') setAcceptable((v) => Math.max(0, v - 1));
    else if (lastGrade === 'wrong') setWrong((v) => Math.max(0, v - 1));
    setResultOpen(false);
    setLastPreflopAnswer(null);
    setLastPostflopAnswer(null);
    setLastGrade(null);
  };

  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
        <header className="mb-3">
          <div className="flex items-baseline justify-between">
            <h1 className="font-display text-[20px] font-bold tracking-[-0.015em]">
              무한 GTO 훈련
            </h1>
            <p className="text-fg-muted font-mono text-[11px]">
              {total} · 정확도 {Math.round(accuracy)}%
            </p>
          </div>
          <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
            <Stat label="정답" value={String(sharp)} tone="gold" />
            <Stat label="차선" value={String(acceptable)} tone="accent" />
            <Stat label="오답" value={String(wrong)} tone="raise" />
          </dl>
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

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'accent' | 'gold' | 'raise';
}) {
  const color =
    tone === 'accent'
      ? 'text-[color:var(--color-accent)]'
      : tone === 'gold'
        ? 'text-[color:var(--color-gold)]'
        : tone === 'raise'
          ? 'text-[color:var(--color-raise)]'
          : 'text-fg';
  return (
    <div className="surface border-hair rounded-[var(--radius-button)] p-2">
      <div className={`font-mono text-[17px] font-semibold ${color}`}>{value}</div>
      <div className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.14em]">{label}</div>
    </div>
  );
}
