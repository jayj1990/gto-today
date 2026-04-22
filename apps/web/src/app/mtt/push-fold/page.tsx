'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PUSH_FOLD_20BB,
  PUSH_FOLD_POSITIONS,
  type PushFoldEntry,
  type PushFoldPosition,
} from '@gto/gto-data';
import { CardView, RangeGrid, cn, type ComboMix } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { haptic } from '@/lib/haptic';

type Mode = 'chart' | 'train';

export default function PushFoldPage() {
  const [mode, setMode] = useState<Mode>('chart');

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <header className="mb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
            MTT · 20BB
          </p>
          <h1 className="mt-1 font-display text-[24px] font-bold leading-[1.1] tracking-[-0.02em]">
            푸시/폴드
          </h1>
          <p className="mt-2 text-[13px] leading-[1.55] text-fg-muted">
            숏스택 (~20BB 이하)에서는 레이즈 사이즈 의미가 사라져요.
            <span className="text-fg">올인 or 폴드</span> 두 결정만 남습니다.
          </p>
        </header>

        <div className="mb-4 inline-flex self-start rounded-[var(--radius-button)] border-hair surface p-1">
          <button
            type="button"
            onClick={() => setMode('chart')}
            className={cn(
              'rounded-[calc(var(--radius-button)-2px)] px-4 py-1.5 font-mono text-[12px] transition-colors',
              mode === 'chart'
                ? 'bg-[color:var(--color-accent)]/20 text-[color:var(--color-accent)]'
                : 'text-fg-muted',
            )}
          >
            차트
          </button>
          <button
            type="button"
            onClick={() => setMode('train')}
            className={cn(
              'rounded-[calc(var(--radius-button)-2px)] px-4 py-1.5 font-mono text-[12px] transition-colors',
              mode === 'train'
                ? 'bg-[color:var(--color-accent)]/20 text-[color:var(--color-accent)]'
                : 'text-fg-muted',
            )}
          >
            훈련
          </button>
        </div>

        {mode === 'chart' ? <ChartView /> : <TrainView />}

        <nav className="mt-8 flex justify-center">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted underline-offset-4 hover:underline"
          >
            ← 홈으로
          </Link>
        </nav>
      </main>
    </>
  );
}

function ChartView() {
  const [pos, setPos] = useState<PushFoldPosition>('BTN');

  const mixes = useMemo<Record<string, ComboMix>>(() => {
    const chart = PUSH_FOLD_20BB[pos];
    const out: Record<string, ComboMix> = {};
    for (const [combo, entry] of Object.entries(chart) as Array<[string, PushFoldEntry]>) {
      out[combo] = { raise: entry.push, fold: entry.fold };
    }
    return out;
  }, [pos]);

  const pushCount = useMemo(() => {
    return (Object.values(PUSH_FOLD_20BB[pos]) as PushFoldEntry[]).filter(
      (e) => e.push === 1,
    ).length;
  }, [pos]);

  return (
    <>
      <section className="mb-3 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {PUSH_FOLD_POSITIONS.map((p: PushFoldPosition) => {
            const active = p === pos;
            const count = (Object.values(PUSH_FOLD_20BB[p]) as PushFoldEntry[]).filter(
              (e) => e.push === 1,
            ).length;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPos(p)}
                className={cn(
                  'rounded-[var(--radius-button)] border px-3 py-1.5 font-mono text-[12px] whitespace-nowrap',
                  active
                    ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)]'
                    : 'border-hair surface text-fg-muted',
                )}
              >
                {p}
                <span className="ml-1 tabular-nums opacity-80">· {count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <p className="mb-2 text-center font-mono text-[11px] text-fg-muted">
        {pos} · 푸시 <span className="text-fg font-semibold">{pushCount}</span>개 / 169
        <span className="mx-2">·</span>
        <span className="text-[color:var(--color-raise)]">올인</span> vs{' '}
        <span className="text-[color:var(--color-fold)]">폴드</span>
      </p>

      <RangeGrid mixes={mixes} />

      <div className="mt-4 rounded-[var(--radius-button)] border-hair surface p-3 text-[12px] leading-[1.55] text-fg-muted">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
          사용법
        </p>
        <p className="mt-1">
          포지션 탭을 누르면 그 자리에서 푸시해도 되는 핸드가 레드로 표시돼요.
          블루는 폴드. 스택이 얕을수록 레인지가 넓어지고, SB가 가장 공격적.
        </p>
        <p className="mt-2 text-[11px]">
          ※ BB 디펜스 / vs 푸시 콜 레인지는 추후 업데이트 예정.
        </p>
      </div>
    </>
  );
}

/* ─────────── Training mode ─────────── */

interface Quiz {
  position: PushFoldPosition;
  combo: string;
  heroCards: readonly [string, string];
  shouldPush: boolean;
}

