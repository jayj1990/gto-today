'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  getBbDefenseStrategy,
  getPreflopStrategy,
  SUPPORTED_OPENERS,
  type TrainingSpot,
} from '@gto/gto-data';
import type { ComboKey, Position } from '@gto/poker-core';
import { CardView, cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { HandCard } from '@/components/today/hand-card';
import { useLiveStore } from '@/lib/live-store';

const RANKS: readonly string[] = [
  'A',
  'K',
  'Q',
  'J',
  'T',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  '2',
];
const SUITS: readonly { code: 's' | 'h' | 'd' | 'c'; label: string; color: string }[] = [
  { code: 's', label: '♠', color: '#F4EFE6' },
  { code: 'h', label: '♥', color: '#D63B3B' },
  { code: 'd', label: '♦', color: '#4A9EFF' },
  { code: 'c', label: '♣', color: '#2EBE6F' },
];

const POSITIONS_6MAX: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

type Scenario = 'rfi' | 'vs_open';

function comboKeyFor(c1: string, c2: string): ComboKey | null {
  if (!c1 || !c2 || c1 === c2) return null;
  const r1 = c1.charAt(0);
  const s1 = c1.charAt(1);
  const r2 = c2.charAt(0);
  const s2 = c2.charAt(1);
  const rankIdx = (r: string) => RANKS.indexOf(r);
  const [hiR, loR] = rankIdx(r1) <= rankIdx(r2) ? [r1, r2] : [r2, r1];
  if (r1 === r2) return `${hiR}${loR}` as ComboKey;
  const suffix = s1 === s2 ? 's' : 'o';
  return `${hiR}${loR}${suffix}` as ComboKey;
}

/**
 * Live-mode play screen.
 *
 * Minimal but FUNCTIONAL: pick scenario, position, and your two hole cards
 * → we look up the GTO mix and render the result using the same HandCard
 * + ResultSheet pieces the training flow uses. No randomized lineup, no
 * session scoring — this is a solver query, not a quiz.
 *
 * Phase 5+ will expand this with postflop streets and proper 3bet/4bet
 * scenarios. Right now we support the two scenarios we have data for:
 * RFI (any position) and BB vs open (UTG / CO / BTN).
 */
export default function LivePlayPage() {
  const config = useLiveStore((s) => s.config);
  const [scenario, setScenario] = useState<Scenario>('rfi');
  const [position, setPosition] = useState<Position>('BTN');
  const [opener, setOpener] = useState<Position>('BTN');
  const [card1, setCard1] = useState<string>('');
  const [card2, setCard2] = useState<string>('');
  const [spot, setSpot] = useState<TrainingSpot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const combo = useMemo(() => comboKeyFor(card1, card2), [card1, card2]);

  const canSubmit = Boolean(combo);

  const lookup = async () => {
    if (!combo) return;
    setBusy(true);
    setError(null);
    try {
      if (scenario === 'vs_open') {
        const strat = await getBbDefenseStrategy({
          combo,
          opener,
          format: '6max',
        });
        if (!strat) {
          setError('해당 시나리오 데이터를 찾을 수 없어요.');
          setSpot(null);
          return;
        }
        setSpot({
          id: `live-${Date.now()}`,
          combo,
          hero: [card1 as never, card2 as never],
          position: 'BB',
          format: '6max',
          stackBB: config.stackBB,
          scenario: 'vs_open',
          opener,
          openSize: config.openSize,
          gtoRaise: strat.raise,
          gtoFold: strat.fold,
          gtoCall: strat.call,
          correctAnswer: 'mixed',
          availableActions: ['fold', 'call', 'raise'],
        });
      } else {
        const strat = await getPreflopStrategy({
          combo,
          position,
          format: '6max',
        });
        if (!strat) {
          setError('해당 시나리오 데이터를 찾을 수 없어요.');
          setSpot(null);
          return;
        }
        setSpot({
          id: `live-${Date.now()}`,
          combo,
          hero: [card1 as never, card2 as never],
          position,
          format: '6max',
          stackBB: config.stackBB,
          scenario: 'rfi',
          gtoRaise: strat.raise,
          gtoFold: strat.fold,
          correctAnswer: 'mixed',
          availableActions: ['fold', 'raise'],
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setSpot(null);
    setCard1('');
    setCard2('');
    setError(null);
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-6">
        <header className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
              실전 모드
            </p>
            <h1 className="mt-2 font-display text-[26px] font-bold tracking-[-0.015em]">
              핸드 조회
            </h1>
            <p className="mt-1 text-[13px] text-fg-muted">
              {config.gameType === 'cash' ? '캐시' : '토너먼트'} · {config.format} ·{' '}
              {config.stackBB}BB
            </p>
          </div>
          <Link
            href="/live"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted"
          >
            설정 수정
          </Link>
        </header>

        {!spot && (
          <section className="mt-6 space-y-5">
            <FieldSet label="시나리오">
              <ChipRow>
                <Chip active={scenario === 'rfi'} onClick={() => setScenario('rfi')}>
                  RFI (내가 오픈)
                </Chip>
                <Chip active={scenario === 'vs_open'} onClick={() => setScenario('vs_open')}>
                  BB 디펜스
                </Chip>
              </ChipRow>
            </FieldSet>

            {scenario === 'rfi' ? (
              <FieldSet label="내 포지션">
                <ChipRow>
                  {POSITIONS_6MAX.filter((p) => p !== 'BB').map((p) => (
                    <Chip key={p} active={position === p} onClick={() => setPosition(p)}>
                      {p}
                    </Chip>
                  ))}
                </ChipRow>
              </FieldSet>
            ) : (
              <FieldSet label="오픈한 포지션">
                <ChipRow>
                  {SUPPORTED_OPENERS.map((p) => (
                    <Chip key={p} active={opener === p} onClick={() => setOpener(p)}>
                      {p}
                    </Chip>
                  ))}
                </ChipRow>
                <p className="mt-2 text-[11px] text-fg-muted">
                  현재 BB 디펜스 데이터는 UTG/CO/BTN 오픈 시나리오만 제공돼요.
                </p>
              </FieldSet>
            )}

            <FieldSet label="내 카드">
              <div className="flex gap-3">
                <CardPicker slot={1} value={card1} blocked={card2} onChange={setCard1} />
                <CardPicker slot={2} value={card2} blocked={card1} onChange={setCard2} />
              </div>
              {combo && (
                <p className="mt-2 font-mono text-[12px] text-[color:var(--color-accent)]">
                  콤보: {combo}
                </p>
              )}
            </FieldSet>

            {error && (
              <div className="rounded-[var(--radius-button)] border border-[color:var(--color-raise)]/40 bg-[color:var(--color-raise)]/10 px-4 py-3 text-[13px] text-[color:var(--color-raise)]">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={lookup}
              disabled={!canSubmit || busy}
              className={cn(
                'h-14 w-full rounded-[var(--radius-button)] font-semibold transition-colors active:scale-[0.98] disabled:opacity-40',
                'bg-gold-gradient text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)]',
              )}
            >
              {busy ? '조회 중…' : 'GTO 답 보기 →'}
            </button>
          </section>
        )}

        {spot && (
          <section className="mt-6 space-y-5">
            <HandCard spot={spot} />
            <ResultBlock spot={spot} />
            <button
              type="button"
              onClick={reset}
              className="h-12 w-full rounded-[var(--radius-button)] border-hair surface-raised font-medium active:scale-[0.98]"
            >
              다른 핸드 조회
            </button>
          </section>
        )}
      </main>
    </>
  );
}

/* ─────── Result display (inline, not modal) ─────── */

function ResultBlock({ spot }: { spot: TrainingSpot }) {
  const raise = spot.gtoRaise * 100;
  const call = (spot.gtoCall ?? 0) * 100;
  const fold = spot.gtoFold * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[var(--radius-panel)] border-hair surface p-5"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
        GTO 믹스
      </p>
      <ul
        className="mt-3 grid gap-y-2"
        style={{ gridTemplateColumns: '64px 1fr 56px' }}
      >
        <Row label="레이즈" value={raise} color="var(--color-raise)" />
        {spot.scenario === 'vs_open' && (
          <Row label="콜" value={call} color="var(--color-call)" />
        )}
        <Row label="폴드" value={fold} color="var(--color-fold)" />
      </ul>
    </motion.div>
  );
}

function Row({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <li className="contents">
      <span className="flex items-center font-mono text-[13px] text-fg-muted">{label}</span>
      <div className="flex items-center">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--color-border)]">
          <motion.div
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: `inset(0 ${Math.max(0, 100 - value)}% 0 0)` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 rounded-full"
            style={{ background: color }}
          />
        </div>
      </div>
      <span className="flex items-center justify-end font-mono text-[13px] font-semibold tabular-nums">
        {value.toFixed(1)}%
      </span>
    </li>
  );
}

/* ─────── Card picker ─────── */

function CardPicker({
  value,
  blocked,
  onChange,
}: {
  slot: number;
  value: string;
  blocked: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rank = value.charAt(0);
  const suit = (value.charAt(1) || 's') as 's' | 'h' | 'd' | 'c';
  return (
    <div className="flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-[88px] w-full items-center justify-center rounded-[var(--radius-button)] transition-colors active:scale-[0.98]',
          value
            ? ''
            : 'border-hair surface-raised border-dashed',
        )}
      >
        {value ? (
          <CardView rank={rank} suit={suit} size="md" deckScheme="four-color" />
        ) : (
          <span className="font-mono text-[13px] text-fg-muted">카드 선택</span>
        )}
      </button>
      {open && (
        <div className="mt-3 rounded-[var(--radius-button)] border-hair surface p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
            랭크 · 수트
          </p>
          <div className="grid grid-cols-7 gap-1">
            {RANKS.map((r) => (
              <RankButton
                key={r}
                rank={r}
                current={rank}
                onPick={(nr) => {
                  const newVal = `${nr}${suit}`;
                  if (newVal === blocked) return;
                  onChange(newVal);
                }}
              />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {SUITS.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => {
                  const r = rank || 'A';
                  const newVal = `${r}${s.code}`;
                  if (newVal === blocked) return;
                  onChange(newVal);
                }}
                className={cn(
                  'flex h-10 items-center justify-center rounded-[var(--radius-button)] text-[18px]',
                  suit === s.code
                    ? 'border border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10'
                    : 'border-hair surface-raised',
                )}
                style={{ color: s.color }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 h-9 w-full rounded-[var(--radius-button)] border-hair text-[12px]"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}

function RankButton({
  rank,
  current,
  onPick,
}: {
  rank: string;
  current: string;
  onPick: (r: string) => void;
}) {
  const active = rank === current;
  return (
    <button
      type="button"
      onClick={() => onPick(rank)}
      className={cn(
        'flex h-9 items-center justify-center rounded-[var(--radius-button)] font-mono text-[13px] font-semibold active:scale-[0.96]',
        active
          ? 'border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-noir'
          : 'border-hair surface-raised text-fg',
      )}
    >
      {rank}
    </button>
  );
}

/* ─────── Layout atoms (shared with live setup) ─────── */

function FieldSet({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
        {label}
      </p>
      {children}
    </section>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ touchAction: 'manipulation' }}
      className={cn(
        'select-none rounded-full border px-3 py-1.5 font-mono text-[12px] tracking-[0.04em] active:scale-[0.96]',
        active
          ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-noir font-semibold'
          : 'border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] text-fg-muted',
      )}
    >
      {children}
    </button>
  );
}
