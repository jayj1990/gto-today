'use client';

import { motion } from 'framer-motion';
import { CardView, cn } from '@gto/ui';
import { dealCard, dealContainer } from '@gto/ui/motion';
import type { TrainingSpot } from '@gto/gto-data';

export interface HandCardProps {
  spot: TrainingSpot;
  className?: string;
}

/**
 * The main "decision card" the user sees during training.
 * Shows the context line (position · stack · pot), the hero's two hole cards
 * with a staggered deal animation, and the action history summary.
 */
export function HandCard({ spot, className }: HandCardProps) {
  const [c1, c2] = spot.hero;
  const r1 = c1.charAt(0);
  const s1 = c1.charAt(1) as 's' | 'h' | 'd' | 'c';
  const r2 = c2.charAt(0);
  const s2 = c2.charAt(1) as 's' | 'h' | 'd' | 'c';
  return (
    <motion.div
      key={spot.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-panel)] border-hair bg-felt-gradient grain',
        'px-6 py-8 sm:px-10 sm:py-12',
        className,
      )}
    >
      <div className="relative z-10">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-gold-soft">
          {spot.position} · {spot.stackBB}BB · RFI
        </p>
        <p className="mt-1 text-[13px] text-ivory/70">
          폴드되어 히어로 차례. 어떻게 하시겠어요?
        </p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={dealContainer}
          className="mt-10 flex justify-center gap-3 sm:mt-14"
        >
          <motion.div variants={dealCard}>
            <CardView rank={r1} suit={s1} size="xl" />
          </motion.div>
          <motion.div variants={dealCard}>
            <CardView rank={r2} suit={s2} size="xl" />
          </motion.div>
        </motion.div>

        <p className="mt-8 text-center font-mono text-[13px] uppercase tracking-[0.18em] text-ivory/60">
          Combo · {spot.combo}
        </p>
      </div>
    </motion.div>
  );
}