function TrainView() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [sharp, setSharp] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<null | { correct: boolean; label: string }>(
    null,
  );

  const next = useCallback(() => {
    setQuiz(makeQuiz());
    setFeedback(null);
  }, []);

  useEffect(() => {
    next();
  }, [next]);

  const answer = (user: 'push' | 'fold') => {
    if (!quiz || feedback) return;
    const correct =
      (user === 'push' && quiz.shouldPush) || (user === 'fold' && !quiz.shouldPush);
    haptic(correct ? 'success' : 'error');
    if (correct) setSharp((v) => v + 1);
    else setWrong((v) => v + 1);
    setFeedback({
      correct,
      label: quiz.shouldPush ? '올인' : '폴드',
    });
  };

  const total = sharp + wrong;
  const accuracy = total === 0 ? 0 : Math.round((sharp / total) * 100);

  if (!quiz) return null;

  return (
    <div>
      <dl className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="정답" value={sharp} tone="call" />
        <Stat label="오답" value={wrong} tone="raise" />
        <Stat label="정확도" value={`${accuracy}%`} tone="gold" />
      </dl>

      <AnimatePresence mode="wait">
        <motion.section
          key={`${quiz.position}-${quiz.combo}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.26 }}
          className="rounded-[var(--radius-panel)] border-hair surface p-5 text-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            {quiz.position} · 20BB
          </p>
          <p className="mt-1 text-[13px] text-fg-muted">
            모두 폴드 · 히어로 차례. 올인 or 폴드?
          </p>

          <div className="mt-5 flex items-center justify-center gap-2">
            <CardView
              rank={quiz.heroCards[0][0]!}
              suit={quiz.heroCards[0][1] as 's' | 'h' | 'd' | 'c'}
              size="lg"
              deckScheme="four-color"
            />
            <CardView
              rank={quiz.heroCards[1][0]!}
              suit={quiz.heroCards[1][1] as 's' | 'h' | 'd' | 'c'}
              size="lg"
              deckScheme="four-color"
            />
          </div>
          <p className="mt-3 font-display text-[20px] font-bold tabular-nums">
            {quiz.combo}
          </p>
        </motion.section>
      </AnimatePresence>

      {!feedback ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => answer('push')}
            className="h-14 rounded-[var(--radius-button)] bg-[#7F0A1B] text-[15px] font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold)] active:scale-[0.98]"
          >
            올인
          </button>
          <button
            type="button"
            onClick={() => answer('fold')}
            className="h-14 rounded-[var(--radius-button)] bg-[color:var(--color-fold)] text-[15px] font-bold text-white shadow-[var(--shadow-card)] active:scale-[0.98]"
          >
            폴드
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mt-4 rounded-[var(--radius-panel)] border p-4 text-center',
            feedback.correct
              ? 'border-[color:var(--color-call)]/50 bg-[color:var(--color-call)]/10'
              : 'border-[color:var(--color-raise)]/50 bg-[color:var(--color-raise)]/10',
          )}
        >
          <p
            className="font-mono text-[11px] uppercase tracking-[0.24em]"
            style={{
              color: feedback.correct ? 'var(--color-call)' : 'var(--color-raise)',
            }}
          >
            {feedback.correct ? '정확해요' : '이번엔 아니었어요'}
          </p>
          <p
            className="mt-1 font-display text-[22px] font-bold"
            style={{
              color: feedback.correct ? 'var(--color-call)' : 'var(--color-raise)',
            }}
          >
            GTO: {feedback.label}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-4 inline-flex h-12 items-center rounded-[var(--radius-button)] bg-gold-gradient px-5 font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
          >
            다음 →
          </button>
        </motion.div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: 'call' | 'raise' | 'gold';
}) {
  const color =
    tone === 'call'
      ? 'var(--color-call)'
      : tone === 'raise'
        ? 'var(--color-raise)'
        : 'var(--color-gold)';
  return (
    <div className="rounded-[var(--radius-button)] border-hair surface px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
        {label}
      </p>
      <p
        className="mt-0.5 font-display text-[20px] font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}

function makeQuiz(): Quiz {
  const position = PUSH_FOLD_POSITIONS[
    Math.floor(Math.random() * PUSH_FOLD_POSITIONS.length)
  ]!;
  const chart = PUSH_FOLD_20BB[position];
  const combos = Object.keys(chart);
  const combo = combos[Math.floor(Math.random() * combos.length)]!;
  const entry = chart[combo] as PushFoldEntry;
  return {
    position,
    combo,
    heroCards: comboToCards(combo),
    shouldPush: entry.push === 1,
  };
}

const SUITS = ['s', 'h', 'd', 'c'] as const;

/** Pick a representative card pair for a 169-style combo label. */
function comboToCards(combo: string): readonly [string, string] {
  const hi = combo[0]!;
  const lo = combo[1]!;
  const kind = combo[2]; // undefined (pair), 's', or 'o'
  if (!kind) {
    // Pair — two different suits
    return [`${hi}s`, `${lo}h`];
  }
  if (kind === 's') {
    // Suited — same suit
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)]!;
    return [`${hi}${suit}`, `${lo}${suit}`];
  }
  // Offsuit — different suits
  return [`${hi}s`, `${lo}h`];
}
