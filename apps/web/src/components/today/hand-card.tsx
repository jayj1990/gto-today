'use client';

import { motion } from 'framer-motion';
import { CardView, PokerTable, cn, type SeatAction } from '@gto/ui';
import type { TrainingSpot } from '@gto/gto-data';
import type { Format, Seat } from '@gto/ui';
import { POSITIONS_BY_FORMAT } from '@gto/poker-core';

export interface HandCardProps {
  spot: TrainingSpot;
  className?: string;
}

/**
 * Build the action history that gets rendered around the table.
 *
 * For a RFI scenario:
 *  - SB posts 0.5BB
 *  - BB posts 1BB
 *  - Every seat before hero folds
 *  - Hero is about to act (no entry → "yet to act" style)
 */
function rfiActions(hero: Seat, format: Format): Partial<Record<Seat, SeatAction>> {
  const order = POSITIONS_BY_FORMAT[format];
  const out: Partial<Record<Seat, SeatAction>> = {
    SB: { kind: 'post', bb: 0.5 },
    BB: { kind: 'post', bb: 1 },
  };
  const heroIdx = order.indexOf(hero);
  for (let i = 0; i < heroIdx; i++) {
    const seat = order[i] as Seat;
    // Don't overwrite a blind post (e.g. if hero is later than the blinds).
    if (!out[seat]) out[seat] = { kind: 'fold' };
  }
  return out;
}

export function HandCard({ spot, className }: HandCardProps) {
  const [c1, c2] = spot.hero;
  const r1 = c1.charAt(0);
  const s1 = c1.charAt(1) as 's' | 'h' | 'd' | 'c';
  const r2 = c2.charAt(0);
  const s2 = c2.charAt(1) as 's' | 'h' | 'd' | 'c';
  const hero = spot.position as Seat;
  const format = spot.format as Format;
  const actions = rfiActions(hero, format);
  const formatLabel = format === '6max' ? '6맥스' : format === '9max' ? '9맥스' : format;
  const foldedSeats = (Object.entries(actions) as [Seat, SeatAction][])
    .filter(([, a]) => a.kind === 'fold')
    .map(([s]) => s);
  const pot = 1.5; // SB + BB. Extended when vs-open scenarios land.

  return (
    <motion.div
      key={spot.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn(
        'rounded-[var(--radius-panel)] border-hair surface px-4 pt-4 pb-5 sm:px-5 sm:pt-5 sm:pb-6',
        className,
      )}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
          {formatLabel}
        </span>
        <div className="flex items-center gap-2">
          <Pill>{spot.position}</Pill>
          <Pill>{spot.stackBB}BB</Pill>
          <Pill>RFI</Pill>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5">
        <PokerTable
          format={format}
          hero={hero}
          actions={actions}
          heroContent={
            <div className="flex items-center gap-1">
              <CardView rank={r1} suit={s1} size="sm" deckScheme="four-color" />
              <CardView rank={r2} suit={s2} size="sm" deckScheme="four-color" />
            </div>
          }
          centerContent={
            <div className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)]/85 px-3 py-1.5 backdrop-blur-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fg-muted">
                Preflop · Pot
              </p>
              <p className="mt-0.5 text-center font-mono text-[14px] font-semibold text-[color:var(--color-accent)]">
                {pot}BB
              </p>
            </div>
          }
        />
      </div>

      {/* Pre-action summary */}
      <p className="mt-5 text-center text-[13px] text-fg-muted">
        {foldedSeats.length === 0 ? (
          <>히어로가 먼저 액션합니다.</>
        ) : (
          <>
            <span className="text-fg/70">{foldedSeats.join(' · ')}</span> 폴드 — 히어로 차례.
          </>
        )}
      </p>
    </motion.div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] px-2.5 py-[3px] font-mono text-[11px] tracking-[0.06em] text-fg">
      {children}
    </span>
  );
}
