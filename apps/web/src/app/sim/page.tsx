'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  generateRandomSpot,
  gradeAnswer,
  type AnswerGrade,
  type GradedAction,
  type TrainingSpot,
} from '@gto/gto-data';
import type { Position } from '@gto/poker-core';
import { SiteHeader } from '@/components/site-header';
import { HandCard } from '@/components/today/hand-card';
import { ActionBar } from '@/components/today/action-bar';
import { ResultSheet } from '@/components/today/result-sheet';

const ALL_POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB'];

type Difficulty = 'any' | 'mixed-only' | 'clear-only';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  any: '전체',
  'mixed-only': '믹스 전략만',
  'clear-only': '명확한 핸드만',
};

export default function SimPage() {
  const [spot, setSpot] = useState<TrainingSpot | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [lastGrade, setLastGrade] = useState<AnswerGrade | null>(null);
  const [lastAnswer, setLastAnswer] = useState<GradedAction | null>(null);

  const [positions, setPositions] = useState<Position[]>(ALL_POSITIONS);
  const [difficulty, setDifficulty] = useState<Difficulty>('any');

  const [sharp, setSharp] = useState(0);
  const [acceptable, setAcceptable] = useState(0);
  const [wrong, setWrong] = useState(0);
  const total = sharp + acceptable + wrong;
  const accuracy = total === 0 ? 0 : ((sharp + acceptable) / total) * 100;

  const loadNext = async () => {
    setLoading(true);
    const next = await generateRandomSpot({ positions, difficulty });
    if (next) setSpot(next);
    setLoading(false);
  };

  useEffect(() => {
    void loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (action: GradedAction) => {
    if (!spot) return;
    const grade = gradeAnswer(spot, action);
    setLastAnswer(action);
    setLastGrade(grade);
    setResultOpen(true);
    if (grade === 'sharp') setSharp((v) => v + 1);
    else if (grade === 'acceptable') setAcceptable((v) => v + 1);
    else setWrong((v) => v + 1);
  };

  const handleNext = async () => {
    setResultOpen(false);
    await loadNext();
  };

  const togglePosition = (p: Position) => {
    setPositions((cur) => {
      if (cur.includes(p)) {
        const next = cur.filter((x) => x !== p);
        return next.length === 0 ? cur : next;
      }
      return [...cur, p];
    });
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        <header className="mb-5">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
            자유 시뮬레이션
          </p>
          <h1 className="mt-2 font-display text-[28px] font-bold tracking-[-0.015em]">
            끝없는 핸드 연습
          </h1>

          <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
            <Stat label="누적" value={String(total)} />
            <Stat label="정확도" value={`${Math.round(accuracy)}%`} tone="accent" />
            <Stat label="Sharp" value={String(sharp)} tone="gold" />
            <Stat label="오답" value={String(wrong)} tone="raise" />
          </dl>
        </header>

        <section className="mb-5 space-y-3">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
              포지션
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_POSITIONS.map((p) => {
                const active = positions.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePosition(p)}
                    style={{ touchAction: 'manipulation' }}
                    className={
                      'select-none rounded-full border-hair px-3 py-1.5 text-[12px] font-mono active:scale-[0.96] ' +
                      (active
                        ? 'bg-[color:var(--color-accent)] text-noir font-semibold'
                        : 'text-fg-muted')
                    }
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
              난이도
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => {
                const active = difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    style={{ touchAction: 'manipulation' }}
                    className={
                      'select-none rounded-full border-hair px-3 py-1.5 text-[12px] active:scale-[0.96] ' +
                      (active
                        ? 'bg-[color:var(--color-accent)] text-noir font-semibold'
                        : 'text-fg-muted')
                    }
                  >
                    {DIFFICULTY_LABELS[d]}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {loading && !spot && (
          <div className="flex flex-1 items-center justify-center">
            <p className="font-mono text-[13px] text-fg-muted">불러오는 중…</p>
          </div>
        )}

        {spot && (
          <AnimatePresence mode="wait">
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <HandCard spot={spot} />
            </motion.div>
          </AnimatePresence>
        )}

        {spot && (
          <ActionBar
            disabled={resultOpen || loading}
            actions={spot.availableActions}
            callSize={spot.openSize}
            raiseSize={spot.scenario === 'vs_open' ? 9 : 2.5}
            onAnswer={handleAnswer}
          />
        )}

        <ResultSheet
          open={resultOpen}
          spot={spot}
          userAnswer={lastAnswer}
          grade={lastGrade}
          onNext={handleNext}
        />
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'accent' | 'gold' | 'raise';
}) {
  const color =
    tone === 'accent'
      ? 'text-[color:var(--color-accent)]'
      : tone === 'gold'
        ? 'text-[color:var(--color-gold)]'
        : tone === 'raise'
          ? 'text-[color:var(--color-raise)]'
          : 'text-fg';
  return (
    <div className="rounded-[var(--radius-button)] surface border-hair p-2">
      <div className={`font-mono text-[17px] font-semibold ${color}`}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
        {label}
      </div>
    </div>
  );
}
