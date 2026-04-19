'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MixBar, cn, type MixBarSegment } from '@gto/ui';
import { sheetUp } from '@gto/ui/motion';
import type { AnswerGrade, GradedAction, TrainingSpot } from '@gto/gto-data';

export interface ResultSheetProps {
  open: boolean;
  spot: TrainingSpot | null;
  userAnswer: GradedAction | null;
  grade: AnswerGrade | null;
  onNext: () => void;
  isLast?: boolean;
}

const HEADLINE: Record<AnswerGrade, { title: string; tone: string; subtitle: string }> = {
  sharp: {
    title: 'Sharp.',
    tone: 'text-[color:var(--color-gold)]',
    subtitle: '정확한 판단이에요.',
  },
  acceptable: {
    title: 'Playable.',
    tone: 'text-[color:var(--color-info)]',
    subtitle: '믹스 스팟에서 선택 가능한 액션입니다.',
  },
  wrong: {
    title: '이유를 볼까요.',
    tone: 'text-[color:var(--color-raise)]',
    subtitle: '다른 선택이 더 나았어요.',
  },
};

const ACTION_LABEL: Record<GradedAction, string> = {
  fold: '폴드',
  check: '체크',
  call: '콜',
  raise: '레이즈',
};

export function ResultSheet({
  open,
  spot,
  userAnswer,
  grade,
  onNext,
  isLast = false,
}: ResultSheetProps) {
  const segments: MixBarSegment[] =
    spot?.scenario === 'vs_open'
      ? [
          { label: '레이즈', value: spot.gtoRaise * 100, color: 'var(--color-raise)' },
          { label: '콜', value: (spot.gtoCall ?? 0) * 100, color: 'var(--color-call)' },
          { label: '폴드', value: spot.gtoFold * 100, color: 'var(--color-fold)' },
        ]
      : spot
        ? [
            { label: '레이즈', value: spot.gtoRaise * 100, color: 'var(--color-raise)' },
            { label: '폴드', value: spot.gtoFold * 100, color: 'var(--color-fold)' },
          ]
        : [];

  return (
    <AnimatePresence>
      {open && spot && grade && (
        <>
          <motion.div
            key="backdrop"
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
            aria-modal="true"
            aria-labelledby="result-title"
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
              {spot.scenario === 'vs_open'
                ? `BB vs ${spot.opener} · ${spot.combo}`
                : `${spot.position} · ${spot.combo}`}
            </p>
            <h2
              id="result-title"
              className={cn(
                'mt-1 font-display text-[36px] font-bold leading-none tracking-[-0.02em]',
                HEADLINE[grade].tone,
              )}
            >
              {HEADLINE[grade].title}
            </h2>
            <p className="mt-2 text-body text-fg-muted">{HEADLINE[grade].subtitle}</p>

            <div className="mt-6 rounded-[var(--radius-button)] border-hair surface p-4">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
                GTO 믹스
              </p>
              <MixBar segments={segments} />
              {userAnswer && (
                <p className="mt-4 font-mono text-[12px] text-fg-muted">
                  당신의 선택:{' '}
                  <span className="text-fg">{ACTION_LABEL[userAnswer]}</span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onNext}
              className="mt-6 h-14 w-full rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98] select-none"
            >
              {isLast ? '결과 보기' : '다음 핸드 →'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
