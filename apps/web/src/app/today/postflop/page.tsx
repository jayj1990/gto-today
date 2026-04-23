'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  listPostflopSpots,
  POSTFLOP_ACTION_COLOR,
  POSTFLOP_ACTION_LABEL,
  type PostflopAction,
} from '@gto/gto-data';
import { cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { PostflopHand } from '@/components/today/postflop-hand';
import { PostflopResult } from '@/components/today/postflop-result';

/**
 * Stand-alone post-flop training loop. Walks through the 5 handcrafted
 * postflop seeds. Uses the shared PostflopResult bottom-sheet so retry
 * + gated teaching-note behave identically to the mixed /today/play and
 * /sim flows.
 */
export default function TodayPostflopPage() {
  const spots = useMemo(() => listPostflopSpots(), []);
  const [cursor, setCursor] = useState(0);
  const [answer, setAnswer] = useState<PostflopAction | null>(null);
  const [resultOpen, setResultOpen] = useState(false);

  const spot = spots[cursor] ?? null;
  const isDone = cursor >= spots.length;

  const handleAnswer = (action: PostflopAction) => {
    if (!spot || resultOpen) return;
    setAnswer(action);
    setResultOpen(true);
  };

  const handleNext = () => {
    setResultOpen(false);
    setAnswer(null);
    setCursor((c) => c + 1);
  };

  const handleRetry = () => {
    setResultOpen(false);
    setAnswer(null);
  };

  const handleRestart = () => {
    setResultOpen(false);
    setAnswer(null);
    setCursor(0);
  };

  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        {!isDone && spot && (
          <>
            <header className="mb-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
                포스트플랍 훈련 · {cursor + 1} / {spots.length}
              </p>
            </header>

            <AnimatePresence mode="wait">
              <PostflopHand key={spot.id} spot={spot} />
            </AnimatePresence>

            <div
              className="mt-4 grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${spot.availableActions.length}, minmax(0, 1fr))`,
              }}
            >
              {spot.availableActions.map((a) => {
                const compact = spot.availableActions.length >= 3;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleAnswer(a)}
                    disabled={resultOpen}
                    className={cn(
                      'text-on-primary whitespace-nowrap rounded-[var(--radius-button)] px-1 font-bold shadow-[var(--shadow-card)] active:scale-[0.98] disabled:opacity-50',
                      compact ? 'h-12 text-[12px]' : 'h-14 text-[14px]',
                    )}
                    style={{ background: POSTFLOP_ACTION_COLOR[a] }}
                  >
                    {POSTFLOP_ACTION_LABEL[a]}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {isDone && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
              포스트플랍 훈련 완료
            </p>
            <h1 className="font-display mt-3 text-[36px] font-bold tracking-[-0.02em]">
              오늘도 한 걸음
            </h1>
            <p className="text-body text-fg-muted mt-3">
              5개 스팟 모두 풀었어요. 자주 나오는 결정 타입을 한 바퀴 돌았습니다.
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="bg-gold-gradient text-noir mt-8 h-12 rounded-[var(--radius-button)] px-6 font-semibold"
            >
              다시 돌기
            </button>
          </div>
        )}

        <PostflopResult
          open={resultOpen}
          spot={spot}
          userAnswer={answer}
          onNext={handleNext}
          onRetry={handleRetry}
          nextLabel={cursor === spots.length - 1 ? '결과 보기' : '다음 스팟 →'}
        />
      </main>
    </>
  );
}
