'use client';

import { motion } from 'framer-motion';
import { CardView, PokerTable, cn, type SeatState } from '@gto/ui';
import type { TrainingSpot } from '@gto/gto-data';
import type { Format, Seat } from '@gto/ui';
import { POSITIONS_BY_FORMAT } from '@gto/poker-core';

export interface HandCardProps {
  spot: TrainingSpot;
  className?: string;
  /** When true, the pot number runs its gold-pulse animation. */
  celebratePot?: boolean;
}

function buildSeats(spot: TrainingSpot): {
  seats: Partial<Record<Seat, SeatState>>;
  foldedSeats: Seat[];
  pot: number;
  lastBet: number;
} {
  const order = POSITIONS_BY_FORMAT[spot.format as Format];
  const out: Partial<Record<Seat, SeatState>> = {};
  const stack = spot.stackBB;

  for (const seat of order) {
    out[seat as Seat] = { stack, showBacks: true };
  }

  out['SB'] = { stack: stack - 0.5, action: { kind: 'post', bb: 0.5 }, showBacks: true };
  out['BB'] = { stack: stack - 1, action: { kind: 'post', bb: 1 }, showBacks: true };

  const foldedSeats: Seat[] = [];
  let pot = 1.5;
  let lastBet = 1;

  if (spot.scenario === 'vs_open' && spot.opener) {
    const openSize = spot.openSize ?? 2.5;
    const openerIdx = order.indexOf(spot.opener);
    const heroIdx = order.indexOf(spot.position);

    // Everyone before the opener folds (they're behind the action).
    // BB stays as hero (handled below). SB folds unless they're the
    // opener or the hero — showing SB as still alive with a 0.5 post
    // when the pot is already 2.5 to go is misleading; SB couldn't
    // be "alive" without having matched the raise.
    for (let i = 0; i < openerIdx; i++) {
      const seat = order[i] as Seat;
      if (seat === 'BB') continue;
      out[seat] = { stack, action: { kind: 'fold' }, showBacks: false };
      foldedSeats.push(seat);
    }
    const openerSeat = spot.opener as Seat;
    out[openerSeat] = {
      stack: stack - openSize,
      action: { kind: 'raise', bb: openSize },
      showBacks: true,
    };
    pot = 1.5 + openSize;
    lastBet = openSize;
    // Everyone between opener and hero also folded (didn't 3-bet, didn't call).
    for (let i = openerIdx + 1; i < heroIdx; i++) {
      const seat = order[i] as Seat;
      if (seat === 'BB') continue;
      out[seat] = { stack, action: { kind: 'fold' }, showBacks: false };
      foldedSeats.push(seat);
    }
  } else {
    // RFI — every seat before hero folded.
    const heroIdx = order.indexOf(spot.position);
    for (let i = 0; i < heroIdx; i++) {
      const seat = order[i] as Seat;
      if (seat === 'SB' || seat === 'BB') continue;
      out[seat] = { stack, action: { kind: 'fold' }, showBacks: false };
      foldedSeats.push(seat);
    }
  }

  // Hero doesn't show back cards (their real cards are rendered separately).
  out[spot.position as Seat] = { ...(out[spot.position as Seat] ?? {}), showBacks: false };

  return { seats: out, foldedSeats, pot, lastBet };
}

export function HandCard({ spot, className, celebratePot = false }: HandCardProps) {
  const [c1, c2] = spot.hero;
  const hero = spot.position as Seat;
  const format = spot.format as Format;
  const { seats, foldedSeats, pot, lastBet } = buildSeats(spot);
  const formatLabel = format === '6max' ? '6맥스' : format === '9max' ? '9맥스' : format;

  return (
    <motion.div
      key={spot.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn(
        'rounded-[var(--radius-panel)] border-hair surface px-3 pt-4 pb-5 sm:px-5 sm:pt-5 sm:pb-6',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
          MTT · {formatLabel}
        </span>
        <div className="flex items-center gap-1.5">
          <Pill>{spot.position}</Pill>
          <Pill>{spot.stackBB}BB</Pill>
          <Pill tone="accent">{scenarioPill(spot)}</Pill>
        </div>
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-call)]">
        GTO · 6max 100BB
      </p>

      <div className="mt-4">
        <PokerTable
          format={format}
          hero={hero}
          toAct={hero}
          seats={seats}
          heroCards={[c1, c2]}
          pot={pot}
          effectiveStack={spot.stackBB}
          lastBet={spot.scenario === 'vs_open' ? lastBet : undefined}
          pulsePot={celebratePot}
          renderCard={(code, size) => {
            const rank = code.charAt(0);
            const suit = code.charAt(1) as 's' | 'h' | 'd' | 'c';
            return (
              <CardView rank={rank} suit={suit} size={size} deckScheme="four-color" />
            );
          }}
        />
      </div>

      {/* Pre-action ribbon (3bet / 4bet / squeeze pots) */}
      {spot.preActions && spot.preActions.length > 1 && (
        <p className="mt-2 text-center font-mono text-[11px] text-[color:var(--color-gold)]">
          {preActionRibbon(spot)} · 팟 {spot.potBB ?? '?'}BB
        </p>
      )}

      <p className="mt-4 text-center text-[13px] text-fg-muted">
        {spot.scenario === 'vs_open' ? (
          <></>
        ) : foldedSeats.length === 0 ? (
          <>히어로가 먼저 액션합니다.</>
        ) : (
          <>
            <span className="text-fg/80">{foldedSeats.join(' · ')}</span> 폴드 — 히어로 차례.
          </>
        )}
      </p>
    </motion.div>
  );
}

function scenarioPill(spot: TrainingSpot): string {
  switch (spot.scenario) {
    case 'rfi':
      return 'RFI';
    case 'vs_open':
      return `vs ${spot.opener}`;
    case 'vs_3bet':
      return '3벳 방어';
    case 'vs_4bet':
      return '4벳 방어';
    case 'vs_squeeze':
      return '스퀴즈';
    case 'vs_allin':
      return '올인 방어';
    default:
      return 'Spot';
  }
}

function preActionRibbon(spot: TrainingSpot): string {
  if (!spot.preActions || spot.preActions.length === 0) return '';
  const parts = spot.preActions
    .filter((p) => p.action !== 'FOLD')
    .map((p) => {
      if (p.action === 'Call') return `${p.actor} 콜`;
      if (p.action === 'AllIn') return `${p.actor} 올인`;
      const m = p.action.match(/^([\d.]+)bb$/);
      if (m) return `${p.actor} ${m[1]}bb`;
      return `${p.actor} ${p.action}`;
    });
  return parts.join(' · ');
}

function Pill({ children, tone }: { children: React.ReactNode; tone?: 'accent' }) {
  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-[3px] font-mono text-[11px] tracking-[0.06em]',
        tone === 'accent'
          ? 'border-[color:var(--color-accent)]/50 bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]'
          : 'border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] text-fg',
      )}
    >
      {children}
    </span>
  );
}
