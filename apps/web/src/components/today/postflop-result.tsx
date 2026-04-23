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
import { ChipToss, cn } from '@gto/ui';
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

// 이/가 selector — walks back past decorative punctuation so labels
// like "레이즈 (스몰)" resolve on 몰 (batchim ㄹ → 이) rather than
// on the closing paren. See result-sheet.tsx for the full doc.
const DECOR_RE = /[\s()[\]{}.,;:!?·…'"`]/;
function particleSubject(word: string): string {
  for (let i = word.length - 1; i >= 0; i--) {
    const ch = word.charAt(i);
    const code = word.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      return (code - 0xac00) % 28 === 0 ? '가' : '이';
    }
    if (!DECOR_RE.test(ch)) break;
  }
  return '가';
}

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
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainError, setExplainError] = useState<string | null>(null);
  useEffect(() => {
    setExplanation(null);
    setExplainError(null);
    setExplaining(false);
  }, [spot?.id, userAnswer]);

  const fetchExplanation = async () => {
    if (!spot || explaining) return;
    setExplaining(true);
    setExplainError(null);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spot, userAnswer, locale: 'ko', tone: 'beginner' }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) setExplainError(data.error ?? '해설을 불러오지 못했어요');
      else if (data.text) setExplanation(data.text);
    } catch {
      setExplainError('네트워크 오류로 해설을 불러오지 못했어요');
    } finally {
      setExplaining(false);
    }
  };

  if (!open || !spot || !userAnswer) return null;


  const grade = gradePostflopAction(spot, userAnswer);
  const total = Object.values(spot.mix).reduce((s, v) => s + (v ?? 0), 0);

  // Display the mix rows in button order (same order the user saw the
  // action buttons) — matches intuition better than frequency-sorting.
  // topAction is still derived from frequency, since that's the
  // "correct GTO" signal used for the wrong-answer headline.
  const orderedMix = spot.availableActions.map(
    (a) => [a, spot.mix[a] ?? 0] as [PostflopAction, number],
  );
  const topAction = (Object.entries(spot.mix) as [PostflopAction, number][])
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0]?.[0];
  const topLabel = topAction ? POSTFLOP_ACTION_LABEL[topAction] : '';

  const gradeLabel =
    grade === 'sharp'
      ? '정확해요'
      : grade === 'acceptable'
        ? '괜찮아요'
        : topAction
          ? `${topLabel}${particleSubject(topLabel)} 더 유리했어요`
          : '다른 선택이 더 유리했어요';
  const gradeSubtitle =
    grade === 'sharp'
      ? '좋은 판단이었어요.'
      : grade === 'acceptable'
        ? '다른 선택도 충분히 해볼만 해요.'
        : '왜 그런지 해설에서 확인해 보세요.';
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
          {spot.context.heroPos} · {STREET_LABEL[spot.street]}
        </p>
        <div className="relative">
          <h2
            className="mt-1 font-display text-[28px] font-bold leading-tight tracking-[-0.02em]"
            style={{ color: gradeColor }}
          >
            {gradeLabel}
          </h2>
          <ChipToss show={grade === 'sharp'} />
        </div>
        <p className="mt-2 text-[13px] text-fg-muted">{gradeSubtitle}</p>
        <p className="mt-1 text-[13px] text-fg-muted">
          내 선택:{' '}
          <span className="text-fg">{POSTFLOP_ACTION_LABEL[userAnswer]}</span>
        </p>

        <div className="mt-5 rounded-[var(--radius-button)] border-hair surface p-4">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
            GTO 믹스 (합계 {Math.round(total * 100)}%)
          </p>
          <div className="space-y-2">
            {orderedMix.map(([action, freq]) => {
              const isTop = action === topAction && (freq ?? 0) > 0;
              const color = POSTFLOP_ACTION_COLOR[action];
              return (
                <div
                  key={action}
                  className="grid items-center gap-3"
                  style={{ gridTemplateColumns: '72px minmax(0, 1fr) 56px' }}
                >
                  <span
                    className={cn(
                      'text-right font-mono',
                      isTop ? 'text-[13px] font-bold text-white' : 'text-[12px] text-fg-muted',
                    )}
                  >
                    {POSTFLOP_ACTION_LABEL[action]}
                  </span>
                  <div className="relative h-3 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(freq ?? 0) * 100}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-right font-mono tabular-nums',
                      isTop
                        ? 'text-[13px] font-bold text-white'
                        : 'text-[12px] font-semibold text-fg-muted',
                    )}
                  >
                    {((freq ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI coach explanation — opt-in. Pre-written teachingNote
            was removed per Jay: duplicated with the AI path and the
            hand-crafted copy looked low-effort next to it. */}
        <div className="mt-3">
          {!explanation && !explaining && !explainError && (
            <button
              type="button"
              onClick={fetchExplanation}
              className="w-full rounded-[var(--radius-button)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/8 px-3 py-2.5 text-[12px] font-medium text-[color:var(--color-accent)] active:scale-[0.98]"
            >
              AI 코치의 해설 보기
            </button>
          )}
          {explaining && (
            <div className="rounded-[var(--radius-button)] border-hair surface px-3 py-2.5 text-center font-mono text-[11px] text-fg-muted">
              해설 작성 중…
            </div>
          )}
          {explainError && (
            <div className="flex items-center justify-between gap-2 rounded-[var(--radius-button)] border border-[color:var(--color-raise)]/40 bg-[color:var(--color-raise)]/5 px-3 py-2 text-[11px] text-[color:var(--color-raise)]">
              <span className="min-w-0 flex-1 truncate">{explainError}</span>
              <button
                type="button"
                onClick={fetchExplanation}
                className="shrink-0 underline underline-offset-2"
              >
                재시도
              </button>
            </div>
          )}
          {explanation && (
            <div className="rounded-[var(--radius-button)] border-hair surface px-3 py-2.5 text-[13px] leading-[1.6] text-fg">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                AI 해설
              </p>
              <p className="whitespace-pre-wrap">{explanation}</p>
            </div>
          )}
        </div>

        {/* Retry + next */}
        <div className="mt-5 mb-3 flex gap-2">
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
            {nextLabel}
          </button>
        </div>
      </motion.div>
    </>
  );
}
