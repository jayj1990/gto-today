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
  onRetry?: () => void;
  isLast?: boolean;
}

const ACTION_LABEL: Record<GradedAction, string> = {
  fold: '폴드',
  check: '체크',
  call: '콜',
  raise: '레이즈',
};

/**
 * Return 이/가 based on the word's final Hangul syllable.
 * Hangul syllables span U+AC00–U+D7A3; a final consonant exists when
 * (code - 0xAC00) % 28 !== 0. Non-Hangul falls back to 가.
 */
function particleSubject(word: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return '가';
  return (last - 0xac00) % 28 === 0 ? '가' : '이';
}


/** Pick the single highest-frequency GTO action for a spot. */
function dominantAction(spot: TrainingSpot): GradedAction {
  if (spot.scenario === 'vs_open') {
    const mix = { raise: spot.gtoRaise, call: spot.gtoCall ?? 0, fold: spot.gtoFold };
    const max = Math.max(mix.raise, mix.call, mix.fold);
    if (max === mix.raise) return 'raise';
    if (max === mix.call) return 'call';
    return 'fold';
  }
  return spot.gtoRaise > 0.5 ? 'raise' : 'fold';
}

export function ResultSheet({
  open,
  spot,
  userAnswer,
  grade,
  onNext,
  onRetry,
  isLast = false,
}: ResultSheetProps) {
  const top = spot ? dominantAction(spot) : null;
  const segments: MixBarSegment[] =
    spot?.scenario === 'vs_open'
      ? [
          {
            label: '레이즈',
            value: spot.gtoRaise * 100,
            color: 'var(--color-raise)',
            dominant: top === 'raise',
          },
          {
            label: '콜',
            value: (spot.gtoCall ?? 0) * 100,
            color: 'var(--color-call)',
            dominant: top === 'call',
          },
          {
            label: '폴드',
            value: spot.gtoFold * 100,
            color: 'var(--color-fold)',
            dominant: top === 'fold',
          },
        ]
      : spot
        ? [
            {
              label: '레이즈',
              value: spot.gtoRaise * 100,
              color: 'var(--color-raise)',
              dominant: top === 'raise',
            },
            {
              label: '폴드',
              value: spot.gtoFold * 100,
              color: 'var(--color-fold)',
              dominant: top === 'fold',
            },
          ]
        : [];

  // Build the headline based on grade. Colour is grade-bound (not
  // action-bound) so a wrong answer always reads RED even when the
  // "correct" action is call-green. Avoids the visual cue that
  // suggests the user was right.
  const headline = (() => {
    if (!spot || !grade) return null;
    if (grade === 'sharp') {
      return {
        title: '정확해요',
        subtitle: '좋은 판단이었어요.',
        tone: 'correct' as const,
      };
    }
    if (grade === 'acceptable') {
      return {
        title: '괜찮아요',
        subtitle: '다른 선택도 충분히 해볼만 해요.',
        tone: 'info' as const,
      };
    }
    // wrong
    const gto = dominantAction(spot);
    const label = ACTION_LABEL[gto];
    return {
      title: `${label}${particleSubject(label)} 더 유리했어요`,
      subtitle: '같은 상황에서 왜 그런지 확인해 보세요.',
      tone: 'wrong' as const,
    };
  })();

  return (
    <AnimatePresence>
      {open && spot && grade && headline && (
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
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 500) {
                if (onRetry) onRetry();
                else onNext();
              }
            }}
            className={cn(
              'fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-lg',
              'rounded-t-[var(--radius-panel)] surface-raised border-hair border-t',
              'safe-sticky-bottom px-6 pt-6 shadow-[var(--shadow-panel)]',
              'touch-pan-y',
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
              className="mt-1 font-display text-[30px] font-bold leading-tight tracking-[-0.02em]"
              style={{
                color:
                  headline.tone === 'correct'
                    ? 'var(--color-call)'
                    : headline.tone === 'info'
                      ? 'var(--color-info)'
                      : 'var(--color-raise)',
              }}
            >
              {headline.title}
            </h2>
            <p className="mt-2 text-[13px] text-fg-muted">{headline.subtitle}</p>

            <div className="mt-6 rounded-[var(--radius-button)] border-hair surface p-4">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
                GTO 믹스
              </p>
              <MixBar
                segments={segments}
                highlightColor={
                  grade === 'acceptable' ? 'var(--color-call)' : 'var(--color-gold)'
                }
              />
              {userAnswer && (
                <p className="mt-4 font-mono text-[12px] text-fg-muted">
                  내 선택:{' '}
                  <span className="text-fg">{ACTION_LABEL[userAnswer]}</span>
                </p>
              )}
            </div>

            {/* Action row: 다시 해보기 + 다음 핸드 */}
            <div className="mt-5 flex gap-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  aria-label="연습용 다시 풀어보기. 기록은 첫 답으로 유지됩니다."
                  className="flex h-14 flex-1 flex-col items-center justify-center rounded-[var(--radius-button)] border-hair surface-raised font-medium active:scale-[0.98]"
                >
                  <span>다시 풀어보기</span>
                  <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-fg-muted">
                    연습용 · 기록 불변
                  </span>
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
                {isLast ? '결과 보기' : '다음 핸드 →'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
