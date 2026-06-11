'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  fetchDailyPairingSpots,
  listPostflopSpots,
  POSTFLOP_ACTION_COLOR,
  POSTFLOP_ACTION_LABEL,
  type PostflopAction,
  type PostflopSpot,
} from '@gto/gto-data';
import { cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { PostflopHand } from '@/components/today/postflop-hand';
import { PostflopResult } from '@/components/today/postflop-result';
import { isoDateKR } from '@/lib/date';

/**
 * Stand-alone post-flop training loop. Walks a 20-spot date-seeded
 * sample from today's pairing chunk (runtime fetch, session-cached;
 * handcrafted seeds as offline fallback). Uses the shared
 * PostflopResult bottom-sheet so retry + gated teaching-note behave
 * identically to the mixed /today/play and /sim flows.
 */
const SESSION_SIZE = 20;

export default function TodayPostflopPage() {
  const [spots, setSpots] = useState<readonly PostflopSpot[] | null>(null);
  const [cursor, setCursor] = useState(0);
  const [answer, setAnswer] = useState<PostflopAction | null>(null);
  const [resultOpen, setResultOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const dateKey = isoDateKR();
    void fetchDailyPairingSpots(dateKey)
      .catch(() => [] as PostflopSpot[])
      .then((pool) => {
        if (cancelled) return;
        const source = pool.length > 0 ? pool : listPostflopSpots();
        // Date-seeded sample — same boards for everyone on a given day.
        let h = 0;
        for (let i = 0; i < dateKey.length; i++) h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
        const out: PostflopSpot[] = [];
        const step = Math.max(1, Math.floor(source.length / SESSION_SIZE));
        for (let i = 0; i < Math.min(SESSION_SIZE, source.length); i++) {
          out.push(source[(h + i * step) % source.length]!);
        }
        setSpots(out);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loaded = spots !== null;
  const spot = spots?.[cursor] ?? null;
  const isDone = loaded && cursor >= spots.length;

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
        {!loaded && (
          <p className="text-fg-muted mt-10 text-center font-mono text-[11px] uppercase tracking-[0.18em]">
            오늘의 스팟 불러오는 중…
          </p>
        )}

        {loaded && !isDone && spot && (
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
              오늘의 스팟 {spots.length}개를 모두 풀었어요. 내일 새 보드로 다시 만나요.
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
          nextLabel={loaded && cursor === spots.length - 1 ? '결과 보기' : '다음 스팟 →'}
        />
      </main>
    </>
  );
}
