'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  gradePostflopAction,
  listPostflopSpots,
  POSTFLOP_ACTION_COLOR,
  POSTFLOP_ACTION_LABEL,
  type PostflopAction,
  type PostflopSpot,
} from '@gto/gto-data';
import { CardView, cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';

const STREET_LABEL = { flop: '플랍', turn: '턴', river: '리버' } as const;
const POT_LABEL = { srp: 'SRP', '3bp': '3-bet 팟', '4bp': '4-bet 팟', limped: '림프' } as const;

/**
 * Phase 5a/b — post-flop training loop.
 *
 * Uses the 5 hand-crafted post-flop seeds from @gto/gto-data. Each spot
 * is a single-decision drill (flop c-bet, flop x/r, turn barrel, river
 * bluff-catch, flop donk). User picks an action, we grade against the
 * spot's GTO mix, show the mix bar + the teaching note, advance.
 *
 * Multi-street chains (Phase 5b proper) come later — for now this loop
 * covers the same core gameplay as /today/play but for post-flop.
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

  const handleRestart = () => {
    setResultOpen(false);
    setAnswer(null);
    setCursor(0);
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        {!isDone && spot && (
          <>
            <header className="mb-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
                포스트플랍 훈련 · {cursor + 1} / {spots.length}
              </p>
              <h1 className="mt-2 font-display text-[26px] font-bold tracking-[-0.015em]">
                {STREET_LABEL[spot.street]} · {POT_LABEL[spot.context.potType]}
              </h1>
              <p className="mt-1 text-[13px] text-fg-muted">
                {spot.context.preflopSummary} · SPR {spot.context.spr.toFixed(1)} · 팟{' '}
                {spot.context.potBB}BB
              </p>
            </header>

            <AnimatePresence mode="wait">
              <motion.section
                key={spot.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.24 }}
                className="rounded-[var(--radius-panel)] border-hair surface p-5"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
                      보드
                    </p>
                    <div className="flex gap-1.5">
                      {spot.board.map((code, i) => {
                        const r = code.charAt(0);
                        const s = code.charAt(1) as 's' | 'h' | 'd' | 'c';
                        return <CardView key={i} rank={r} suit={s} size="sm" />;
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
                      내 핸드 ({spot.context.heroPos})
                    </p>
                    <div className="flex gap-1.5">
                      {spot.hero.map((code, i) => {
                        const r = code.charAt(0);
                        const s = code.charAt(1) as 's' | 'h' | 'd' | 'c';
                        return <CardView key={i} rank={r} suit={s} size="sm" />;
                      })}
                    </div>
                  </div>
                </div>

                <p className="mt-4 rounded-[var(--radius-button)] border-hair surface-raised px-3 py-2 text-[12px] text-fg-muted">
                  {spot.facingBetBB > 0
                    ? `빌런 ${spot.facingBetBB.toFixed(1)}BB 벳 → 당신 차례`
                    : '체크가 돌아왔어요 → 당신 차례'}
                </p>
              </motion.section>
            </AnimatePresence>

            {/* Action bar */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {spot.availableActions.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => handleAnswer(a)}
                  disabled={resultOpen}
                  className={cn(
                    'h-14 rounded-[var(--radius-button)] font-semibold text-ivory active:scale-[0.98] disabled:opacity-50',
                  )}
                  style={{ background: POSTFLOP_ACTION_COLOR[a] }}
                >
                  {POSTFLOP_ACTION_LABEL[a]}
                </button>
              ))}
            </div>
          </>
        )}

        {isDone && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
              포스트플랍 훈련 완료
            </p>
            <h1 className="mt-3 font-display text-[36px] font-bold tracking-[-0.02em]">
              오늘도 한 걸음
            </h1>
            <p className="mt-3 text-body text-fg-muted">
              5개 스팟 모두 풀었어요. 자주 나오는 결정 타입을 한 바퀴 돌았습니다.
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="mt-8 h-12 rounded-[var(--radius-button)] bg-gold-gradient px-6 font-semibold text-noir"
            >
              다시 돌기
            </button>
          </div>
        )}

        {/* Result sheet */}
        <AnimatePresence>
          {resultOpen && spot && answer && (
            <>
              <motion.div
                key="bd"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                aria-hidden
              />
              <motion.div
                key="sheet"
                role="dialog"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-lg',
                  'rounded-t-[var(--radius-panel)] surface-raised border-hair border-t',
                  'safe-sticky-bottom px-6 pt-6 shadow-[var(--shadow-panel)]',
                )}
              >
                <div
                  className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--color-border)]"
                  aria-hidden
                />
                <ResultContent spot={spot} userAnswer={answer} />
                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-5 mb-3 h-14 w-full rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] active:scale-[0.98]"
                >
                  {cursor === spots.length - 1 ? '결과 보기' : '다음 스팟 →'}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

function ResultContent({
  spot,
  userAnswer,
}: {
  spot: PostflopSpot;
  userAnswer: PostflopAction;
}) {
  const grade = gradePostflopAction(spot, userAnswer);
  const total = Object.values(spot.mix).reduce((s, v) => s + (v ?? 0), 0);
  const gradeLabel = grade === 'sharp' ? '정확해요' : grade === 'acceptable' ? '괜찮아요' : '다른 선택이 더 유리했어요';
  const gradeColor =
    grade === 'sharp'
      ? 'var(--color-gold)'
      : grade === 'acceptable'
        ? 'var(--color-info)'
        : 'var(--color-raise)';

  return (
    <>
      <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-fg-muted">
        {spot.context.heroPos} · {STREET_LABEL[spot.street]}
      </p>
      <h2
        className="mt-1 font-display text-[28px] font-bold leading-tight tracking-[-0.02em]"
        style={{ color: gradeColor }}
      >
        {gradeLabel}
      </h2>
      <p className="mt-2 text-[13px] text-fg-muted">
        내 선택:{' '}
        <span className="text-fg">{POSTFLOP_ACTION_LABEL[userAnswer]}</span>
      </p>

      <div className="mt-5 rounded-[var(--radius-button)] border-hair surface p-4">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          GTO 믹스 (합계 {Math.round(total * 100)}%)
        </p>
        <div className="space-y-2">
          {(Object.entries(spot.mix) as [PostflopAction, number][])
            .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
            .map(([action, freq]) => (
              <div key={action} className="flex items-center gap-3">
                <span className="w-24 font-mono text-[12px] text-fg-muted">
                  {POSTFLOP_ACTION_LABEL[action]}
                </span>
                <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(freq ?? 0) * 100}%`,
                      background: POSTFLOP_ACTION_COLOR[action],
                    }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-[12px] font-semibold tabular-nums">
                  {((freq ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="mt-4 rounded-[var(--radius-button)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/10 px-4 py-3 text-[12px] leading-[1.55] text-fg">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
          왜 그런지
        </p>
        {spot.teachingNote}
      </div>
    </>
  );
}
