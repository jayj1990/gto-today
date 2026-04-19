'use client';

import { motion } from 'framer-motion';
import { CardView, PokerTable, cn, type SeatState } from '@gto/ui';
import type { TrainingSpot } from '@gto/gto-data';
import type { Format, Seat } from '@gto/ui';
import { POSITIONS_BY_FORMAT } from '@gto/poker-core';

export interface HandCardProps {
  spot: TrainingSpot;
  className?: string;
}

/**
 * Build the table state for a given TrainingSpot scenario.
 *  • RFI: blinds posted, pre-hero seats folded, hero about to act.
 *  • vs_open: blinds posted, opener has raised, everyone between opener
 *    and hero has folded, hero (on BB) about to act.
 */
function buildSeats(spot: TrainingSpot): {
  seats: Partial<Record<Seat, SeatState>>;
  foldedSeats: Seat[];
  pot: number;
} {
  const order = POSITIONS_BY_FORMAT[spot.format as Format];
  const out: Partial<Record<Seat, SeatState>> = {};
  const stack = spot.stackBB;

  for (const seat of order) {
    out[seat as Seat] = { stack };
  }

  // Blinds always posted
  out['SB'] = { stack: stack - 0.5, action: { kind: 'post', bb: 0.5 } };
  out['BB'] = { stack: stack - 1, action: { kind: 'post', bb: 1 } };

  const foldedSeats: Seat[] = [];
  let pot = 1.5;

  if (spot.scenario === 'vs_open' && spot.opener) {
    const openSize = spot.openSize ?? 2.5;
    const openerIdx = order.indexOf(spot.opener);
    const heroIdx = order.indexOf(spot.position);

    // Seats before opener fold
    for (let i = 0; i < openerIdx; i++) {
      const seat = order[i] as Seat;
      if (seat === 'SB' || seat === 'BB') continue;
      out[seat] = { stack, action: { kind: 'fold' } };
      foldedSeats.push(seat);
    }
    // Opener raises
    const openerSeat = spot.opener as Seat;
    out[openerSeat] = {
      stack: stack - openSize,
      action: { kind: 'raise', bb: openSize },
    };
    pot = 1.5 + openSize;
    // Seats between opener and hero fold
    for (let i = openerIdx + 1; i < heroIdx; i++) {
      const seat = order[i] as Seat;
      if (seat === 'SB' || seat === 'BB') continue;
      out[seat] = { stack, action: { kind: 'fold' } };
      foldedSeats.push(seat);
    }
    // Hero seat (BB) keeps posted blind action context
  } else {
    // RFI — seats before hero fold
    const heroIdx = order.indexOf(spot.position);
    for (let i = 0; i < heroIdx; i++) {
      const seat = order[i] as Seat;
      if (seat === 'SB' || seat === 'BB') continue;
      out[seat] = { stack, action: { kind: 'fold' } };
      foldedSeats.push(seat);
    }
  }

  return { seats: out, foldedSeats, pot };
}

export function HandCard({ spot, className }: HandCardProps) {
  const [c1, c2] = spot.hero;
  const hero = spot.position as Seat;
  const format = spot.format as Format;
  const { seats, foldedSeats, pot } = buildSeats(spot);
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
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
          {formatLabel}
        </span>
        <div className="flex items-center gap-1.5">
          <Pill>{spot.position}</Pill>
          <Pill>{spot.stackBB}BB</Pill>
          <Pill tone="accent">
            {spot.scenario === 'vs_open' ? `vs ${spot.opener}` : 'RFI'}
          </Pill>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4">
        <PokerTable
          format={format}
          hero={hero}
          toAct={hero}
          seats={seats}
          heroCards={[c1, c2]}
          renderCard={(code, size) => {
            const rank = code.charAt(0);
            const suit = code.charAt(1) as 's' | 'h' | 'd' | 'c';
            return (
              <CardView rank={rank} suit={suit} size={size} deckScheme="four-color" />
            );
          }}
          centerContent={
            <div className="flex flex-col items-center gap-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fg-muted">
                Preflop
              </p>
              <p className="font-mono text-[17px] font-bold text-fg">{pot} bb</p>
              <p className="font-mono text-[10px] tracking-[0.1em] text-[color:var(--color-accent)]">
                {spot.combo}
              </p>
            </div>
          }
        />
      </div>

      {/* Pre-action summary */}
      <p className="mt-4 text-center text-[13px] text-fg-muted">
        {spot.scenario === 'vs_open' ? (
          <>
            <span className="text-fg/80">{spot.opener}</span> 오픈 {spot.openSize}BB —
            BB 디펜스 차례.
          </>
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
