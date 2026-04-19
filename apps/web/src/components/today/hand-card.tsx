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

/** Preflop RFI scenario: everyone before hero's seat has folded. */
function foldedBefore(hero: Seat, format: Format): Seat[] {
  const order = POSITIONS_BY_FORMAT[format];
  const idx = order.indexOf(hero);
  if (idx <= 0) return [];
  return order.slice(0, idx) as Seat[];
}

/**
 * Primary training panel: overhead table + hole-card dock.
 *
 * Design notes:
 *  - Outer panel is a flat dark surface so the felt-green table inside the
 *    SVG is the clear focal point. Previous version used bg-felt-gradient
 *    outside, which visually merged with the inner felt.
 *  - Table uses lg size to fill the column, with hero seat pulsing gold.
 *  - Cards are docked below the table in a separate layer with their own
 *    paper-ivory background, framed in gold hairlines.
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
        'relative rounded-[var(--radius-panel)] border-hair surface',
        'px-4 pt-4 pb-5 sm:px-5 sm:pt-5 sm:pb-6',
        className,
      )}
    >
      {/* Top chip row: format + stack + scenario */}
      <div className="flex items-center justify-between">
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
      <div className="mt-4">
        <PokerTable format={format} hero={hero} folded={folded} size="lg" />
      </div>

      {/* Pre-action summary */}
      <p className="mt-3 text-center text-[13px] text-fg-muted">
        {folded.length === 0 ? (
          <>히어로가 먼저 액션합니다.</>
        ) : (
          <>
            <span className="text-fg-muted/80">{folded.join(' · ')}</span> 폴드 —
            히어로 차례입니다.
          </>
        )}
      </p>

      {/* Hero cards */}
      <div className="mt-5 rounded-[var(--radius-button)] border-hair bg-[color:var(--color-charcoal)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
            내 카드
          </span>
          <span className="font-mono text-[11px] tracking-[0.08em] text-[color:var(--color-accent)]">
            {spot.combo}
          </span>
        </div>
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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] px-2.5 py-[3px] font-mono text-[11px] tracking-[0.06em] text-fg">
      {children}
    </span>
  );
}
