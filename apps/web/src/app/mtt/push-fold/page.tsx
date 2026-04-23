'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PUSH_FOLD_20BB,
  PUSH_FOLD_POSITIONS,
  type PushFoldEntry,
  type PushFoldPosition,
  type TrainingSpot,
} from '@gto/gto-data';
import type { CardCode, ComboKey, Position } from '@gto/poker-core';
import { RangeGrid, cn, type ComboMix } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { HandCard } from '@/components/today/hand-card';
import { ActionBar, type ActionKind } from '@/components/today/action-bar';
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
            올인/폴드
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
            aria-pressed={mode === 'chart'}
            className={cn(
              'inline-flex h-10 items-center rounded-[calc(var(--radius-button)-2px)] px-4 font-mono text-[12px] transition-colors',
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
            aria-pressed={mode === 'train'}
            className={cn(
              'inline-flex h-10 items-center rounded-[calc(var(--radius-button)-2px)] px-4 font-mono text-[12px] transition-colors',
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
                aria-pressed={active}
                aria-label={`${p} 포지션 푸시/폴드 차트`}
                className={cn(
                  'inline-flex h-11 items-center rounded-[var(--radius-button)] border px-3 font-mono text-[12px] whitespace-nowrap',
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
        {pos} · 올인 <span className="text-fg font-semibold">{pushCount}</span>개 / 169
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
          포지션 탭을 누르면 그 자리에서 올인해도 되는 핸드가 레드로 표시돼요.
          블루는 폴드. 스택이 얕을수록 레인지가 넓어지고, SB가 가장 공격적.
        </p>
        <p className="mt-2 text-[11px]">
          ※ BB 디펜스 / vs 올인 콜 레인지는 추후 업데이트 예정.
        </p>
      </div>
    </>
  );
}

/* ─────────── Training mode — same UI as daily quiz (HandCard) ─────────── */

function TrainView() {
  const [spot, setSpot] = useState<TrainingSpot | null>(null);
  const [feedback, setFeedback] = useState<null | { correct: boolean; shouldPush: boolean }>(
    null,
  );
  const [sharp, setSharp] = useState(0);
  const [wrong, setWrong] = useState(0);

  const next = useCallback(() => {
    setSpot(makeSpot());
    setFeedback(null);
  }, []);

  useEffect(() => {
    next();
  }, [next]);

  const onAnswer = (action: ActionKind) => {
    if (!spot || feedback) return;
    // Only allin / fold are legal in push-fold. Map the button press
    // to our binary correctness check.
    const user: 'allin' | 'fold' = action === 'allin' ? 'allin' : 'fold';
    const shouldPush = spot.gtoRaise === 1;
    const correct =
      (user === 'allin' && shouldPush) || (user === 'fold' && !shouldPush);
    haptic(correct ? 'success' : 'error');
    if (correct) setSharp((v) => v + 1);
    else setWrong((v) => v + 1);
    setFeedback({ correct, shouldPush });
  };

  const total = sharp + wrong;
  const accuracy = total === 0 ? 0 : Math.round((sharp / total) * 100);

  if (!spot) return null;

  return (
    <div>
      <dl className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="정답" value={sharp} tone="call" />
        <Stat label="오답" value={wrong} tone="raise" />
        <Stat label="정확도" value={`${accuracy}%`} tone="gold" />
      </dl>

      <AnimatePresence mode="wait">
        <motion.div
          key={spot.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.26 }}
        >
          <HandCard spot={spot} celebratePot={feedback?.correct === true} />
        </motion.div>
      </AnimatePresence>

      {!feedback ? (
        <ActionBar
          actions={spot.availableActions}
          onAnswer={onAnswer}
          className="mt-3"
        />
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
            GTO: {feedback.shouldPush ? '올인' : '폴드'}
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

/** Build a TrainingSpot that the regular HandCard / ActionBar happily
 *  accept. Push-fold is binary, so we piggyback on the 'rfi' scenario
 *  (fold/raise) and swap the raise button for 'allin' via
 *  availableActions. HandCard's PokerTable auto-folds every seat
 *  before the hero for RFI spots, which is exactly the short-stack
 *  "all fold to you" setup we want. */
function makeSpot(): TrainingSpot {
  const position = PUSH_FOLD_POSITIONS[
    Math.floor(Math.random() * PUSH_FOLD_POSITIONS.length)
  ]!;
  const chart = PUSH_FOLD_20BB[position];
  const combos = Object.keys(chart);
  const combo = combos[Math.floor(Math.random() * combos.length)]! as ComboKey;
  const entry = chart[combo] as PushFoldEntry;
  const hero = comboToCards(combo);
  const rnd = Math.random().toString(36).slice(2, 8);
  return {
    id: `pushfold-${position}-${combo}-${rnd}`,
    combo,
    hero,
    position: position as Position,
    format: '6max',
    stackBB: 20,
    scenario: 'rfi',
    gtoRaise: entry.push,
    gtoFold: entry.fold,
    correctAnswer: entry.push === 1 ? 'raise' : 'fold',
    availableActions: ['fold', 'allin'],
  };
}

const SUITS = ['s', 'h', 'd', 'c'] as const;

function comboToCards(combo: string): readonly [CardCode, CardCode] {
  const hi = combo[0]!;
  const lo = combo[1]!;
  const kind = combo[2];
  if (!kind) {
    return [`${hi}s`, `${lo}h`] as unknown as readonly [CardCode, CardCode];
  }
  if (kind === 's') {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)]!;
    return [`${hi}${suit}`, `${lo}${suit}`] as unknown as readonly [CardCode, CardCode];
  }
  return [`${hi}s`, `${lo}h`] as unknown as readonly [CardCode, CardCode];
}
