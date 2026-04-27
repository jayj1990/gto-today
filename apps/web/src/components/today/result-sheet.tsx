'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChipToss, MixBar, cn, playWin, type MixBarSegment } from '@gto/ui';
import { sheetUp } from '@gto/ui/motion';
import type { AnswerGrade, GradedAction, TrainingSpot } from '@gto/gto-data';
import { track } from '@/lib/analytics';
import { readCached, writeCached } from '@/lib/explain-client-cache';

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
  allin: '올인',
};

/**
 * Return 이/가 based on the word's final meaningful Hangul syllable.
 *
 * Walk backwards past decorative punctuation / whitespace — so labels
 * like "레이즈 (스몰)" resolve on "몰" (batchim ㄹ → 이) instead of
 * on the closing paren (non-Hangul → "가"). Stops at a digit or
 * meaningful non-Hangul symbol and falls back to "가" then, since the
 * reader voices the symbol itself (e.g. "33%가" is read "퍼센트가").
 */
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

/** Pick the single highest-frequency GTO action for a spot. Handles
 *  every scenario (rfi / vs_open / vs_3bet / vs_4bet / vs_squeeze /
 *  vs_allin) by comparing whatever action frequencies are populated. */
function dominantAction(spot: TrainingSpot): GradedAction {
  if (spot.scenario === 'rfi') {
    return spot.gtoRaise > 0.5 ? 'raise' : 'fold';
  }
  const mix = {
    fold: spot.gtoFold,
    call: spot.gtoCall ?? 0,
    raise: spot.gtoRaise,
    allin: spot.gtoAllIn ?? 0,
  };
  const max = Math.max(mix.fold, mix.call, mix.raise, mix.allin);
  if (max === mix.raise) return 'raise';
  if (max === mix.call) return 'call';
  if (max === mix.allin) return 'allin';
  return 'fold';
}

/** Segment builder — picks the action set visible on this scenario
 *  and drops actions with freq < 1% so the bar doesn't show "0.0%"
 *  rows that carry no information. */
