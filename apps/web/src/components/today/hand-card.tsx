'use client';

import { motion } from 'framer-motion';
import { CardView, PokerTable, cn } from '@gto/ui';
import { dealCard, dealContainer } from '@gto/ui/motion';
import type { TrainingSpot } from '@gto/gto-data';
import type { Seat } from '@gto/ui';

export interface HandCardProps {
  spot: TrainingSpot;
  className?: string;
}

// 6-max action order — everyone before hero has folded for an RFI scenario.
const ORDER_6MAX: Seat[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

function foldedBefore(hero: Seat): Seat[] {
  const idx = ORDER_6MAX.indexOf(hero);
  return idx <= 0 ? [] : ORDER_6MAX.slice(0, idx);
}

/**
 * The primary training panel. Instead of just showing the hole cards on a
 * flat panel, we render an overhead poker table with the hero seat
 * highlighted in gold and pre-action seats dimmed, then dock the two hole
 * cards below the table so the decision feels situated.
 */
export function HandCard({ spot, className }: HandCardProps) {
  const [c1, c2] = spot.hero;
  const r1 = c1.charAt(0);
  const s1 = c1.charAt(1) as 's' | 'h' | 'd' | 'c';
  const r2 = c2.charAt(0);
  const s2 = c2.charAt(1) as 's' | 'h' | 'd' | 'c';
  const hero = spot.position as Seat;
  const folded = foldedBefore(hero);

  return (
    <motion.div
      key={spot.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-panel)] border-hair bg-felt-gradient grain',
        'px-4 pt-5 pb-6 sm:px-6 sm:pt-7 sm:pb-8',
        className,
      )}
    >
      {/* Context line */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-gold-soft">
          {spot.position} · {spot.stackBB}BB
        </p>
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-ivory/50">
          RFI · 6-max
        </p>
      </div>

      {/* Overhead table */}
      <div className="relative z-10">
        <PokerTable format="6max" hero={hero} folded={folded} className="mx-auto max-w-md" />
      </div>

      {/* Pre-action summary */}
      <p className="relative z-10 mt-4 text-center text-[13px] text-ivory/70">
        {folded.length === 0
          ? '히어로가 먼저 액션합니다.'
          : `${folded.join(', ')} 폴드 — 히어로 차례입니다.`}
      </p>

      {/* Hero cards dock */}
      <div className="relative z-10 mt-6">
        <p className="mb-3 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-ivory/50">
          내 카드 · {spot.combo}
        </p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={dealContainer}
          className="flex justify-center gap-3"
        >
          <motion.div variants={dealCard}>
            <CardView rank={r1} suit={s1} size="xl" />
          </motion.div>
          <motion.div variants={dealCard}>
            <CardView rank={r2} suit={s2} size="xl" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
