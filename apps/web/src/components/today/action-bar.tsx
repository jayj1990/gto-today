'use client';

import { motion } from 'framer-motion';
import { cn } from '@gto/ui';
import { pressScale } from '@gto/ui/motion';
import type { AvailableAction } from '@gto/gto-data';

export type ActionKind = 'fold' | 'check' | 'call' | 'raise';

export interface ActionBarProps {
  disabled?: boolean;
  /** Which actions to render, driven by the current spot's scenario. */
  actions: readonly AvailableAction[];
  /** Size to display on the call button (e.g. 2.5 for "콜 2.5BB"). */
  callSize?: number | undefined;
  /** Size to display on the raise button (3-bet size). */
  raiseSize?: number | undefined;
  onAnswer: (kind: ActionKind) => void;
  className?: string;
}

const LABELS: Record<ActionKind, string> = {
  fold: '폴드',
  check: '체크',
  call: '콜',
  raise: '레이즈',
};

// Color family matches the range-grid legend and chart-navigator:
// fold=blue, call=green, raise=red, check=neutral. Every action uses
// the same outline + translucent fill + colored text pattern so the
// set reads as a coherent family.
const TONE: Record<ActionKind, { cls: string }> = {
  fold: {
    cls: 'border border-[color:var(--color-fold)]/60 bg-[color:var(--color-fold)]/15 text-[color:var(--color-fold)] font-semibold',
  },
  check: {
    cls: 'border-hair surface-raised text-fg font-semibold',
  },
  call: {
    cls: 'border border-[color:var(--color-call)]/60 bg-[color:var(--color-call)]/15 text-[color:var(--color-call)] font-semibold',
  },
  raise: {
    cls: 'border border-[color:var(--color-raise)]/60 bg-[color:var(--color-raise)]/15 text-[color:var(--color-raise)] font-semibold',
  },
};

/**
 * Dynamic action buttons — renders only the actions available in the
 * current spot. 2 buttons (RFI: fold/raise) on a 2-col grid, 3+ buttons
 * on a wrapping flex row so mobile never squashes them.
 */
export function ActionBar({
  disabled = false,
  actions,
  callSize,
  raiseSize,
  onAnswer,
  className,
}: ActionBarProps) {
  const count = actions.length;
  return (
    <div
      className={cn(
        'safe-bottom mt-5',
        count === 2 ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-3 gap-2',
        className,
      )}
    >
      {actions.map((kind) => {
        const size = kind === 'call' ? callSize : kind === 'raise' ? raiseSize : undefined;
        const label =
          kind === 'call' && size !== undefined
            ? `${LABELS[kind]} ${size}BB`
            : kind === 'raise' && size !== undefined
              ? `${LABELS[kind]} ${size}BB`
              : LABELS[kind];
        return (
          <motion.button
            key={kind}
            type="button"
            disabled={disabled}
            whileTap={pressScale}
            onClick={() => onAnswer(kind)}
            className={cn(
              'h-14 select-none rounded-[var(--radius-button)] text-[14px] transition-colors disabled:opacity-40',
              TONE[kind].cls,
            )}
          >
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}
