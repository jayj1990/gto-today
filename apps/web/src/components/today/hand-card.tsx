'use client';

import { motion } from 'framer-motion';
import { CardView, PokerTable, cn } from '@gto/ui';
import { dealCard, dealContainer } from '@gto/ui/motion';
import type { TrainingSpot } from '@gto/gto-data';
import type { Format, Seat } from '@gto/ui';
import { POSITIONS_BY_FORMAT } from '@gto/poker-core';

export interface HandCardProps {
  spot: TrainingSpot;
  className?: string;
}

function foldedBefore(hero: Seat, format: Format): Seat[] {
  const order = POSITIONS_BY_FORMAT[format];
  const idx = order.indexOf(hero);
  if (idx <= 0) return [];
  return order.slice(0, idx) as Seat[];
}

/**
 * GTO Wizard-style training panel.
 *
 * Layout:
 *  - Chip row (format / position / stack / scenario)
 *  - Poker table with the hero chip anchored at bottom-center, hole cards
 *    inline to the right of the chip so players see their hand right where
 *    it would sit at a real table.
 *  - Pre-action summary ("UTG·MP 폴드 — 히어로 차례입니다")
 *
 * No sticky-bottom overlap: ActionBar is a sibling below this panel, not
 * an overlay.
 */
export function HandCard({ spot, className }: HandCardProps) {
  const [c1, c2] = spot.hero;
  const r1 = c1.charAt(0);
  const s1 = c1.charAt(1) as 's' | 'h' | 'd' | 'c';
  const r2 = c2.charAt(0);
  const s2 = c2.charAt(1) as 's' | 'h' | 'd' | 'c';
  const hero = spot.position as Seat;
  const format = spot.format as Format;
  const folded = foldedBefore(hero, format);
  const formatLabel = format === '6max' ? '6맥스' : format === '9max' ? '9맥스' : format;

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

      {/* Table with hero cards docked at hero seat */}
      <div className="mt-5">
        <PokerTable
          format={format}
          hero={hero}
          folded={folded}
          heroContent={
            <motion.div
              initial="hidden"
              animate="visible"
              variants={dealContainer}
              className="flex items-center gap-1.5"
            >
              <motion.div variants={dealCard}>
                <CardView rank={r1} suit={s1} size="sm" />
              </motion.div>
              <motion.div variants={dealCard}>
                <CardView rank={r2} suit={s2} size="sm" />
              </motion.div>
            </motion.div>
          }
          centerContent={
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
                Preflop
              </p>
              <p className="mt-0.5 font-mono text-[12px] font-semibold">{spot.combo}</p>
            </div>
          }
        />
      </div>

      {/* Pre-action summary */}
      <p className="mt-4 text-center text-[13px] text-fg-muted">
        {folded.length === 0 ? (
          '히어로가 먼저 액션합니다.'
        ) : (
          <>
            <span className="text-fg/70">{folded.join(' · ')}</span> 폴드 — 히어로 차례.
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
