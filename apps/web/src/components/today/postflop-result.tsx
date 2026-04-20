'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  gradePostflopAction,
  POSTFLOP_ACTION_COLOR,
  POSTFLOP_ACTION_LABEL,
  type PostflopAction,
  type PostflopSpot,
} from '@gto/gto-data';
import { cn } from '@gto/ui';
import { sheetUp } from '@gto/ui/motion';

export interface PostflopResultProps {
  open: boolean;
  spot: PostflopSpot | null;
  userAnswer: PostflopAction | null;
  onNext: () => void;
  onRetry?: () => void;
  nextLabel?: string;
}

const STREET_LABEL: Record<PostflopSpot['street'], string> = {
  flop: '플랍',
  turn: '턴',
  river: '리버',
};

/**
 * Bottom-sheet result for postflop drills. Mirrors the preflop
 * ResultSheet UX:
 *   • Grade-bound headline colour (correct=green, acceptable=blue,
 *     wrong=red — never action-coloured)
 *   • GTO mix bar with unified fold=red / call=green / raise=gold
 *   • Teaching note gated behind a '해설 보기' button (not auto-shown)
 *   • Retry + next buttons side by side
 */
export function PostflopResult({
  open,
  spot,
  userAnswer,
  onNext,
  onRetry,
  nextLabel = '다음 →',
}: PostflopResultProps) {
  const [showNote, setShowNote] = useState(false);

  // Reset the reveal state every time we land on a new spot.
  useEffect(() => {
    setShowNote(false);
  }, [spot?.id]);

  if (!open || !spot || !userAnswer) return null;

  const grade = gradePostflopAction(spot, userAnswer);
  const total = Object.values(spot.mix).reduce((s, v) => s + (v ?? 0), 0);
  const gradeLabel =
    grade === 'sharp'
      ? '정확해요'
      : grade === 'acceptable'
        ? '괜찮아요'
        : '다른 선택이 더 유리했어요';
  const gradeColor =
    grade === 'sharp'
      ? 'var(--color-call)'
      : grade === 'acceptable'
        ? 'var(--color-info)'
        : 'var(--color-raise)';

  return (
    <>
      <motion.div
        key="pf-bd"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        aria-hidden
      />
      <motion.div
        key="pf-sheet"
        role="dialog"
        aria-modal="true"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={sheetUp}
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

        {/* Teaching note — gated behind a button, same pattern as the
            preflop '해설 보기' flow. */}
        <div className="mt-4">
          {!showNote ? (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="w-full rounded-[var(--radius-button)] border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent)]/10 px-4 py-3 font-medium text-[color:var(--color-accent)] active:scale-[0.98]"
            >
              해설 보기 →
            </button>
          ) : (
            <div className="rounded-[var(--radius-button)] border-hair surface px-4 py-3 text-[13px] leading-[1.6] text-fg">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                왜 그런지
              </p>
              <p className="whitespace-pre-wrap">{spot.teachingNote}</p>
            </div>
          )}
        </div>

        {/* Retry + next */}
        <div className="mt-5 mb-3 flex gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="h-14 flex-1 rounded-[var(--radius-button)] border-hair surface-raised font-medium active:scale-[0.98]"
            >
              다시 해보기
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className={cn(
              'h-14 rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98] select-none',
              onRetry ? 'flex-[2]' : 'flex-1',
            )}
          >
            {nextLabel}
          </button>
        </div>
      </motion.div>
    </>
  );
}
