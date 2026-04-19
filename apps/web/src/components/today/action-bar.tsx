'use client';

import { motion } from 'framer-motion';
import { cn } from '@gto/ui';
import { pressScale } from '@gto/ui/motion';

export interface ActionBarProps {
  disabled?: boolean;
  onAnswer: (answer: 'raise' | 'fold') => void;
  className?: string;
}

/**
 * Two-button action bar anchored near the bottom of /today.
 * For Phase 4a we support Fold / Raise only; Check/Call arrive in 4b when
 * we introduce facing-raise scenarios.
 */
export function ActionBar({ disabled = false, onAnswer, className }: ActionBarProps) {
  return (
    <div
      className={cn(
        'safe-sticky-bottom sticky bottom-0 z-10 mt-6 grid grid-cols-2 gap-3 px-2',
        className,
      )}
    >
      <motion.button
        type="button"
        disabled={disabled}
        whileTap={pressScale}
        onClick={() => onAnswer('fold')}
        className="h-14 rounded-[var(--radius-button)] border-hair surface-raised font-semibold text-fg transition-colors disabled:opacity-40"
      >
        폴드
      </motion.button>
      <motion.button
        type="button"
        disabled={disabled}
        whileTap={pressScale}
        onClick={() => onAnswer('raise')}
        className="h-14 rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] disabled:opacity-40"
      >
        레이즈
      </motion.button>
    </div>
  );
}
