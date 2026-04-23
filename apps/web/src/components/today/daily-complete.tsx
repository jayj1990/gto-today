'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Chip, CountUp, cn } from '@gto/ui';
import { chipToss, fadeUp } from '@gto/ui/motion';
import type { AnswerRecord } from '@/lib/challenge-store';

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
        오늘도 한 걸음
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

      <p className="text-fg-muted mt-8 text-[13px]">내일 자정, 새 10핸드가 공개돼요.</p>
    </motion.div>
  );
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
