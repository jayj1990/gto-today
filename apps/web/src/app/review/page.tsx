'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  gradeAnswer,
  gradePostflopAction,
  POSTFLOP_ACTION_COLOR,
  POSTFLOP_ACTION_LABEL,
  type AnswerGrade,
  type GradedAction,
  type PostflopAction,
} from '@gto/gto-data';
import { cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { ActionBar, type ActionKind } from '@/components/today/action-bar';
import { HandCard } from '@/components/today/hand-card';
import { PostflopHand } from '@/components/today/postflop-hand';
import { haptic } from '@/lib/haptic';
import {
  useMistakesStore,
  type MistakeRecord,
  type PostflopMistake,
  type PreflopMistake,
} from '@/lib/mistakes-store';

const PREFLOP_ACTION_LABEL: Record<GradedAction, string> = {
  fold: '폴드',
  check: '체크',
  call: '콜',
  raise: '레이즈',
  allin: '올인',
};

type Phase = { kind: 'quiz' } | { kind: 'feedback'; grade: AnswerGrade };

export default function ReviewPage() {
  const mistakes = useMistakesStore((s) => s.mistakes);
  const resolveMistake = useMistakesStore((s) => s.resolveMistake);
  const clearAll = useMistakesStore((s) => s.clearAll);

  // Sort newest-first. Remove mistakes as they resolve so the head
  // of the queue is always the next thing to answer.
  const queue = useMemo(() => [...mistakes].sort((a, b) => b.at - a.at), [mistakes]);

  const [phase, setPhase] = useState<Phase>({ kind: 'quiz' });
  const [answered, setAnswered] = useState(0); // session-scoped counter

  const current = queue[0] ?? null;

  const advance = () => {
    setPhase({ kind: 'quiz' });
    setAnswered((n) => n + 1);
  };

  const onAnswerPreflop = (action: ActionKind) => {
    if (!current || current.kind !== 'preflop' || phase.kind !== 'quiz') return;
    const grade = gradeAnswer(current.spot, action);
    setPhase({ kind: 'feedback', grade });
    haptic(grade === 'sharp' ? 'success' : grade === 'acceptable' ? 'warn' : 'error');
    if (grade === 'sharp') {
      // Auto-resolve + advance so the user keeps moving. 1.4s gives
      // the chip-toss celebration + pot-pulse time to play.
      window.setTimeout(() => {
        resolveMistake(current.kind, current.spotId);
        advance();
      }, 1400);
    }
  };

  const onAnswerPostflop = (action: PostflopAction) => {
    if (!current || current.kind !== 'postflop' || phase.kind !== 'quiz') return;
    const grade = gradePostflopAction(current.spot, action);
    setPhase({ kind: 'feedback', grade });
    haptic(grade === 'sharp' ? 'success' : grade === 'acceptable' ? 'warn' : 'error');
    if (grade === 'sharp') {
      window.setTimeout(() => {
        resolveMistake(current.kind, current.spotId);
        advance();
      }, 1400);
    }
  };

  const onRetry = () => setPhase({ kind: 'quiz' });

  const onResolveManual = () => {
    if (!current) return;
    resolveMistake(current.kind, current.spotId);
    advance();
  };

  const onSkip = () => {
    // Keep the mistake in the queue but push it to the back. Without
    // mutating the store we just rotate the local view — re-render
    // picks up queue[0] on the next mistake after user advances.
    // Simpler MVP: treat skip == next queue item by ignoring current
    // for the session (store unchanged so tomorrow it re-appears).
    // Implementation: nudge `answered` so a remount sorts; we instead
    // use a throwaway local timestamp nudge — keep as "later" by
    // flipping to feedback-none and then letting user tap again.
    // For now, simply advance and let queue's sort resurface it.
    // Actually to skip without resolving, we just need queue index > 0.
    // Since queue is always read fresh, rotate by resolving+re-recording
    // would mutate 'at'. Simpler: hide via local state.
    skipIds.add(keyOf(current!));
    setSkipTick((t) => t + 1);
    setPhase({ kind: 'quiz' });
  };

  // Session-scoped skip list — mistakes pushed to the back for now.
  const [skipTick, setSkipTick] = useState(0);
  const skipIds = useMemo(() => new Set<string>(), []);
  void skipTick;

  const visibleQueue = queue.filter((m) => !skipIds.has(keyOf(m)));
  const visibleCurrent = visibleQueue[0] ?? null;

  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
              Review
            </p>
            <h1 className="font-display mt-1 text-[22px] font-bold leading-[1.1] tracking-[-0.02em]">
              복습 모드
            </h1>
          </div>
          <div className="text-right">
            <p className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.18em]">
              남은 오답
            </p>
            <p className="font-display text-[18px] font-bold tabular-nums">{visibleQueue.length}</p>
          </div>
        </header>

        {visibleCurrent === null ? (
          <EmptyState
            hadQueue={mistakes.length > 0}
            onResetSkips={() => {
              skipIds.clear();
              setSkipTick((t) => t + 1);
            }}
          />
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={keyOf(visibleCurrent)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {visibleCurrent.kind === 'preflop' ? (
                  <HandCard
                    spot={visibleCurrent.spot}
                    celebratePot={phase.kind === 'feedback' && phase.grade === 'sharp'}
                  />
                ) : (
                  <PostflopHand
                    spot={visibleCurrent.spot}
                    celebratePot={phase.kind === 'feedback' && phase.grade === 'sharp'}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Facing hint — mirrors today/play layout */}
            {visibleCurrent.kind === 'preflop' && (
              <p className="text-fg-muted mt-3 text-center text-[12px]">
                {visibleCurrent.spot.scenario === 'vs_open'
                  ? `${visibleCurrent.spot.opener} 오픈 · ${visibleCurrent.spot.position} 디펜스`
                  : `${visibleCurrent.spot.position} RFI`}
              </p>
            )}

            {phase.kind === 'quiz' ? (
              visibleCurrent.kind === 'preflop' ? (
                <ActionBar
                  actions={visibleCurrent.spot.availableActions}
                  callSize={visibleCurrent.spot.openSize ?? undefined}
                  raiseSize={
                    visibleCurrent.spot.raiseSize ??
                    (visibleCurrent.spot.scenario === 'vs_open' ? 9 : 2.5)
                  }
                  onAnswer={onAnswerPreflop}
                />
              ) : (
                <div
                  className="safe-bottom mt-3 grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${visibleCurrent.spot.availableActions.length}, minmax(0, 1fr))`,
                  }}
                >
                  {visibleCurrent.spot.availableActions.map((a) => {
                    const compact = visibleCurrent.spot.availableActions.length >= 3;
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => onAnswerPostflop(a)}
                        className={cn(
                          'text-on-primary select-none whitespace-nowrap rounded-[var(--radius-button)] px-1 font-bold shadow-[var(--shadow-card)] active:scale-[0.98]',
                          compact ? 'h-12 text-[12px]' : 'h-14 text-[14px]',
                        )}
                        style={{ background: POSTFLOP_ACTION_COLOR[a] }}
                      >
                        {POSTFLOP_ACTION_LABEL[a]}
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              <FeedbackPanel
                mistake={visibleCurrent}
                grade={phase.grade}
                onRetry={onRetry}
                onResolveManual={onResolveManual}
                onSkip={onSkip}
              />
            )}

            {/* Session progress footer */}
            <p className="text-fg-muted mt-4 text-center font-mono text-[11px]">
              이번 세션 · {answered}개 풀었어요
            </p>
          </>
        )}

        {mistakes.length > 0 && (
          <div className="mt-8 flex justify-between">
            <Link
              href="/"
              className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.2em] underline-offset-4 hover:underline"
            >
              ← 홈으로
            </Link>
            <button
              type="button"
              onClick={() => {
                if (confirm('모든 오답 기록을 지울까요? 되돌릴 수 없어요.')) clearAll();
              }}
              className="text-fg-muted inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.18em] active:scale-[0.96]"
            >
              전체 비우기
            </button>
          </div>
        )}
      </main>
    </>
  );
}

function EmptyState({ hadQueue, onResetSkips }: { hadQueue: boolean; onResetSkips: () => void }) {
  return (
    <section className="border-hair surface mt-6 rounded-[var(--radius-panel)] p-8 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
        Clean slate
      </p>
      <h2 className="font-display mt-2 text-[22px] font-bold tracking-[-0.015em]">
        {hadQueue ? '이번 세션 복습 완료' : '복습할 오답이 없어요'}
      </h2>
      <p className="text-fg-muted mt-2 text-[13px]">
        {hadQueue
          ? '건너뛴 오답은 다음 세션에서 다시 보여요.'
          : '오늘의 훈련이나 무한 훈련에서 새 스팟을 풀어보세요.'}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        {hadQueue && (
          <button
            type="button"
            onClick={onResetSkips}
            className="border-hair surface-raised inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] px-4 text-[14px] font-medium active:scale-[0.98]"
          >
            건너뛴 항목 다시 풀기
          </button>
        )}
        <Link
          href="/today"
          className="bg-gold-gradient text-noir inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] px-4 text-[14px] font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          오늘의 훈련
        </Link>
      </div>
    </section>
  );
}

function FeedbackPanel({
  mistake,
  grade,
  onRetry,
  onResolveManual,
  onSkip,
}: {
  mistake: MistakeRecord;
  grade: AnswerGrade;
  onRetry: () => void;
  onResolveManual: () => void;
  onSkip: () => void;
}) {
  if (grade === 'sharp') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-[color:var(--color-call)]/40 bg-[color:var(--color-call)]/10 mt-4 rounded-[var(--radius-panel)] border p-5 text-center"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-call)]">
          정확해요
        </p>
        <h2 className="font-display mt-1 text-[22px] font-bold text-[color:var(--color-call)]">
          복습 완료 · 다음 오답으로
        </h2>
      </motion.div>
    );
  }

  const gto =
    mistake.kind === 'preflop' ? dominantPreflopLabel(mistake) : dominantPostflopLabel(mistake);
  const tone = grade === 'acceptable' ? 'var(--color-info)' : 'var(--color-raise)';
  const headline = grade === 'acceptable' ? '괜찮아요' : '다음엔 이쪽이에요';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-hair surface mt-4 rounded-[var(--radius-panel)] p-4"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: tone }}>
        {headline}
      </p>
      <h2
        className="font-display mt-1 text-[22px] font-bold tracking-[-0.02em]"
        style={{ color: tone }}
      >
        GTO: {gto}
      </h2>
      {mistake.kind === 'postflop' && mistake.spot.teachingNote && (
        <p className="border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/8 text-fg mt-3 rounded-[var(--radius-button)] border p-3 text-[12px] leading-[1.55]">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
            왜 그런지
          </span>
          {mistake.spot.teachingNote}
        </p>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="border-hair surface-raised h-12 rounded-[var(--radius-button)] text-[13px] font-medium active:scale-[0.98]"
        >
          다시 시도
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="border-hair surface-raised h-12 rounded-[var(--radius-button)] text-[13px] font-medium active:scale-[0.98]"
        >
          건너뛰기
        </button>
        <button
          type="button"
          onClick={onResolveManual}
          className="bg-gold-gradient text-noir h-12 rounded-[var(--radius-button)] text-[13px] font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          이해했어요
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────── helpers ─────────── */

function keyOf(m: MistakeRecord): string {
  return `${m.kind}:${m.spotId}`;
}

function dominantPreflopLabel(m: PreflopMistake): string {
  const s = m.spot;
  if (s.scenario === 'vs_open') {
    const mix = { raise: s.gtoRaise, call: s.gtoCall ?? 0, fold: s.gtoFold };
    const max = Math.max(mix.raise, mix.call, mix.fold);
    if (max === mix.raise) return PREFLOP_ACTION_LABEL.raise;
    if (max === mix.call) return PREFLOP_ACTION_LABEL.call;
    return PREFLOP_ACTION_LABEL.fold;
  }
  return s.gtoRaise > 0.5 ? PREFLOP_ACTION_LABEL.raise : PREFLOP_ACTION_LABEL.fold;
}

function dominantPostflopLabel(m: PostflopMistake): string {
  const entries = Object.entries(m.spot.mix) as [PostflopAction, number][];
  const top = entries.reduce((a, b) => ((b[1] ?? 0) > (a[1] ?? 0) ? b : a), entries[0]!);
  return POSTFLOP_ACTION_LABEL[top[0]];
}
