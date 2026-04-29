'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
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
import { HandCard } from '@/components/today/hand-card';
import { PostflopHand } from '@/components/today/postflop-hand';
import { ActionBar } from '@/components/today/action-bar';
import { decodeSharedSpot, type SharedSpot } from '@/lib/spot-codec';

export interface ShareSpotQuizProps {
  /** Base64-encoded spot payload from the share URL (`s=...`). */
  encoded: string;
}

const GRADE_COPY: Record<AnswerGrade, { headline: string; tone: string }> = {
  sharp: { headline: '정확.', tone: 'var(--color-call)' },
  acceptable: { headline: '괜찮음.', tone: 'var(--color-info)' },
  wrong: { headline: 'Here’s why.', tone: 'var(--color-raise)' },
};

const PREFLOP_LABEL: Record<GradedAction, string> = {
  fold: '폴드',
  check: '체크',
  call: '콜',
  raise: '레이즈',
  allin: '올인',
};

/**
 * Shared-spot quiz client. The shared URL carries the FULL spot
 * payload (base64 JSON), so we just decode and render — no
 * dependency on the deterministic generator. That guarantees the
 * recipient always sees the exact hand the sharer played, even
 * months later when the solver pool / spot indices have shifted.
 *
 * The recipient solves blind: no answer / GTO answer is in the URL,
 * and we only reveal the result locally after they submit.
 */
export function ShareSpotQuiz({ encoded }: ShareSpotQuizProps) {
  const payload = useMemo<SharedSpot | null>(() => decodeSharedSpot(encoded), [encoded]);

  const [preflopAnswer, setPreflopAnswer] = useState<GradedAction | null>(null);
  const [postflopAnswer, setPostflopAnswer] = useState<PostflopAction | null>(null);
  const [grade, setGrade] = useState<AnswerGrade | null>(null);

  if (!payload) {
    return (
      <div className="border-hair surface mt-8 rounded-[var(--radius-panel)] px-5 py-6 text-center">
        <p className="text-fg-muted text-[13px]">스팟을 읽지 못했어요.</p>
        <Link
          href="/today"
          className="bg-gold-gradient text-noir mt-5 inline-flex h-12 select-none items-center justify-center rounded-[var(--radius-button)] px-5 text-[14px] font-semibold"
        >
          오늘의 퀴즈 풀기 →
        </Link>
      </div>
    );
  }

  const onPreflopAnswer = (action: GradedAction) => {
    if (payload.kind !== 'preflop') return;
    const g = gradeAnswer(payload.spot, action);
    setPreflopAnswer(action);
    setGrade(g);
  };

  const onPostflopAnswer = (action: PostflopAction) => {
    if (payload.kind !== 'postflop') return;
    const g = gradePostflopAction(payload.spot, action);
    setPostflopAnswer(action);
    setGrade(g);
  };

  const answered = grade !== null;

  return (
    <>
      <header className="mb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
          친구가 공유한 스팟
        </p>
        <p className="text-fg-muted mt-1 text-[12px]">
          오늘의 퀴즈처럼 풀어보세요. 정답은 답한 뒤에 공개됩니다.
        </p>
      </header>

      {payload.kind === 'preflop' ? (
        <HandCard spot={payload.spot} celebratePot={grade === 'sharp'} />
      ) : (
        <PostflopHand spot={payload.spot} celebratePot={grade === 'sharp'} />
      )}

      {!answered && payload.kind === 'preflop' && (
        <ActionBar
          actions={payload.spot.availableActions}
          callSize={payload.spot.openSize}
          raiseSize={payload.spot.raiseSize ?? (payload.spot.scenario === 'vs_open' ? 9 : 2.5)}
          onAnswer={onPreflopAnswer}
        />
      )}

      {!answered && payload.kind === 'postflop' && (
        <div
          className="safe-bottom mt-5 grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${payload.spot.availableActions.length}, minmax(0, 1fr))`,
          }}
        >
          {payload.spot.availableActions.map((a) => {
            const compact = payload.spot.availableActions.length >= 3;
            return (
              <button
                key={a}
                type="button"
                onClick={() => onPostflopAnswer(a)}
                className={cn(
                  'text-on-primary select-none whitespace-nowrap rounded-[var(--radius-button)] px-1 font-bold shadow-[var(--shadow-card)] transition-colors active:scale-[0.98]',
                  compact ? 'h-12 text-[12px]' : 'h-14 text-[14px]',
                )}
                style={{ background: POSTFLOP_ACTION_COLOR[a] }}
              >
                {POSTFLOP_ACTION_LABEL[a]}
              </button>
            );
          })}
        </div>
      )}

      {answered && (
        <div className="border-hair surface mt-5 rounded-[var(--radius-panel)] px-5 py-5">
          <p
            className="font-display text-[22px] font-bold leading-tight"
            style={{ color: GRADE_COPY[grade].tone }}
          >
            {GRADE_COPY[grade].headline}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
            <dt className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.18em]">
              내 답
            </dt>
            <dt className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.18em]">GTO</dt>
            <dd className="text-fg font-semibold">
              {payload.kind === 'preflop'
                ? preflopAnswer
                  ? PREFLOP_LABEL[preflopAnswer]
                  : '—'
                : postflopAnswer
                  ? POSTFLOP_ACTION_LABEL[postflopAnswer]
                  : '—'}
            </dd>
            <dd className="font-semibold text-[color:var(--color-gold)]">
              {payload.kind === 'preflop'
                ? PREFLOP_LABEL[dominantPreflop(payload.spot)]
                : POSTFLOP_ACTION_LABEL[dominantPostflop(payload.spot)]}
            </dd>
          </dl>
          <Link
            href="/today"
            className="bg-gold-gradient text-noir mt-5 flex h-14 select-none items-center justify-center rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
          >
            나도 도전 — 오늘의 퀴즈 풀기 →
          </Link>
          <Link
            href="/learn/gto"
            className="border-hair surface-raised mt-2 flex h-12 select-none items-center justify-center rounded-[var(--radius-button)] text-[14px] font-medium active:scale-[0.98]"
          >
            GTO가 뭐예요? 1분 입문
          </Link>
        </div>
      )}
    </>
  );
}

function dominantPreflop(spot: Extract<SharedSpot, { kind: 'preflop' }>['spot']): GradedAction {
  const r = spot.gtoRaise;
  const c = spot.gtoCall ?? 0;
  const f = spot.gtoFold;
  if (r >= c && r >= f) return 'raise';
  if (c >= r && c >= f) return 'call';
  return 'fold';
}

function dominantPostflop(spot: Extract<SharedSpot, { kind: 'postflop' }>['spot']): PostflopAction {
  let best: PostflopAction = 'fold';
  let bestFreq = -1;
  for (const [k, v] of Object.entries(spot.mix)) {
    if (typeof v === 'number' && v > bestFreq) {
      best = k as PostflopAction;
      bestFreq = v;
    }
  }
  return best;
}
