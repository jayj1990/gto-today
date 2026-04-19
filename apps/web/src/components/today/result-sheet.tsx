'use client';

import { useEffect, useState } from 'react';
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

const ACTION_COLOR: Record<GradedAction, string> = {
  fold: 'var(--color-fold)',
  check: 'var(--color-info)',
  call: 'var(--color-call)',
  raise: 'var(--color-raise)',
};

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
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset explanation state when the spot changes.
  useEffect(() => {
    setExplanation(null);
    setError(null);
    setExplaining(false);
  }, [spot?.id]);

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

  const fetchExplanation = async () => {
    if (!spot || explaining) return;
    setExplaining(true);
    setError(null);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spot, locale: 'ko', tone: 'beginner' }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? '해설을 불러오지 못했어요.');
      } else if (data.text) {
        setExplanation(data.text);
      }
    } catch {
      setError('네트워크 오류로 해설을 불러오지 못했어요.');
    } finally {
      setExplaining(false);
    }
  };

  // Build the headline based on grade + GTO dominant action.
  const headline = (() => {
    if (!spot || !grade) return null;
    if (grade === 'sharp') {
      return {
        title: 'Sharp.',
        subtitle: '좋은 판단이에요.',
        tone: 'gold' as const,
      };
    }
    if (grade === 'acceptable') {
      return {
        title: 'Playable.',
        subtitle: '이쪽 선택도 충분히 가능해요.',
        tone: 'info' as const,
      };
    }
    // wrong
    const gto = dominantAction(spot);
    return {
      title: `${ACTION_LABEL[gto]}가 더 유리했어요`,
      subtitle: '같은 상황에서 왜 그런지 확인해 보세요.',
      tone: 'gtoColor' as const,
      gtoAction: gto,
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
              className="mt-1 font-display text-[30px] font-bold leading-tight tracking-[-0.02em]"
              style={{
                color:
                  headline.tone === 'gold'
                    ? 'var(--color-gold)'
                    : headline.tone === 'info'
                      ? 'var(--color-info)'
                      : ACTION_COLOR[headline.gtoAction],
              }}
            >
              {headline.title}
            </h2>
            <p className="mt-2 text-[13px] text-fg-muted">{headline.subtitle}</p>

            <div className="mt-6 rounded-[var(--radius-button)] border-hair surface p-4">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
                GTO 믹스
              </p>
              <MixBar segments={segments} />
              {userAnswer && (
                <p className="mt-4 font-mono text-[12px] text-fg-muted">
                  내 선택:{' '}
                  <span className="text-fg">{ACTION_LABEL[userAnswer]}</span>
                </p>
              )}
            </div>

            {/* AI explanation block */}
            <div className="mt-4">
              {!explanation && !explaining && !error && (
                <button
                  type="button"
                  onClick={fetchExplanation}
                  className="w-full rounded-[var(--radius-button)] border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent)]/10 px-4 py-3 font-medium text-[color:var(--color-accent)] active:scale-[0.98]"
                >
                  해설 보기 →
                </button>
              )}
              {explaining && (
                <div className="rounded-[var(--radius-button)] surface border-hair px-4 py-3 text-[13px] text-fg-muted">
                  AI 코치가 해설을 작성 중이에요…
                </div>
              )}
              {error && (
                <div className="rounded-[var(--radius-button)] border border-[color:var(--color-raise)]/40 bg-[color:var(--color-raise)]/10 px-4 py-3 text-[13px] text-[color:var(--color-raise)]">
                  {error}
                </div>
              )}
              {explanation && (
                <div className="rounded-[var(--radius-button)] border-hair surface px-4 py-3 text-[13px] leading-[1.6] text-fg">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                    AI 해설
                  </p>
                  <p className="whitespace-pre-wrap">{explanation}</p>
                </div>
              )}
            </div>

            {/* Action row: 다시 해보기 + 다음 핸드 */}
            <div className="mt-5 flex gap-2">
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
                {isLast ? '결과 보기' : '다음 핸드 →'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