function buildSegments(spot: TrainingSpot, top: GradedAction | null): MixBarSegment[] {
  const raw: Array<{ label: string; value: number; color: string; action: GradedAction }> = [
    { label: '레이즈', value: spot.gtoRaise * 100, color: 'var(--color-raise)', action: 'raise' },
    { label: '콜', value: (spot.gtoCall ?? 0) * 100, color: 'var(--color-call)', action: 'call' },
    { label: '폴드', value: spot.gtoFold * 100, color: 'var(--color-fold)', action: 'fold' },
    {
      label: '올인',
      value: (spot.gtoAllIn ?? 0) * 100,
      color: 'var(--color-raise-deep)',
      action: 'allin',
    },
  ];
  // RFI has no call/allin concept — mirror the legacy 2-row behaviour.
  const visible =
    spot.scenario === 'rfi'
      ? raw.filter((s) => s.action === 'raise' || s.action === 'fold')
      : spot.scenario === 'vs_allin'
        ? raw.filter((s) => s.action === 'call' || s.action === 'fold')
        : raw.filter((s) => s.value >= 1);
  return visible.map(({ action, ...seg }) => ({ ...seg, dominant: top === action }));
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

  // AI explain — opt-in, gated behind a button so the /api/explain
  // call (and its cost) only fires when the user asks.
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainError, setExplainError] = useState<string | null>(null);
  // Reset not just on spot change but also when userAnswer or grade
  // flips — retry keeps spot.id stable and the prior answer's AI
  // explanation must disappear the moment the user picks again.
  //
  // On (re-)mount with a new spot we immediately try the client-side
  // localStorage cache. A hit short-circuits the whole flow: no
  // spinner, no button press, the explanation renders inline. The
  // server-side Redis cache is still the source of truth; this just
  // saves the round-trip for same-device repeats.
  useEffect(() => {
    setExplainError(null);
    setExplaining(false);
    if (!spot) {
      setExplanation(null);
      return;
    }
    const cached = readCached({ spotId: spot.id, userAnswer: userAnswer ?? null, locale: 'ko' });
    setExplanation(cached);
  }, [spot, userAnswer, grade]);

  // Dialog-grade keyboard handling: ESC advances (same as a swipe-down
  // dismiss) so power users aren't forced to reach for the CTA. Enter
  // does the same since the sheet has one primary action.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.key === 'Enter' && !e.repeat)) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onNext]);

  // Win chime — fires once when the sheet opens for a sharp grade.
  // Pairs with the ChipToss visual for a clean correct-answer beat.
  useEffect(() => {
    if (open && grade === 'sharp') playWin();
  }, [open, grade]);

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
      const data = (await res.json()) as { text?: string; error?: string; cached?: boolean };
      if (!res.ok) setExplainError(data.error ?? '해설을 불러오지 못했어요');
      else if (data.text) {
        setExplanation(data.text);
        writeCached({ spotId: spot.id, userAnswer: userAnswer ?? null, locale: 'ko' }, data.text);
        track({ name: 'explain_opened', props: { cached: data.cached === true } });
      }
    } catch {
      setExplainError('네트워크 오류로 해설을 불러오지 못했어요');
    } finally {
      setExplaining(false);
    }
  };
  const segments: MixBarSegment[] = spot ? buildSegments(spot, top) : [];

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
              'surface-raised border-hair rounded-t-[var(--radius-panel)] border-t',
              'safe-sticky-bottom px-6 pt-6 shadow-[var(--shadow-panel)]',
              'touch-pan-y',
            )}
          >
            <div
              className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--color-border)]"
              aria-hidden
            />

            <p className="text-fg-muted font-mono text-[12px] uppercase tracking-[0.2em]">
              {spot.scenario === 'vs_open'
                ? `${spot.position} vs ${spot.opener} · ${spot.combo}`
                : `${spot.position} · ${spot.combo}`}
            </p>
            <div className="relative">
              <h2
                id="result-title"
                className="font-display mt-1 text-[30px] font-bold leading-tight tracking-[-0.02em]"
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
              <ChipToss show={grade === 'sharp'} />
            </div>
            <p className="text-fg-muted mt-2 text-[13px]">{headline.subtitle}</p>

            <div className="border-hair surface mt-6 rounded-[var(--radius-button)] p-4">
              <p className="text-fg-muted mb-3 font-mono text-[11px] uppercase tracking-[0.18em]">
                GTO 믹스
              </p>
              <MixBar
                segments={segments}
                highlightColor={grade === 'acceptable' ? 'var(--color-call)' : 'var(--color-gold)'}
              />
              {userAnswer && (
                <p className="text-fg-muted mt-4 font-mono text-[12px]">
                  내 선택: <span className="text-fg">{ACTION_LABEL[userAnswer]}</span>
                </p>
              )}
            </div>

            {/* AI explain — opt-in, small secondary CTA below the mix. */}
            <div className="mt-3">
              {!explanation && !explaining && !explainError && (
                <button
                  type="button"
                  onClick={fetchExplanation}
                  className="border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/8 w-full rounded-[var(--radius-button)] border px-3 py-2.5 text-[12px] font-medium text-[color:var(--color-accent)] active:scale-[0.98]"
                >
                  AI 코치의 해설 보기
                </button>
              )}
              {explaining && (
                <div className="border-hair surface text-fg-muted rounded-[var(--radius-button)] px-3 py-2.5 text-center font-mono text-[11px]">
                  해설 작성 중…
                </div>
              )}
              {explainError && (
                <div className="border-[color:var(--color-raise)]/40 bg-[color:var(--color-raise)]/5 flex items-center justify-between gap-2 rounded-[var(--radius-button)] border px-3 py-2 text-[11px] text-[color:var(--color-raise)]">
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
                <div className="border-hair surface text-fg rounded-[var(--radius-button)] px-3 py-2.5 text-[13px] leading-[1.6]">
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
                  aria-label="다시 풀어보기"
                  className="border-hair surface-raised flex h-14 flex-1 flex-col items-center justify-center rounded-[var(--radius-button)] font-medium active:scale-[0.98]"
                >
                  <span>다시 풀어보기</span>
                  <span className="text-fg-muted mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em]">
                    연습용 · 기록 불변
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={onNext}
                className={cn(
                  'bg-gold-gradient text-noir h-14 select-none rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]',
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
