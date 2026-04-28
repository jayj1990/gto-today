'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Chip, CountUp, cn } from '@gto/ui';
import { chipToss, fadeUp } from '@gto/ui/motion';
import type { AnswerRecord } from '@/lib/challenge-store';
import { shareOrCopy } from '@/lib/share';

export interface DailyCompleteProps {
  answers: AnswerRecord[];
  currentStreak: number;
  bestStreak: number;
  className?: string;
}

/**
 * Shown after all 10 hands are answered. Accuracy + streak update +
 * chip-toss celebration. Invites the user back tomorrow.
 */
export function DailyComplete({
  answers,
  currentStreak,
  bestStreak,
  className,
}: DailyCompleteProps) {
  const sharp = answers.filter((a) => a.grade === 'sharp').length;
  const acceptable = answers.filter((a) => a.grade === 'acceptable').length;
  const wrong = answers.filter((a) => a.grade === 'wrong').length;
  const accuracy = answers.length === 0 ? 0 : ((sharp + acceptable) / answers.length) * 100;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className={cn('mx-auto max-w-lg text-center', className)}
    >
      <div className="relative mx-auto h-32 w-40">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={chipToss}
            initial="rest"
            animate="toss"
            className="absolute left-1/2 top-1/2"
            style={{ translate: '-50% -50%' }}
          >
            <Chip value={i === 2 ? 'GT' : i * 10} tone={i % 2 ? 'raise' : 'gold'} size="md" />
          </motion.div>
        ))}
      </div>

      <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
        오늘의 훈련 완료
      </p>
      <h1 className="font-display mt-3 text-[42px] font-bold leading-none tracking-[-0.02em]">
        {headline(accuracy)}
      </h1>
      <p className="text-body text-fg-muted mt-3">
        {currentStreak === 1 ? '연속 훈련을 시작했어요.' : `${currentStreak}일 연속, 꾸준합니다.`}
      </p>

      <dl className="mt-10 grid grid-cols-3 gap-4 text-left">
        <Stat label="정확도" value={`${Math.round(accuracy)}%`} />
        <Stat label="연속" value={`${currentStreak}일`} />
        <Stat label="최장" value={`${bestStreak}일`} />
      </dl>

      <ul className="text-fg-muted mt-8 flex justify-center gap-3 font-mono text-[13px]">
        <li>
          <span className="text-[color:var(--color-gold)]">●</span> 정답 <CountUp value={sharp} />
        </li>
        <li>
          <span className="text-[color:var(--color-info)]">●</span> 무난{' '}
          <CountUp value={acceptable} />
        </li>
        <li>
          <span className="text-[color:var(--color-raise)]">●</span> 오답 <CountUp value={wrong} />
        </li>
      </ul>

      {wrong > 0 ? (
        <div className="mt-10 flex flex-col gap-2">
          <Link
            href="/review"
            className="bg-gold-gradient text-noir flex h-14 select-none items-center justify-between rounded-[var(--radius-button)] px-5 font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
          >
            <span>오답 {wrong}개 바로 복습</span>
            <span aria-hidden>→</span>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/sim"
              className="border-hair surface-raised flex h-12 select-none items-center justify-center rounded-[var(--radius-button)] px-4 text-[13px] font-medium active:scale-[0.98]"
            >
              자유 연습
            </Link>
            <Link
              href="/"
              className="border-hair surface-raised flex h-12 select-none items-center justify-center rounded-[var(--radius-button)] px-4 text-[13px] font-medium active:scale-[0.98]"
            >
              홈으로
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sim"
            className="bg-gold-gradient text-noir h-12 select-none rounded-[var(--radius-button)] px-5 py-3 font-semibold active:scale-[0.98]"
          >
            자유 연습 이어서
          </Link>
          <Link
            href="/"
            className="border-hair h-12 select-none rounded-[var(--radius-button)] px-5 py-3 font-medium active:scale-[0.98]"
          >
            홈으로
          </Link>
        </div>
      )}

      <ShareRow
        sharp={sharp}
        acceptable={acceptable}
        wrong={wrong}
        accuracy={accuracy}
        currentStreak={currentStreak}
      />

      <Link
        href="/stats"
        className="text-fg-muted mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
      >
        전체 통계 보기 →
      </Link>

      <p className="text-fg-muted mt-6 text-[13px]">내일 자정, 새 10핸드가 공개돼요.</p>
    </motion.div>
  );
}

function ShareRow({
  sharp,
  acceptable,
  wrong,
  accuracy,
  currentStreak,
}: {
  sharp: number;
  acceptable: number;
  wrong: number;
  accuracy: number;
  currentStreak: number;
}) {
  const [status, setStatus] = useState<'idle' | 'shared' | 'copied' | 'failed'>('idle');

  const onShare = async () => {
    const total = sharp + acceptable + wrong;
    const accuracyText = `${Math.round(accuracy)}%`;
    const text = [
      `오늘의 GTO 훈련 완료`,
      `정확도 ${accuracyText} · 정답 ${sharp} · 차선 ${acceptable} · 오답 ${wrong} · ${total}핸드`,
      currentStreak > 0 ? `${currentStreak}일 연속 훈련 중` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const result = await shareOrCopy({
      title: 'GTO Today',
      text,
      url: 'https://gto.today',
    });

    if (result === 'share') setStatus('shared');
    else if (result === 'clipboard') setStatus('copied');
    else setStatus('failed');
    window.setTimeout(() => setStatus('idle'), 2400);
  };

  const label =
    status === 'copied'
      ? '복사됨 — 어디든 붙여넣기'
      : status === 'shared'
        ? '공유 완료'
        : status === 'failed'
          ? '공유 실패 — 다시 시도'
          : '결과 공유';

  return (
    <button
      type="button"
      onClick={onShare}
      aria-live="polite"
      className={cn(
        'mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-[var(--radius-button)] border px-4 font-mono text-[11px] uppercase tracking-[0.18em] active:scale-[0.97]',
        status === 'copied'
          ? 'border-[color:var(--color-call)]/40 bg-[color:var(--color-call)]/10 text-[color:var(--color-call)]'
          : status === 'failed'
            ? 'border-[color:var(--color-raise)]/40 bg-[color:var(--color-raise)]/10 text-[color:var(--color-raise)]'
            : 'border-hair surface-raised text-fg hover:bg-[color:var(--color-surface-raised)]',
      )}
    >
      <span aria-hidden>↗</span>
      {label}
    </button>
  );
}

/**
 * Tone-shifted headline so the celebration matches accuracy, not just
 * "completion happened". Tight bands so the gradient feels meaningful:
 *   ≥90 정확  · ≥70 좋아요  · ≥50 한 걸음  · <50 시작
 * The user's already-positive completion vibe is in the eyebrow + the
 * chip toss; the headline does the actual emotional work.
 */
function headline(accuracy: number): string {
  if (accuracy >= 90) return '정확한 하루';
  if (accuracy >= 70) return '오늘도 잘했어요';
  if (accuracy >= 50) return '오늘도 한 걸음';
  return '괜찮아요, 내일 또';
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface border-hair rounded-[var(--radius-button)] p-4 text-center">
      <dd className="text-mono-lg font-mono font-semibold">{value}</dd>
      <dt className="text-fg-muted mt-1 font-mono text-[11px] uppercase tracking-[0.16em]">
        {label}
      </dt>
    </div>
  );
}
